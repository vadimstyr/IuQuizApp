$(document).ready(() => {
    let currentUser = null;
    let userQuestions = [];
    let currentQuestionIndex = 0;

    // Auth-Check mit erweiterten Debug-Logs
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
                }, 2000);
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
            const response = await $.get('/api/questions');
            userQuestions = response;
            updateQuestionCount();
            displayCurrentQuestion();
            updateNavigationButtons(); // Neue Funktion
        } catch (error) {
            console.error('Fehler beim Laden der Fragen:', error);
            showError('Fehler beim Laden der Fragen'); // Neue Funktion
        }
    };

    // Validierung der Eingaben
    const validateQuestionData = (questionData) => {
        if (!questionData.question.trim()) return 'Bitte geben Sie eine Frage ein';
        if (!questionData.answer_a.trim()) return 'Bitte geben Sie Antwort A ein';
        if (!questionData.answer_b.trim()) return 'Bitte geben Sie Antwort B ein';
        if (!questionData.answer_c.trim()) return 'Bitte geben Sie Antwort C ein';
        if (!questionData.answer_d.trim()) return 'Bitte geben Sie Antwort D ein';
        return null;
    };

    // Frage speichern
    $('#saveQuestion').click(async () => {
        if (userQuestions.length >= 10) {
            showError('Sie können maximal 10 Fragen erstellen!');
            return;
        }

        const questionData = {
            creator_email: currentUser,
            question: $('#questionInput').val(),
            answer_a: $('#answerA').val(),
            answer_b: $('#answerB').val(),
            answer_c: $('#answerC').val(),
            answer_d: $('#answerD').val(),
            correct_answer: $('#correctAnswer').val()
        };

        const validationError = validateQuestionData(questionData);
        if (validationError) {
            showError(validationError);
            return;
        }

        try {
            const response = await $.ajax({
                url: '/api/questions',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(questionData)
            });

            showSuccess('Frage erfolgreich gespeichert!');
            clearInputs();
            await loadUserQuestions();
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            showError('Fehler beim Speichern der Frage.');
        }
    });

    // Frage löschen mit Bestätigung
    $('#deleteQuestion').click(async () => {
        if (userQuestions.length === 0) return;

        if (!confirm('Möchten Sie diese Frage wirklich löschen?')) return;

        try {
            await $.ajax({
                url: `/api/questions/${userQuestions[currentQuestionIndex].id}`,
                method: 'DELETE'
            });

            showSuccess('Frage erfolgreich gelöscht!');
            await loadUserQuestions();
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            showError('Fehler beim Löschen der Frage.');
        }
    });

    // Frage bearbeiten
    $('#editQuestion').click(() => {
        if (userQuestions.length === 0) return;

        const currentQuestion = userQuestions[currentQuestionIndex];
        $('#questionInput').val(currentQuestion.question);
        $('#answerA').val(currentQuestion.answer_a);
        $('#answerB').val(currentQuestion.answer_b);
        $('#answerC').val(currentQuestion.answer_c);
        $('#answerD').val(currentQuestion.answer_d);
        $('#correctAnswer').val(currentQuestion.correct_answer);
    });

    // Navigation
    $('#prevQuestion').click(() => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayCurrentQuestion();
            updateNavigationButtons();
        }
    });

    $('#nextQuestion').click(() => {
        if (currentQuestionIndex < userQuestions.length - 1) {
            currentQuestionIndex++;
            displayCurrentQuestion();
            updateNavigationButtons();
        }
    });

    // Hilfsfunktionen
    const updateQuestionCount = () => {
        $('#questionCount').text(userQuestions.length);
        $('#remainingQuestions').text(10 - userQuestions.length);
    };

    const displayCurrentQuestion = () => {
        if (userQuestions.length === 0) {
            $('#previewQuestion').text('Keine Fragen vorhanden');
            $('#previewAnswers').empty();
            $('#correctAnswerDisplay').text('');
            $('#currentQuestionNumber').text('Frage 0/0');
            return;
        }

        const question = userQuestions[currentQuestionIndex];
        $('#previewQuestion').text(question.question);
        $('#previewAnswers').html(`
            <div class="answer">A: ${question.answer_a}</div>
            <div class="answer">B: ${question.answer_b}</div>
            <div class="answer">C: ${question.answer_c}</div>
            <div class="answer">D: ${question.answer_d}</div>
        `);
        $('#correctAnswerDisplay').text(`Richtige Antwort: ${question.correct_answer}`);
        $('#currentQuestionNumber').text(`Frage ${currentQuestionIndex + 1}/${userQuestions.length}`);
    };

    const updateNavigationButtons = () => {
        $('#prevQuestion').prop('disabled', currentQuestionIndex === 0);
        $('#nextQuestion').prop('disabled', currentQuestionIndex === userQuestions.length - 1);
    };

    const clearInputs = () => {
        $('#questionInput').val('');
        $('#answerA').val('');
        $('#answerB').val('');
        $('#answerC').val('');
        $('#answerD').val('');
        $('#correctAnswer').val('A');
    };

    const showError = (message) => {
        $('#errorMessage')
            .text(message)
            .removeClass('success-message')
            .addClass('error-message')
            .fadeIn()
            .delay(3000)
            .fadeOut();
    };

    const showSuccess = (message) => {
        $('#errorMessage')
            .text(message)
            .removeClass('error-message')
            .addClass('success-message')
            .fadeIn()
            .delay(3000)
            .fadeOut();
    };

    // Start mit Auth-Check und User-Load
    checkAuthAndLoadUser();
});