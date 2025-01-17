const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Konfiguriere Datenbankverbindung
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    // Erstelle users Tabelle
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Testdaten
    const users = [
      { email: 'test@example.com', password: 'hashedpassword123' },
      { email: 'Dominik@example.com', password: 'hashedPassword1' },
      { email: 'Katharina@example.com', password: 'hashedPassword2' },
      { email: 'Tutor@example.com', password: 'hashedPassword3' }
    ];

    // Füge Benutzer ein
    for (const user of users) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(user.password, saltRounds);
      
      await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
        [user.email, passwordHash]
      );
    }

    console.log('Datenbank Setup abgeschlossen!');

    // Teste die Einträge
    const result = await client.query('SELECT email FROM users ORDER BY email');
    console.log('\nEingefügte Benutzer:');
    result.rows.forEach(row => {
      console.log(row.email);
    });

  } catch (err) {
    console.error('Fehler beim Datenbanksetup:', err);
  } finally {
    client.release();
  }
}

setupDatabase().finally(() => pool.end());