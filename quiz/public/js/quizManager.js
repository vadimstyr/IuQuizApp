$(document).ready(() => {
    let currentUser = null;
    let userQuestions = [];
    let currentQuestionIndex = 0;

    // Auth-Check mit erweiterten Debug-Logs
    const checkAuthAndLoadUser = async () => {
        console.log('Start: Auth-Check');
        try {
            const response = await $.ajax({
                url: '/api/check-auth',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });
            console.log('Auth-Response:', response);
    
            if (!response.isLoggedIn || !response.email) {
                console.log('Nicht eingeloggt oder keine E-Mail');
                window.location.href = '/html/userNameLoginIndex.html';
                return;
            }
            
            currentUser = response.email;
            console.log('CurrentUser gesetzt:', currentUser);
            $('#userEmail').text(currentUser);
            await loadUserQuestions();
        } catch (error) {
            console.error('Auth-Fehler:', error);
            window.location.href = '/html/userNameLoginIndex.html';
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

    // Frage speichern
    $('#saveQuestion').click(async () => {
        // Erst prüfen ob User eingeloggt ist
        if (!currentUser) {
            alert('Bitte melden Sie sich erneut an.');
            window.location.href = '/html/userNameLoginIndex.html';
            return;
        }
    
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
            console.log('Speichere Frage:', questionData); // Debug-Log
            const response = await $.ajax({
                url: '/api/questions',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(questionData)
            });
            console.log('Antwort vom Server:', response); // Debug-Log
    
            alert('Frage erfolgreich gespeichert!');
            clearInputs();
            await loadUserQuestions();
        } catch (error) {
            console.error('Detaillierter Fehler beim Speichern:', error);
            alert(`Fehler beim Speichern der Frage: ${error.responseText || error.message}`);
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