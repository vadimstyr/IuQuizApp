let correctAnswersCount = 0;

$(document).ready(() => {
    let questions = [];
    let currentQuestionIndex = 0;
    let hasAnswered = false;

        /**
     * Überprüft die Authentifizierung des Benutzers und lädt die Fragen für das Quiz.
     * - Wenn der Benutzer nicht eingeloggt ist, werden die Fragen und Steuerungen ausgeblendet.
     * - Lädt die eigenen Quizfragen des Benutzers aus der API.
     * - Mischt die Fragen zufällig, zeigt die erste Frage an und aktualisiert den Zähler.
     * - Bei Fehlern (z. B. nicht authentifiziert) wird der Benutzer auf die Login-Seite weitergeleitet.
     */

    const checkAuthAndLoadQuestions = async () => {
        try {
            // Auth-Check
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

            // Eigene Fragen laden
            const questionsResponse = await $.ajax({
                url: '/api/my-quiz-questions', // Neue Route für eigene Fragen
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });
            
            if (questionsResponse.success && questionsResponse.questions.length > 0) {
                questions = questionsResponse.questions;
                // Fragen zufällig mischen
                questions = questions.sort(() => Math.random() - 0.5);
                displayQuestion(0);
                updateQuestionCounter();
                $('#nextQuestion').show();
                $('.answer-container').show();
                $('main p').hide();
            } else {
                $('main p').text('Keine Fragen verfügbar. Bitte erst Fragen erstellen.');
                $('#nextQuestion').hide();
                $('.answer-container').hide();
            }
        } catch (error) {
            console.error('Detaillierter Fehler:', error);
            if (error.status === 401) {
                window.location.href = '/html/userNameLoginIndex.html';
            }
        }
    };

    /**
     * Zeigt die Frage und Antworten basierend auf dem übergebenen Index an.
     * - Aktualisiert den Text der Frage und ihrer Antworten.
     * - Setzt den Beantwortungsstatus zurück und deaktiviert den Button "Nächste Frage".
     * 
     * @param {number} index - Der Index der aktuellen Frage im `questions`-Array.
     */

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
        $('#nextQuestion').prop('disabled', true);
    };

    /**
     * Aktualisiert den Fortschrittszähler, der die aktuelle Frage und die Gesamtanzahl anzeigt.
     */

    const updateQuestionCounter = () => {
        $('.question-counter').text(`Frage ${currentQuestionIndex + 1} von ${questions.length}`);
    };

        /**
     * Verarbeitet die Antwort des Benutzers, wenn dieser eine Option auswählt.
     * - Überprüft, ob die Antwort korrekt ist, und markiert sie entsprechend.
     * - Erhöht die Anzahl der richtigen Antworten bei einer korrekten Auswahl.
     * - Aktiviert den Button "Nächste Frage".
     */

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

    /**
     * Wird aufgerufen, wenn der Benutzer auf den Button "Nächste Frage" klickt.
     * - Zeigt die nächste Frage an, wenn noch Fragen übrig sind.
     * - Beendet das Quiz und zeigt die Ergebnisse an, wenn alle Fragen beantwortet wurden.
     */

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
    
    // Initialer Auth-Check und Laden der Fragen
    checkAuthAndLoadQuestions();
});

/**
 * Zeigt das Ende des Quiz an und die Ergebnisse des Benutzers.
 * - Berechnet die Prozentzahl der richtigen Antworten.
 * - Zeigt Optionen für Neustart oder Rückkehr zum Menü an.
 * 
 * @param {number} correctAnswers - Anzahl der richtig beantworteten Fragen.
 * @param {number} totalQuestions - Gesamtanzahl der Fragen im Quiz.
 */

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