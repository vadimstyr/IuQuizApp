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
        const questions = await getQuestions();
        res.json(questions);
    } catch (error) {
        console.error('Fehler beim Abrufen der Fragen:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Fehler beim Laden der Fragen'
        });
    }
});

// POST Route zum Speichern von Fragen
app.post('/api/questions', async (req, res) => {
    const { creator_email, question, answer_a, answer_b, answer_c, answer_d, correct_answer } = req.body;
    
    if (!question || !answer_a || !answer_b || !answer_c || !answer_d || !correct_answer) {
        return res.status(400).json({ 
            success: false, 
            message: 'Alle Felder müssen ausgefüllt sein' 
        });
    }

    try {
        const result = await saveQuestion({
            creator_email,
            question,
            answer_a,
            answer_b,
            answer_c,
            answer_d,
            correct_answer
        });

        res.json({ 
            success: true, 
            question: result 
        });
    } catch (error) {
        console.error('Fehler beim Speichern der Frage:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Fehler beim Speichern der Frage' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server läuft auf Port ${PORT}`);
    await testConnection();
});