$(document).ready(() => {
    let currentUser = null;
    let userQuestions = [];
    let currentQuestionIndex = 0;

    // Die ursprüngliche, funktionierende Auth-Check Methode
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
            const response = await $.get('/api/questions');
            userQuestions = response;
            updateQuestionCount();
            displayCurrentQuestion();
        } catch (error) {
            console.error('Fehler beim Laden der Fragen:', error);
        }
    };

    // Verbesserte Frage speichern Funktion
    // Verbesserte Frage speichern Funktion
$('#saveQuestion').click(async () => {
    if (userQuestions.length >= 10) {
        alert('Sie können maximal 10 Fragen erstellen!');
        return;
    }

    // Validierung der Eingaben
    const question = $('#questionInput').val().trim();
    const answerA = $('#answerA').val().trim();
    const answerB = $('#answerB').val().trim();
    const answerC = $('#answerC').val().trim();
    const answerD = $('#answerD').val().trim();
    const correctAnswer = $('#correctAnswer').val().trim();

    if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
        alert('Bitte füllen Sie alle Felder aus.');
        return;
    }

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
        console.log('Speichere Frage:', questionData);
        const response = await $.ajax({
            url: '/api/questions',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(questionData),
            xhrFields: {
                withCredentials: true
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log('Antwort vom Server:', response);

        alert('Frage erfolgreich gespeichert!');
        clearInputs();
        await loadUserQuestions();
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        console.log('Error Response:', error.responseJSON);
        alert('Fehler beim Speichern der Frage: ' + (error.responseJSON?.message || error.statusText));
    }
});

    // Frage löschen
    $('#deleteQuestion').click(async () => {
        if (userQuestions.length === 0) return;

        try {
            await $.ajax({
                url: `/api/questions/${userQuestions[currentQuestionIndex].id}`,
                method: 'DELETE'
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
        $('#questionCount').text(userQuestions.length);
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
            <div>A: ${question.answer_a}</div>
            <div>B: ${question.answer_b}</div>
            <div>C: ${question.answer_c}</div>
            <div>D: ${question.answer_d}</div>
        `);
        $('#correctAnswerDisplay').text(`Richtige Antwort: ${question.correct_answer}`);
        $('#currentQuestionNumber').text(`Frage ${currentQuestionIndex + 1}/${userQuestions.length}`);
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