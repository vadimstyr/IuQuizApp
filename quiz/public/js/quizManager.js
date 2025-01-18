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

        try {
            await $.ajax({
                url: `/api/questions/${userQuestions[currentQuestionIndex].id}`,
                method: 'DELETE',
                xhrFields: {
                    withCredentials: true
                }
            });

            await loadUserQuestions();
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            alert('Fehler beim Löschen der Frage.');
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
        updateQuestionCount();
        
        if (userQuestions.length === 0) {
            $('.questions-preview').empty();
            return;
        }

        const question = userQuestions[currentQuestionIndex];
        $('.questions-preview').html(`
            <h3>${question.question}</h3>
            <div class="answers">
                <p>A: ${question.answer_a}</p>
                <p>B: ${question.answer_b}</p>
                <p>C: ${question.answer_c}</p>
                <p>D: ${question.answer_d}</p>
            </div>
            <p class="correct-answer">Richtige Antwort: ${question.correct_answer}</p>
        `);
        $('#currentQuestionNumber').text(`Frage ${currentQuestionIndex + 1}/${userQuestions.length}`);
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