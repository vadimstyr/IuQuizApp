$(document).ready(() => {
    let questions = [];
    let currentQuestionIndex = 0;
    let currentScore = 0;
    let hasAnswered = false;

    const loadOtherQuestions = async () => {
        try {
            console.log('Lade Fragen von anderen Benutzern...'); // Debug-Log
            const response = await $.ajax({
                url: '/api/other-questions',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });
            console.log('Server-Antwort:', response); // Debug-Log
    
            if (response.success && response.questions.length > 0) {
                questions = response.questions;
                updateDisplay();
            } else {
                console.log('Keine Fragen gefunden:', response.message);
                $('.question-container').html('<h2>Keine Fragen von anderen Benutzern verfügbar.</h2>');
            }
        } catch (error) {
            console.error('Fehler:', error);
        }
    };

    const updateDisplay = () => {
        const question = questions[currentQuestionIndex];
        $('#currentQuestion').text(question.question);
        $('#A').text(`A: ${question.answer_a}`);
        $('#B').text(`B: ${question.answer_b}`);
        $('#C').text(`C: ${question.answer_c}`);
        $('#D').text(`D: ${question.answer_d}`);
        $('#questionCounter').text(`Frage ${currentQuestionIndex + 1} von ${questions.length}`);
        $('#score').text(`Punkte: ${currentScore}`);
        $('#nextQuestion').prop('disabled', !hasAnswered);
    };

    $('.answer').click(function() {
        if (hasAnswered) return;
        hasAnswered = true;

        const selectedAnswer = $(this).attr('id');
        const correctAnswer = questions[currentQuestionIndex].correct_answer;

        if (selectedAnswer === correctAnswer) {
            $(this).addClass('correct');
            currentScore += 10;
        } else {
            $(this).addClass('incorrect');
            $(`#${correctAnswer}`).addClass('correct');
        }

        $('#score').text(`Punkte: ${currentScore}`);
        $('#nextQuestion').prop('disabled', false);
    });

    $('#nextQuestion').click(() => {
        if (!hasAnswered && currentQuestionIndex < questions.length) {
            alert('Bitte wähle erst eine Antwort!');
            return;
        }

        $('.answer').removeClass('correct incorrect');
        hasAnswered = false;
        currentQuestionIndex++;

        if (currentQuestionIndex >= questions.length) {
            // Quiz beendet
            $('.quiz-container').html(`
                <div class="quiz-end">
                    <h2>Quiz beendet!</h2>
                    <p>Dein Ergebnis: ${currentScore} Punkte</p>
                    <p>Du hast ${currentScore/10} von ${questions.length} Fragen richtig beantwortet!</p>
                    <button onclick="location.reload()" class="button">Erneut spielen</button>
                    <button onclick="window.location.href='/html/quizMode.html'" class="button">Zurück zum Menü</button>
                </div>
            `);
        } else {
            updateDisplay();
        }
    });

    // Bestenliste (optional)
    const updateLeaderboard = () => {
        // Hier könnte später die Bestenliste implementiert werden
        $('#leaderboardList').html('<p>Bestenliste wird geladen...</p>');
    };

    // Start des Quiz
    loadOtherQuestions();
    updateLeaderboard();
});