$(document).ready(function() {
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault(); // Verhindert das normale Formular-Submit
        
        const email = $('#email').val();
        const password = $('#password').val();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Bei erfolgreicher Anmeldung zu quiz.html weiterleiten
                window.location.href = '/html/quiz.html';
            } else {
                // Fehlerbehandlung - können Sie nach Ihren Wünschen anpassen
                alert('Login fehlgeschlagen: ' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Ein Fehler ist aufgetreten beim Login');
        }
    });
});