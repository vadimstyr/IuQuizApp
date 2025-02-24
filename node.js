require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool, testConnection, checkUser, getQuestions, saveQuestion } = require('./db-config');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'quiz/public')));

// Middleware zum Parsen des JSON-Body
app.use(session({
    secret: 'quiz-app-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 Stunden
    },
    proxy: true // Wichtig für Heroku
}));

/**
 * Route für die Startseite.
 * - Liefert die Login-Seite aus.
 */
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'quiz/public/html/userNameLoginIndex.html'));
});

// Test-Route für Datenbankverbindung
app.get('/api/test-db', async (req, res) => {
   const isConnected = await testConnection();
   res.json({ success: isConnected });
});

/**
 * Login-Route.
 * - Überprüft die Benutzeranmeldedaten und erstellt eine Session, wenn der Login erfolgreich ist.
 */
app.post('/api/login', async (req, res) => {
   const { email, password } = req.body;
   
   try {
       const user = await checkUser(email, password);
       if (user) {
           req.session.user = {
               email: user.email,
               id: user.id
           };
           res.json({ 
               success: true,
               email: user.email
           });
       } else {
           res.status(401).json({ 
               success: false, 
               message: 'Falsche Email oder Passwort'
           });
       }
   } catch (error) {
       console.error('Login error:', error);
       res.status(500).json({ 
           success: false, 
           message: 'Server Fehler'
       });
   }
});


/**
 * Authentifizierungsprüfung.
 * - Gibt den Login-Status des Benutzers zurück.
 */
app.get('/api/check-auth', async (req, res) => {
   if (req.session?.user?.email) {
       res.json({ 
           isLoggedIn: true,
           email: req.session.user.email
       });
   } else {
       res.json({ 
           isLoggedIn: false 
       });
   }
});

/**
 * Abrufen der vom Benutzer erstellten Fragen.
 * - Gibt alle Fragen zurück, die mit der Benutzer-Email verknüpft sind.
 */
app.get('/api/questions', async (req, res) => {
   try {
       const userEmail = req.session?.user?.email;
       
       if (!userEmail) {
           return res.json({
               success: true,
               data: [],
               message: 'Keine Benutzer-Session'
           });
       }

       const result = await getQuestions(userEmail);
       
       res.json({
           success: true,
           data: result
       });

   } catch (error) {
       console.error('Fehler beim Laden der Fragen:', error);
       res.json({
           success: false,
           data: [],
           message: 'Datenbankfehler'
       });
   }
});

/**
 * Speichern einer neuen Quizfrage.
 * - Überprüft die Eingaben und speichert die Frage in der Datenbank.
 */
app.post('/api/questions', async (req, res) => {
   console.log('Received request body:', req.body);

   try {
       if (!req.body) {
           console.log('Kein Request-Body gefunden');
           return res.status(400).json({ 
               success: false, 
               message: 'Keine Daten empfangen' 
           });
       }

       const { creator_email, question, answer_a, answer_b, answer_c, answer_d, correct_answer } = req.body;

       console.log('Erhaltene Daten:', {
           creator_email,
           question,
           answer_a,
           answer_b,
           answer_c,
           answer_d,
           correct_answer
       });

       if (!creator_email || !question || !answer_a || !answer_b || 
           !answer_c || !answer_d || !correct_answer) {
           return res.status(400).json({
               success: false,
               message: 'Alle Felder müssen ausgefüllt sein'
           });
       }

       const result = await saveQuestion({
           creator_email,
           question,
           answer_a,
           answer_b,
           answer_c,
           answer_d,
           correct_answer
       });

       res.status(200).json({
           success: true,
           data: result
       });

   } catch (error) {
       console.error('Server Error:', error);
       res.status(500).json({
           success: false,
           message: 'Fehler beim Speichern: ' + error.message
       });
   }
});

app.get('/api/my-quiz-questions', async (req, res) => {
    try {
        const userEmail = req.session?.user?.email;
        
        if (!userEmail) {
            return res.json({
                success: false,
                message: 'Nicht eingeloggt'
            });
        }

        const result = await pool.query(
            'SELECT * FROM quiz_questions WHERE creator_email = $1',
            [userEmail]
        );
        
        res.json({
            success: true,
            questions: result.rows
        });

    } catch (error) {
        console.error('Fehler beim Laden der Quiz-Fragen:', error);
        res.json({
            success: false,
            message: 'Fehler beim Laden der Fragen'
        });
    }
});
/**
 * Löschen einer Quizfrage.
 * - Überprüft, ob die Frage dem Benutzer gehört, und löscht sie.
 */
