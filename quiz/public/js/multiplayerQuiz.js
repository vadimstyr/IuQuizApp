$(document).ready(() => {
    // Initialisiere Variablen für Fragen, den aktuellen Index, die Punktzahl und den Beantwortungsstatus
    let questions = [];
    let currentQuestionIndex = 0;
    let currentScore = 0;
    let hasAnswered = false;
    
   /**
     * Lädt die Bestenliste von der API und zeigt sie auf der Seite an.
     * Die Bestenliste wird in das HTML-Element mit der ID 'leaderboardList' eingefügt.
     */
    const loadLeaderboard = async () => {
        try {
            const response = await $.ajax({
                url: '/api/leaderboard',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });

            if (response.success) {
                const leaderboardHtml = response.data.map((entry, index) => `
                    <div class="highscore-entry">
                        <span class="rank">#${index + 1}</span>
                        <span class="player">${entry.player_email}</span>
                        <span class="score">${entry.score} Punkte</span>
                    </div>
                `).join('');

                $('#leaderboardList').html(leaderboardHtml);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Bestenliste:', error);
            $('#leaderboardList').html('<p>Fehler beim Laden der Bestenliste</p>');
        }
    };

    /**
     * Speichert den aktuellen Punktestand des Benutzers in der API.
     * Nach erfolgreichem Speichern wird die Bestenliste neu geladen.
     */    

    const saveScore = async () => {
        try {
            await $.ajax({
                url: '/api/leaderboard',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    score: currentScore,
                    questions_total: questions.length,
                    questions_correct: currentScore / 10
                }),
                xhrFields: {
                    withCredentials: true
                }
            });
            // Bestenliste nach dem Speichern neu laden
            await loadLeaderboard();
        } catch (error) {
            console.error('Fehler beim Speichern des Scores:', error);
        }
    };

    /**
     * Lädt Fragen von anderen Benutzern aus der API und speichert sie in der `questions`-Variable.
     * Zeigt die erste Frage an oder eine Nachricht, wenn keine Fragen verfügbar sind.
     */

    const loadOtherQuestions = async () => {
        try {
            const response = await $.ajax({
                url: '/api/other-questions',
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                }
            });

            if (response.success && response.questions.length > 0) {
                questions = response.questions;
                updateDisplay();
            } else {
                $('.question-container').html('<h2>Keine Fragen von anderen Benutzern verfügbar.</h2>');
            }
        } catch (error) {
            console.error('Fehler beim Laden der Fragen:', error);
        }
    };

    /**
     * Aktualisiert die Anzeige der aktuellen Frage, ihrer Antworten und des Punktestandes.
     * Wird aufgerufen, wenn eine neue Frage angezeigt werden soll.
     */
    const updateDisplay = () => {
        if (currentQuestionIndex >= questions.length) return;
        
        const question = questions[currentQuestionIndex];
        $('#currentQuestion').text(question.question);
        $('#A').text(`A: ${question.answer_a}`);
        $('#B').text(`B: ${question.answer_b}`);
        $('#C').text(`C: ${question.answer_c}`);
        $('#D').text(`D: ${question.answer_d}`);
        $('#questionCounter').text(`Frage ${currentQuestionIndex + 1} von ${questions.length}`);
        $('#score').text(`Punkte: ${currentScore}`);
    };

    $('.answer').click(function() {
        if (hasAnswered) return;
        hasAnswered = true;

        const selectedAnswer = $(this).attr('id');
        const correctAnswer = questions[currentQuestionIndex].correct_answer;

        if (selectedAnswer === correctAnswer) {
            $(this).addClass('correct');
            currentScore += 10;
            $('#score').text(`Punkte: ${currentScore}`);
        } else {
            $(this).addClass('incorrect');
            $(`#${correctAnswer}`).addClass('correct');
        }

        $('#nextQuestion').prop('disabled', false);
    });

    /**
     * Wird aufgerufen, wenn der Benutzer auf "Nächste Frage" klickt.
     * Zeigt die nächste Frage an oder beendet das Quiz, wenn alle Fragen beantwortet wurden.
     * Beim Beenden wird der Punktestand gespeichert und eine Abschlussnachricht angezeigt.
     */
    
    $('#nextQuestion').click(async () => {
        if (!hasAnswered) {
            alert('Bitte wähle erst eine Antwort aus!');
            return;
        }

        $('.answer').removeClass('correct incorrect');
        hasAnswered = false;
        currentQuestionIndex++;

        if (currentQuestionIndex >= questions.length) {
            // Quiz beendet
            await saveScore();
            $('.quiz-container').html(`
                <div class="quiz-end">
                    <h2>Quiz beendet!</h2>
                    <p>Dein Ergebnis: ${currentScore} Punkte</p>
                    <p>Du hast ${currentScore/10} von ${questions.length} Fragen richtig beantwortet!</p>
                    <button onclick="location.reload()" class="quiz-button">Erneut spielen</button>
                    <button onclick="window.location.href='/html/quizMode.html'" class="quiz-button">Zurück zum Menü</button>
                </div>
            `);
        } else {
            updateDisplay();
        }
    });

    // Starte das Quiz
    loadOtherQuestions();
    // Lade initial die Bestenliste
    loadLeaderboard();
    // Aktualisiere die Bestenliste alle 30 Sekunden
    setInterval(loadLeaderboard, 30000);
});