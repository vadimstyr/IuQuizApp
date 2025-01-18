let correctAnswersCount = 0;

$(document).ready(() => {
    let questions = [];
    let currentQuestionIndex = 0;
    let hasAnswered = false;

    const checkAuthAndLoadQuestions = async () => {
        try {
            // API-Endpunkt für Auth-Check
            const authResponse = await $.ajax({
                url: '/api/check-auth',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });
            
            if (!authResponse.isLoggedIn) {
                $('#nextQuestion').hide();
                $('.answer-container').hide();
                return;
            }

            // API-Endpunkt für Fragen laden
            const questionsResponse = await $.ajax({
                url: '/api/questions',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });
            
            questions = questionsResponse;
            if (questions.length > 0) {
                displayQuestion(0);
                updateQuestionCounter();
                $('#nextQuestion').show();
                $('.answer-container').show();
                $('main p').hide();
            } else {
                $('main p').text('Keine Fragen verfügbar. Bitte erst Fragen erstellen.');
            }
        } catch (error) {
            console.error('Detaillierter Fehler:', error);
            if (error.status === 401) {
                window.location.href = '/html/userNameLoginIndex.html';
            }
        }
    };

    const displayQuestion = (index) => {
        const question = questions[index];
        if (!question) {
            console.error('Keine Frage für Index:', index);
            return;
        }
        
        $('#currentQuestion').text(question.question);
        $('#A').text(`A: ${question.answer_a}`);
        $('#B').text(`B: ${question.answer_b}`);
        $('#C').text(`C: ${question.answer_c}`);
        $('#D').text(`D: ${question.answer_d}`);
        hasAnswered = false;
        updateQuestionCounter();
    };

    const updateQuestionCounter = () => {
        $('.question-counter').text(`Frage ${currentQuestionIndex + 1} von ${questions.length}`);
    };

    $('.answer').click(function() {
        if (hasAnswered) return;
        hasAnswered = true;

        const selectedAnswer = $(this).attr('id');
        const question = questions[currentQuestionIndex];
        
        if (selectedAnswer === question.correct_answer) {
            correctAnswersCount++;
            $(this).addClass('correct');
        } else {
            $(this).addClass('incorrect');
            $(`#${question.correct_answer}`).addClass('correct');
        }

        $('#nextQuestion').prop('disabled', false);
    });

    $('#nextQuestion').click(() => {
        if (!hasAnswered && currentQuestionIndex < questions.length) {
            alert('Bitte wähle erst eine Antwort aus!');
            return;
        }

        $('.answer').removeClass('correct incorrect');
        currentQuestionIndex++;
        
        if (currentQuestionIndex >= questions.length) {
            showQuizEnd(correctAnswersCount, questions.length);
        } else {
            displayQuestion(currentQuestionIndex);
        }
    });

    $('#nextQuestion').prop('disabled', true);
    
    // Initialer Auth-Check und Laden der Fragen
    checkAuthAndLoadQuestions();
});

function showQuizEnd(correctAnswers, totalQuestions) {
    $('.quiz-container').html(`
        <div class="quiz">
            <h1>Quiz beendet!</h1>
        </div>
        <div class="quizzQuestion">
            <h2>Du hast ${correctAnswers} von ${totalQuestions} Fragen richtig beantwortet! (${Math.round((correctAnswers / totalQuestions) * 100)}%)</h2>
        </div>
        <div class="quiz-buttons">
            <button onclick="location.reload()" class="quiz-button">Quiz neu starten</button>
            <button onclick="window.location.href='/html/quizMode.html'" class="quiz-button">Spielmodus wählen</button>
        </div>
    `);
}