$(document).ready(() => {
    // Initialisiere Variablen für den aktuellen Benutzer, die Fragen des Benutzers, den aktuellen Fragenindex und die ID der bearbeiteten Frage
    let currentUser = null;
    let userQuestions = [];
    let currentQuestionIndex = 0;
    let editingQuestionId = null;


        /**
     * Überprüft die Authentifizierung des Benutzers und lädt die Benutzerinformationen.
     * - Wenn der Benutzer eingeloggt ist, wird sein Name angezeigt und die Fragen werden geladen.
     * - Wenn der Benutzer nicht eingeloggt ist, wird er auf die Login-Seite weitergeleitet.
     */

    // Auth-Check Methode
    const checkAuthAndLoadUser = async () => {
        console.log('Start: Auth-Check');
        try {
            console.log('Sende Auth-Request...');
            const response = await $.ajax({
                url: '/api/check-auth',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });
            console.log('Auth-Response erhalten:', response);

            if (!response.isLoggedIn) {
                console.log('Nicht eingeloggt - Weiterleitung wird vorbereitet...');
                setTimeout(() => {
                    window.location.href = '/html/userNameLoginIndex.html';
                }, 5000);
                return;
            }
            
            console.log('Login bestätigt für:', response.email);
            currentUser = response.email;
            $('#userEmail').text(currentUser);
            await loadUserQuestions();
        } catch (error) {
            console.error('Detaillierter Auth-Fehler:', error);
            setTimeout(() => {
                window.location.href = '/html/userNameLoginIndex.html';
            }, 5000);
        }
    };

        /**
     * Lädt die Fragen des Benutzers aus der API und zeigt sie an.
     * - Wenn keine Fragen vorhanden sind, wird eine leere Liste angezeigt.
     * - Bei Fehlern wird ein Fehlerprotokoll ausgegeben und die Liste geleert.
     */
    const loadUserQuestions = async () => {
        try {
            const response = await $.ajax({
                url: '/api/questions',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });
    
            console.log('Geladene Fragen:', response);
    
            if (response.success) {
                userQuestions = response.data;
                displayQuestions();
            } else {
                console.warn('Warnung:', response.message);
                userQuestions = [];
                displayQuestions();
            }
        } catch (error) {
            console.error('Fehler beim Laden der Fragen:', error);
            userQuestions = [];
            displayQuestions();
        }
    };

        /**
     * Speichert eine neue Frage oder aktualisiert eine bestehende Frage.
     * - Überprüft, ob alle Felder ausgefüllt sind.
     * - Begrenzt die maximale Anzahl der Fragen auf 10.
     * - Aktualisiert die Fragenliste nach dem Speichern.
     */

    $('#saveQuestion').click(async () => {
        if (userQuestions.length >= 10) {
            alert('Sie können maximal 10 Fragen erstellen!');
            return;
        }
    
        if (!currentUser) {
            console.error('Kein Benutzer eingeloggt');
            alert('Bitte melden Sie sich erneut an.');
            return;
        }
    
        const question = $('#questionInput').val().trim();
        const answerA = $('#answerA').val().trim();
        const answerB = $('#answerB').val().trim();
        const answerC = $('#answerC').val().trim();
        const answerD = $('#answerD').val().trim();
        const correctAnswer = $('#correctAnswer').val().trim().toUpperCase();

        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }

        console.log('Current User:', currentUser);

        const questionData = {
            creator_email: currentUser,
            question: $('#questionInput').val().trim(),
            answer_a: $('#answerA').val().trim(),
            answer_b: $('#answerB').val().trim(),
            answer_c: $('#answerC').val().trim(),
            answer_d: $('#answerD').val().trim(),
            correct_answer: $('#correctAnswer').val()
        };


        try {
            let response;
            if (editingQuestionId) {
                // Update existierende Frage
                response = await $.ajax({
                    url: `/api/questions/${editingQuestionId}`,
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(questionData)
                });
            } else {
                // Neue Frage erstellen (bestehender Code)
                response = await $.ajax({
                    url: '/api/questions',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(questionData)
                });
            }
    
            if (response.success) {
                showSuccess(editingQuestionId ? 'Frage aktualisiert!' : 'Frage gespeichert!');
                clearInputs();
                editingQuestionId = null; // Reset
                $('#saveQuestion').text('Frage speichern');
                await loadUserQuestions();
            }
        } catch (error) {
            console.error('Fehler:', error);
            showError('Fehler beim Speichern');
        }
    });

    // Formular leeren Handler anpassen
    $('#clearForm').click(() => {
    clearInputs();
    editingQuestionId = null;
    $('#saveQuestion').text('Frage speichern');
    });

        /**
     * Löscht die aktuelle Frage in der Liste.
     * - Löscht die Frage über die API und lädt die aktualisierte Liste neu.
     */
    $('#deleteQuestion').click(async () => {
        if (userQuestions.length === 0) return;
    
        const questionId = userQuestions[currentQuestionIndex].id;
    
        try {
            const response = await $.ajax({
                url: `/api/questions/${questionId}`,
                method: 'DELETE',
                xhrFields: {
                    withCredentials: true
                }
            });
    
            if (response.success) {
                await loadUserQuestions(); // Lädt die Fragen neu
                if (currentQuestionIndex >= userQuestions.length) {
                    currentQuestionIndex = Math.max(0, userQuestions.length - 1);
                }
                displayCurrentQuestion();
            } else {
                alert('Fehler beim Löschen der Frage');
            }
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            alert('Fehler beim Löschen der Frage');
        }
    });

    const showSuccess = (message) => {
        $('#errorMessage')
            .removeClass('error-message')
            .addClass('success-message')
            .text(message)
            .fadeIn()
            .delay(3000)
            .fadeOut();
    };

        /**
     * Zeigt eine Fehlermeldung an.
     * @param {string} message - Die anzuzeigende Fehlermeldung.
     */

    const showError = (message) => {
        $('#errorMessage')
            .removeClass('success-message')
            .addClass('error-message')
            .text(message)
            .fadeIn()
            .delay(3000)
            .fadeOut();
    };

    // Navigation
    $('#prevQuestion').click(() => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayCurrentQuestion();
        }
    });

    $('#nextQuestion').click(() => {
        if (currentQuestionIndex < userQuestions.length - 1) {
            currentQuestionIndex++;
            displayCurrentQuestion();
        }
    });

    // Hilfsfunktionen
    const updateQuestionCount = () => {
        $('.question-counter').text(`(${userQuestions.length}/10)`);
    };

    /**
     * Aktualisiert die Anzeige der aktuellen Frage basierend auf dem Index.
     */
    const displayCurrentQuestion = () => {
        // Zähler aktualisieren
        $('#questionCount').text(userQuestions.length);
        $('#remainingQuestions').text(10 - userQuestions.length);
        
        if (userQuestions.length === 0) {
            $('#previewQuestion').text('');
            $('#previewAnswers').empty();
            $('#correctAnswerDisplay').text('');
            $('#currentQuestionNumber').text('Frage 0/0');
            return;
        }
    
        const question = userQuestions[currentQuestionIndex];
        if (question) {
            // Vorschau befüllen
            $('#previewQuestion').text(question.question);
            $('#previewAnswers').html(`
                <div class="preview-answer">
                    <span>A:</span> ${question.answer_a}
                </div>
                <div class="preview-answer">
                    <span>B:</span> ${question.answer_b}
                </div>
                <div class="preview-answer">
                    <span>C:</span> ${question.answer_c}
                </div>
                <div class="preview-answer">
                    <span>D:</span> ${question.answer_d}
                </div>
            `);
            $('#correctAnswerDisplay').text(`Richtige Antwort: ${question.correct_answer}`);
            $('#currentQuestionNumber').text(`Frage ${currentQuestionIndex + 1}/${userQuestions.length}`);
        }
    };

    // Alias-Funktion für Kompatibilität
    const displayQuestions = () => {
        displayCurrentQuestion();
    };

    /**
     * Leert die Eingabefelder für die Erstellung oder Bearbeitung von Fragen.
     */
    
    const clearInputs = () => {
        $('#questionInput').val('');
        $('#answerA').val('');
        $('#answerB').val('');
        $('#answerC').val('');
        $('#answerD').val('');
        $('#correctAnswer').val('A');
    };

    // Bearbeiten-Button Click-Handler
$('#editQuestion').click(() => {
    const currentQuestion = userQuestions[currentQuestionIndex];
    editingQuestionId = currentQuestion.id;
    
    // Formular mit aktuellen Werten füllen
    $('#questionInput').val(currentQuestion.question);
    $('#answerA').val(currentQuestion.answer_a);
    $('#answerB').val(currentQuestion.answer_b);
    $('#answerC').val(currentQuestion.answer_c);
    $('#answerD').val(currentQuestion.answer_d);
    $('#correctAnswer').val(currentQuestion.correct_answer);
    
    // "Speichern" Button Text ändern
    $('#saveQuestion').text('Frage aktualisieren');
});

    // Start mit Auth-Check und User-Load
    checkAuthAndLoadUser();
});

