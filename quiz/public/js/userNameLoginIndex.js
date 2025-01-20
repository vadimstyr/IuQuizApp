// Event-Listener für das Absenden des Login-Formulars

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Verhindert das normale Formular-Submit

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
                /**
         * Senden der Login-Daten an die Server-API.
         * - Die Methode `POST` wird verwendet, um die Daten sicher zu senden.
         * - Die `Content-Type`-Header gibt an, dass die Daten im JSON-Format gesendet werden.
         */
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
                        /**
             * Erfolgreicher Login:
             * - Der Benutzer wird auf die Zielseite weitergeleitet.
             * - Die Zielseite könnte eine geschützte Seite wie ein Dashboard oder ein Quiz sein.
             */
            window.location.href = '/html/quiz.html'; // oder Ihre Zielseite
        } else {
            // Fehlgeschlagener Login
            alert('Login fehlgeschlagen: ' + (data.message || 'Falsche Email oder Passwort'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Ein Fehler ist aufgetreten');
    }
});