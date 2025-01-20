const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Testet die Verbindung zur Datenbank.
 * - Führt eine einfache SQL-Abfrage aus, um sicherzustellen, dass die Verbindung funktioniert.
 * - Gibt `true` bei Erfolg und `false` bei einem Fehler zurück.
 */
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

/**
 * Überprüft den Benutzer-Login.
 * - Sucht den Benutzer anhand der Email in der Datenbank.
 * - Vergleicht das eingegebene Passwort mit dem gespeicherten Passwort-Hash.
 * - Gibt die Benutzerdaten zurück, wenn die Authentifizierung erfolgreich ist, andernfalls `null`.
 * 
 * @param {string} email - Die Email des Benutzers.
 * @param {string} password - Das eingegebene Passwort des Benutzers.
 * @returns {object|null} Benutzerinformationen oder `null`, wenn die Authentifizierung fehlschlägt.
 */
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

/**
 * Ruft alle Quizfragen ab, die vom Benutzer erstellt wurden.
 * - Sortiert die Fragen nach dem Erstellungsdatum in absteigender Reihenfolge.
 * 
 * @param {string} userEmail - Die Email des Benutzers.
 * @returns {Array} Liste der Fragen, die vom Benutzer erstellt wurden.
 */
const getQuestions = async (userEmail) => {
    try {
        const result = await pool.query(
            'SELECT * FROM quiz_questions WHERE creator_email = $1 ORDER BY created_at DESC',
            [userEmail]
        );
        return result.rows;
    } catch (error) {
        console.error('Datenbankfehler beim Abrufen der Fragen:', error);
        throw error;
    }
};
/**
 * Speichert eine neue Quizfrage in der Datenbank.
 * - Überprüft zuerst, ob der Benutzer existiert.
 * - Fügt die Frage in die Tabelle `quiz_questions` ein und gibt die gespeicherte Frage zurück.
 * 
 * @param {object} questionData - Die Daten der neuen Quizfrage.
 * @returns {object} Die gespeicherte Frage.
 */
const saveQuestion = async (questionData) => {
    try {
        // Prüfen ob der Benutzer existiert
        const userCheck = await pool.query(
            'SELECT email FROM users WHERE email = $1',
            [questionData.creator_email]
        );
        
        if (userCheck.rows.length === 0) {
            throw new Error('User not found');
        }

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
/**
 * Ruft zufällige Quizfragen von anderen Benutzern ab.
 * - Wählt maximal 10 Fragen aus, die nicht vom aktuellen Benutzer erstellt wurden.
 * 
 * @param {string} userEmail - Die Email des aktuellen Benutzers.
 * @returns {Array} Eine Liste von zufälligen Fragen.
 */
const getOtherQuestions = async (userEmail) => {
    try {
        // Zufällige Auswahl von 10 Fragen von anderen Benutzern
        const result = await pool.query(`
            SELECT * FROM quiz_questions 
            WHERE creator_email != $1 
            ORDER BY RANDOM() 
            LIMIT 10
        `, [userEmail]);
        
        return result.rows;
    } catch (error) {
        console.error('Fehler beim Abrufen der fremden Fragen:', error);
        throw error;
    }
};
// Export der Funktionen und des Pools für die Verwendung in anderen Modulen
module.exports = {
    pool,
    testConnection,
    checkUser,
    getQuestions,
    saveQuestion,
    getOtherQuestions  
};



