$(document).ready(() => {
    // Logout-Handler
    $('.login-Username #username').click(async (e) => {
        e.preventDefault(); // Verhindert Standard-Link-Verhalten
        
        try {
            const response = await $.ajax({
                url: '/api/logout',
                method: 'POST',
                xhrFields: {
                    withCredentials: true
                }
            });

            if (response.success) {
                window.location.href = '/html/userNameLoginIndex.html';
            } else {
                alert('Fehler beim Logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Fehler beim Logout');
        }
    });

    // Optional: Aktuellen Benutzernamen anzeigen
    const checkAuth = async () => {
        try {
            const response = await $.ajax({
                url: '/api/check-auth',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });

            if (!response.isLoggedIn) {
                window.location.href = '/html/userNameLoginIndex.html';
            }
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = '/html/userNameLoginIndex.html';
        }
    };

    // Beim Laden prüfen ob eingeloggt
    checkAuth();
});