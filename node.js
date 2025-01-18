const express = require('express');
const path = require('path');
const { pool, testConnection, checkUser, getQuestions, saveQuestion } = require('./db-config');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'quiz/public')));

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

// Auth-Check Route
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

// GET Route zum Abrufen der Fragen
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

// POST Route zum Speichern von Fragen
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
   console.log(`Server läuft auf Port ${PORT}`);
   await testConnection();
});