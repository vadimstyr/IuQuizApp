const express = require('express');
const path = require('path');
const { testConnection, checkUser, getQuestions, saveQuestion } = require('./db-config');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'quiz/public')));

// Hauptroute für die Startseite
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'quiz/public/html/userNameLoginIndex.html'));
});

// Test-Route für Datenbankverbindung
app.get('/api/test-db', async (req, res) => {
    const isConnected = await testConnection();
    res.json({ success: isConnected });
});

// Login-Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await checkUser(email, password);
        if (user) {
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

// Auth-Check Route
app.get('/api/check-auth', async (req, res) => {
    res.json({ isLoggedIn: true });
});

// GET Route zum Abrufen der Fragen
app.get('/api/questions', async (req, res) => {
    try {
        // Prüfen ob User eingeloggt ist
        if (!req.session?.user?.email) {
            return res.status(401).json({
                success: false,
                message: 'Nicht eingeloggt'
            });
        }

        const userEmail = req.session.user.email;
        
        // SQL-Query mit WHERE-Klausel für creator_email
        const query = `
            SELECT * FROM quiz_questions 
            WHERE creator_email = $1 
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query, [userEmail]);
        
        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Fehler beim Laden der Fragen:', error);
        res.status(500).json({
            success: false,
            message: 'Datenbankfehler: ' + error.message
        });
    }
});

// POST Route zum Speichern von Fragen
app.post('/api/questions', async (req, res) => {
    console.log('Received request body:', req.body); // Debug-Log

    try {
        // Body-Parser Überprüfung
        if (!req.body) {
            console.log('Kein Request-Body gefunden');
            return res.status(400).json({ 
                success: false, 
                message: 'Keine Daten empfangen' 
            });
        }

        const { creator_email, question, answer_a, answer_b, answer_c, answer_d, correct_answer } = req.body;

        // Validierung der Eingaben
        console.log('Erhaltene Daten:', {
            creator_email,
            question,
            answer_a,
            answer_b,
            answer_c,
            answer_d,
            correct_answer
        });

        // Prüfen ob alle erforderlichen Felder vorhanden sind
        if (!creator_email || !question || !answer_a || !answer_b || 
            !answer_c || !answer_d || !correct_answer) {
            return res.status(400).json({
                success: false,
                message: 'Alle Felder müssen ausgefüllt sein'
            });
        }

        // Sicherstellen, dass der body-parser korrekt eingebunden ist
        const result = await pool.query(
            `INSERT INTO quiz_questions 
            (creator_email, question, answer_a, answer_b, answer_c, answer_d, correct_answer) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [creator_email, question, answer_a, answer_b, answer_c, answer_d, correct_answer]
        );

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Speichern: ' + error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server läuft auf Port ${PORT}`);
    await testConnection();
});