app.delete('/api/questions/:id', async (req, res) => {
    try {
        const questionId = req.params.id;
        const userEmail = req.session?.user?.email;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Nicht eingeloggt'
            });
        }

        // Prüfen ob die Frage dem Benutzer gehört und dann löschen
        const result = await pool.query(
            'DELETE FROM quiz_questions WHERE id = $1 AND creator_email = $2 RETURNING *',
            [questionId, userEmail]
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                message: 'Frage gelöscht'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Frage nicht gefunden oder keine Berechtigung'
            });
        }
    } catch (error) {
        console.error('Fehler beim Löschen der Frage:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Löschen der Frage'
        });
    }
});
/**
 * Logout-Route.
 * - Beendet die Benutzer-Session und meldet den Benutzer ab.
 */
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Fehler beim Logout'
            });
        }
        res.json({
            success: true,
            message: 'Erfolgreich ausgeloggt'
        });
    });
});

/**
 * Route für Fragen von anderen Benutzern.
 * - Gibt zufällige Fragen zurück, die nicht vom aktuellen Benutzer erstellt wurden.
 */
app.get('/api/other-questions', async (req, res) => {
    try {
        const userEmail = req.session?.user?.email;
        
        if (!userEmail) {
            console.log('Kein Benutzer in Session');
            return res.json({
                success: false,
                message: 'Nicht eingeloggt'
            });
        }

        console.log('Suche Fragen für Benutzer:', userEmail); // Debug-Log

        const result = await pool.query(`
            SELECT * FROM quiz_questions 
            WHERE creator_email != $1 
            ORDER BY RANDOM() 
            LIMIT 10
        `, [userEmail]);
        
        console.log('Gefundene Fragen:', result.rows.length); // Debug-Log

        res.json({
            success: true,
            questions: result.rows
        });

    } catch (error) {
        console.error('Fehler beim Laden der Quiz-Fragen:', error);
        res.json({
            success: false,
            message: 'Fehler beim Laden der Fragen'
        });
    }
});

// Speichern eines neuen Highscores
app.post('/api/leaderboard', async (req, res) => {
    try {
        const { score, questions_total, questions_correct } = req.body;
        const playerEmail = req.session?.user?.email;

        if (!playerEmail) {
            return res.json({
                success: false,
                message: 'Nicht eingeloggt'
            });
        }

        const result = await pool.query(
            'INSERT INTO leaderboard (player_email, score, questions_total, questions_correct) VALUES ($1, $2, $3, $4) RETURNING *',
            [playerEmail, score, questions_total, questions_correct]
        );

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Fehler beim Speichern des Highscores:', error);
        res.json({
            success: false,
            message: 'Fehler beim Speichern'
        });
    }
});

// Abrufen der Top 10 Highscores
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT player_email, score, questions_correct, questions_total FROM leaderboard ORDER BY score DESC LIMIT 10'
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Fehler beim Laden der Bestenliste:', error);
        res.json({
            success: false,
            message: 'Fehler beim Laden der Bestenliste'
        });
    }
});
app.put('/api/questions/:id', async (req, res) => {
    try {
        const questionId = req.params.id;
        const userEmail = req.session?.user?.email;
        const { question, answer_a, answer_b, answer_c, answer_d, correct_answer } = req.body;

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Nicht eingeloggt'
            });
        }

        const result = await pool.query(
            `UPDATE quiz_questions 
             SET question = $1, answer_a = $2, answer_b = $3, answer_c = $4, answer_d = $5, correct_answer = $6
             WHERE id = $7 AND creator_email = $8
             RETURNING *`,
            [question, answer_a, answer_b, answer_c, answer_d, correct_answer, questionId, userEmail]
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                data: result.rows[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Frage nicht gefunden oder keine Berechtigung'
            });
        }
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Frage:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Aktualisieren'
        });
    }
});
/**
 * Server starten.
 * - Testet die Datenbankverbindung und startet den Server.
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
   console.log(`Server läuft auf Port ${PORT}`);
   await testConnection();
});