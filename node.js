const express = require('express');
const path = require('path');
const { testConnection, checkUser } = require('./db-config');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server läuft auf Port ${PORT}`);
    await testConnection(); // Test der Datenbankverbindung beim Start
});