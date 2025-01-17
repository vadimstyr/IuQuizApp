const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test-Funktion für die Verbindung
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Datenbankverbindung erfolgreich:', result.rows[0]);
        client.release();
        return true;
    } catch (err) {
        console.error('Fehler bei der Datenbankverbindung:', err);
        return false;
    }
}

// Benutzer-Login überprüfen
async function checkUser(email, password) {
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        client.release();

        if (result.rows.length > 0) {
            const valid = await bcrypt.compare(password, result.rows[0].password_hash);
            return valid ? result.rows[0] : null;
        }
        return null;
    } catch (err) {
        console.error('Fehler beim Login:', err);
        return null;
    }
}

module.exports = {
    pool,
    testConnection,
    checkUser
};