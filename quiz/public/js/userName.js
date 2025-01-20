$(document).ready(() => {
    /**
     * Logout-Handler:
     * - Wird ausgelöst, wenn der Benutzer auf den Benutzernamen klickt.
     * - Führt eine Logout-Anfrage an die API durch und leitet den Benutzer nach erfolgreichem Logout auf die Login-Seite weiter.
     * - Bei Fehlern wird eine Fehlermeldung angezeigt.
     */
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
    /**
     * Authentifizierungsprüfung:
     * - Überprüft, ob der Benutzer eingeloggt ist.
     * - Wenn der Benutzer nicht eingeloggt ist, wird er auf die Login-Seite weitergeleitet.
     * - Bei einem Fehler (z. B. fehlende Verbindung) wird ebenfalls auf die Login-Seite weitergeleitet.
     */

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
    /**
     * Initialisierung:
     * - Beim Laden der Seite wird die Authentifizierungsprüfung ausgeführt.
     * - Stellt sicher, dass nur eingeloggte Benutzer auf die Inhalte zugreifen können.
     */
    checkAuth();
});