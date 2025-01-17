document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Verhindert das normale Formular-Submit

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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
            // Erfolgreicher Login
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