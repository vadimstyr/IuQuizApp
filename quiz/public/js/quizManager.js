$(document).ready(() => {
    let currentUser = null;
    let userQuestions = [];
    let currentQuestionIndex = 0;

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

    // Fragen laden
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

    // Frage speichern
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
            question: question,
            answer_a: answerA,
            answer_b: answerB,
            answer_c: answerC,
            answer_d: answerD,
            correct_answer: correctAnswer
        };

        try {
            console.log('Sende Frage mit Daten:', questionData);
            const response = await $.ajax({
                url: '/api/questions',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(questionData),
                xhrFields: {
                    withCredentials: true
                }
            });

            console.log('Server-Antwort:', response);
            
            if (response.success) {
                alert('Frage erfolgreich gespeichert!');
                clearInputs();
                await loadUserQuestions();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern: ' + (error.responseJSON?.message || error.message));
        }
    });

    // Frage löschen
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

    const clearInputs = () => {
        $('#questionInput').val('');
        $('#answerA').val('');
        $('#answerB').val('');
        $('#answerC').val('');
        $('#answerD').val('');
        $('#correctAnswer').val('A');
    };

    // Start mit Auth-Check und User-Load
    checkAuthAndLoadUser();
});