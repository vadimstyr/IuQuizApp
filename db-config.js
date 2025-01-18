const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test-Funktion für die Verbindung
async function testConnection() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT NOW()');
        console.log('Datenbankverbindung erfolgreich:', result.rows[0]);
        return true;
    } catch (err) {
        console.error('Fehler bei der Datenbankverbindung:', err);
        return false;
    } finally {
        client.release();
    }
}

// Benutzer-Login überprüfen
async function checkUser(email, password) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const valid = await bcrypt.compare(password, user.password_hash);
            
            if (valid) {
                return {
                    email: user.email,
                    id: user.id
                };
            }
        }
        return null;
    } catch (err) {
        console.error('Fehler beim Login:', err);
        throw err; // Werfe den Fehler, damit er in der Route behandelt werden kann
    } finally {
        client.release();
    }
}

const getQuestions = async () => {
    try {
        const result = await pool.query('SELECT * FROM quiz_questions ORDER BY RANDOM()');
        return result.rows;
    } catch (error) {
        console.error('Datenbankfehler beim Abrufen der Fragen:', error);
        throw error;
    }
};

const saveQuestion = async (questionData) => {
    try {
        const query = `
            INSERT INTO quiz_questions 
            (creator_email, question, answer_a, answer_b, answer_c, answer_d, correct_answer)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            questionData.creator_email,
            questionData.question,
            questionData.answer_a,
            questionData.answer_b,
            questionData.answer_c,
            questionData.answer_d,
            questionData.correct_answer
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Fehler beim Speichern der Frage:', error);
        throw error;
    }
};


module.exports = {
    pool,
    testConnection,
    checkUser,
    getQuestions,
    saveQuestion  
};



