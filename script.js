// JavaScript Functionality for Interactive Quiz Application
// Author: Quiz Application Developer
// Description: Comprehensive quiz system with dynamic questions, timers, and scoring

const quizData = [
    {
        question: "Which planet is known as the 'Red Planet'?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        hint: "This planet appears reddish due to iron oxide (rust) on its surface.",
        timer: 30
    },
    {
        question: "What is the largest mammal in the world?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        correct: 1,
        hint: "This marine mammal can grow up to 100 feet long and lives in the ocean.",
        timer: 25
    },
    {
        question: "In which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correct: 1,
        hint: "This was the same year the atomic bombs were dropped on Japan.",
        timer: 30
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
        hint: "This symbol comes from the Latin word 'aurum' meaning gold.",
        timer: 25
    },
    {
        question: "Which programming language is known as the 'mother of all languages'?",
        options: ["Python", "Java", "C", "Assembly"],
        correct: 2,
        hint: "This language was developed at Bell Labs and influenced many modern languages.",
        timer: 35
    },
    {
        question: "What is the speed of light in a vacuum?",
        options: ["299,792,458 m/s", "300,000,000 m/s", "186,000 miles/s", "Both A and C are correct"],
        correct: 3,
        hint: "This is one of the fundamental constants in physics, often denoted as 'c'.",
        timer: 40
    },
    {
        question: "Which artist painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2,
        hint: "This Italian Renaissance artist was also an inventor and scientist.",
        timer: 25
    }
];
// Global Variables - Quiz State Management
let currentQuestion = 0;           // Current question index
let userAnswers = [];              // Array to store user's answers
let score = 0;                     // User's final score
let globalTimeLeft = 600;          // Global quiz timer (10 minutes)
let questionTimeLeft = 0;          // Individual question timer
let globalTimerInterval;           // Global timer interval reference
let questionTimerInterval;         // Question timer interval reference
let quizStarted = false;           // Quiz state flag

// Quiz Initialization

/**
 * Initialize the quiz application
 * Resets all variables and starts the quiz from the beginning
 */
function initializeQuiz() {
    // Reset quiz state
    currentQuestion = 0;
    userAnswers = [];
    score = 0;
    globalTimeLeft = 600; // 10 minutes
    quizStarted = true;
    
    // Hide results and show quiz content
    document.getElementById('resultsContainer').classList.remove('show');
    document.getElementById('quizContent').style.display = 'block';
    
    // Start global timer
    startGlobalTimer();
    
    // Generate quiz HTML structure
    generateQuizHTML();
    
    // Display first question
    showQuestion(0);
    
    // Update progress bar
    updateProgressBar();
}

/**
 * Dynamically generate HTML structure for all quiz questions
 * This approach allows for easy expansion of the question bank
 */
function generateQuizHTML() {
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = '';

    // Iterate through each question in the quiz data
    quizData.forEach((questionData, index) => {
        const questionContainer = document.createElement('div');
        questionContainer.className = 'question-container';
        questionContainer.id = `question-${index}`;

        // Generate HTML for each question
        questionContainer.innerHTML = `
            <div class="question-header">
                <span class="question-number">Question ${index + 1} of ${quizData.length}</span>
                <span class="question-timer" id="questionTimer-${index}">⏰ ${questionData.timer}s</span>
            </div>
            
            <div class="question-text">
                ${questionData.question}
                <button class="hint-button" onclick="showHint(${index})">💡 Hint</button>
            </div>
            
            <div class="hint-text" id="hint-${index}">
                <strong>Hint:</strong> ${questionData.hint}
            </div>
            
            <div class="answers-grid">
                ${questionData.options.map((option, optionIndex) => `
                    <div class="answer-option" onclick="selectAnswer(${index}, ${optionIndex})">
                        <div class="radio-custom"></div>
                        <input type="radio" name="question-${index}" value="${optionIndex}" id="q${index}-a${optionIndex}">
                        <span class="answer-text">${option}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="control-buttons">
                <button class="btn btn-secondary" onclick="previousQuestion()" ${index === 0 ? 'style="visibility: hidden;"' : ''}>
                    ← Previous
                </button>
                <button class="btn btn-primary" onclick="${index === quizData.length - 1 ? 'submitQuiz()' : 'nextQuestion()'}">
                    ${index === quizData.length - 1 ? '🏁 Submit Quiz' : 'Next →'}
                </button>
            </div>
        `;

        quizContent.appendChild(questionContainer);
    });
}
// Timer Management System

/**
 * Start the global quiz timer (10 minutes total)
 * Auto-submits quiz when time expires
 */
function startGlobalTimer() {
    globalTimerInterval = setInterval(() => {
        globalTimeLeft--;
        updateGlobalTimerDisplay();
        
        // Auto-submit when time runs out
        if (globalTimeLeft <= 0) {
            clearInterval(globalTimerInterval);
            autoSubmitQuiz();
        }
    }, 1000);
}

/**
 * Start individual question timer
 * @param {number} questionIndex - Index of current question
 */
function startQuestionTimer(questionIndex) {
    questionTimeLeft = quizData[questionIndex].timer;
    
    questionTimerInterval = setInterval(() => {
        questionTimeLeft--;
        updateQuestionTimerDisplay(questionIndex);
        
        // Auto-advance when question time expires
        if (questionTimeLeft <= 0) {
            clearInterval(questionTimerInterval);
            if (questionIndex < quizData.length - 1) {
                nextQuestion();
            } else {
                submitQuiz();
            }
        }
    }, 1000);
}

/**
 * Update global timer display in MM:SS format
 */
function updateGlobalTimerDisplay() {
    const minutes = Math.floor(globalTimeLeft / 60);
    const seconds = globalTimeLeft % 60;
    document.getElementById('globalTimer').textContent = 
        `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Update question timer display with color coding
 * @param {number} questionIndex - Index of current question
 */
function updateQuestionTimerDisplay(questionIndex) {
    const timerElement = document.getElementById(`questionTimer-${questionIndex}`);
    if (timerElement) {
        timerElement.textContent = `⏰ ${questionTimeLeft}s`;
        
        // Visual warning when time is running low
        if (questionTimeLeft <= 10) {
            timerElement.style.background = '#ff4757'; // Red
        } else if (questionTimeLeft <= 20) {
            timerElement.style.background = '#ffa502'; // Orange
        }
    }
}
// Question Navigation System

/**
 * Display specific question and manage timers
 * @param {number} questionIndex - Index of question to show
 */
function showQuestion(questionIndex) {
    // Hide all question containers
    document.querySelectorAll('.question-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Show current question with animation
    document.getElementById(`question-${questionIndex}`).classList.add('active');
    
    // Clear previous question timer
    if (questionTimerInterval) {
        clearInterval(questionTimerInterval);
    }
    
    // Start new question timer
    startQuestionTimer(questionIndex);
    
    // Update progress indicator
    updateProgressBar();
    
    // Restore previously selected answer if exists
    if (userAnswers[questionIndex] !== undefined) {
        const selectedOption = document.querySelector(
            `#question-${questionIndex} .answer-option:nth-child(${userAnswers[questionIndex] + 1})`
        );
        if (selectedOption) {
            selectedOption.classList.add('selected');
            selectedOption.querySelector('input[type="radio"]').checked = true;
        }
    }
}

/**
 * Navigate to next question
 */
function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        showQuestion(currentQuestion);
    }
}

/**
 * Navigate to previous question
 */
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion(currentQuestion);
    }
}
// Answer Selection and Hint System

/**
 * Handle answer selection with visual feedback
 * @param {number} questionIndex - Index of the question
 * @param {number} answerIndex - Index of selected answer
 */
function selectAnswer(questionIndex, answerIndex) {
    // Remove previous selection styling
    document.querySelectorAll(`#question-${questionIndex} .answer-option`).forEach(option => {
        option.classList.remove('selected');
        option.querySelector('input[type="radio"]').checked = false;
    });
    
    // Apply selection styling to chosen option
    const selectedOption = document.querySelector(
        `#question-${questionIndex} .answer-option:nth-child(${answerIndex + 1})`
    );
    selectedOption.classList.add('selected');
    selectedOption.querySelector('input[type="radio"]').checked = true;
    
    // Store user's answer
    userAnswers[questionIndex] = answerIndex;
}

/**
 * Toggle hint visibility for specific question
 * @param {number} questionIndex - Index of the question
 */
function showHint(questionIndex) {
    const hintElement = document.getElementById(`hint-${questionIndex}`);
    if (hintElement.style.display === 'block') {
        hintElement.style.display = 'none';
    } else {
        hintElement.style.display = 'block';
    }
}
// Progress Tracking


/**
 * Update visual progress bar based on current question
 */
function updateProgressBar() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}
// Quiz Submission and Scoring

/**
 * Submit quiz and calculate final score
 */
function submitQuiz() {
    // Clear all active timers
    if (globalTimerInterval) clearInterval(globalTimerInterval);
    if (questionTimerInterval) clearInterval(questionTimerInterval);
    
    // Calculate total score
    score = 0;
    for (let i = 0; i < quizData.length; i++) {
        if (userAnswers[i] === quizData[i].correct) {
            score++;
        }
    }
    
    // Display results
    showResults();
}

/**
 * Auto-submit quiz when global timer expires
 */
function autoSubmitQuiz() {
    submitQuiz();
}
// Results Display and Analysis

/**
 * Display comprehensive quiz results with performance analysis
 */
function showResults() {
    // Hide quiz interface
    document.getElementById('quizContent').style.display = 'none';
    
    // Show results with animation
    document.getElementById('resultsContainer').classList.add('show');
    
    // Update score displays
    document.getElementById('scoreDisplay').textContent = `${score}/${quizData.length}`;
    document.getElementById('scoreText').textContent = 
        `You scored ${score} out of ${quizData.length} questions correctly`;
    
    // Calculate percentage and provide personalized feedback
    const percentage = Math.round((score / quizData.length) * 100);
    const messageElement = document.getElementById('performanceMessage');
    
    // Performance-based feedback system
    if (percentage >= 90) {
        messageElement.textContent = `🏆 Excellent! You scored ${percentage}%! You're a true knowledge master!`;
        messageElement.className = 'performance-message excellent';
    } else if (percentage >= 70) {
        messageElement.textContent = `🎉 Great job! You scored ${percentage}%! Well done!`;
        messageElement.className = 'performance-message good';
    } else if (percentage >= 50) {
        messageElement.textContent = `👍 Not bad! You scored ${percentage}%! Keep studying!`;
        messageElement.className = 'performance-message average';
    } else {
        messageElement.textContent = `📚 You scored ${percentage}%. Don't worry, practice makes perfect!`;
        messageElement.className = 'performance-message poor';
    }
}

// Quiz Control Functions

/**
 * Restart the entire quiz from the beginning
 */
function restartQuiz() {
    initializeQuiz();
}
// Event Listeners and Initialization


// Initialize quiz when page loads
window.addEventListener('load', initializeQuiz);

// Prevent accidental page refresh during active quiz
window.addEventListener('beforeunload', (e) => {
    if (quizStarted && currentQuestion < quizData.length) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
    }
});
// Utility Functions

/**
 * Add new questions to the quiz dynamically
 * @param {Object} newQuestion - Question object with required properties
 */
function addQuestion(newQuestion) {
    // Validate question structure
    const requiredProps = ['question', 'options', 'correct', 'hint', 'timer'];
    const isValid = requiredProps.every(prop => newQuestion.hasOwnProperty(prop));
    
    if (isValid && Array.isArray(newQuestion.options) && newQuestion.options.length >= 2) {
        quizData.push(newQuestion);
        console.log('Question added successfully');
    } else {
        console.error('Invalid question format');
    }
}

/**
 * Get current quiz statistics
 * @returns {Object} Quiz statistics object
 */
function getQuizStats() {
    return {
        totalQuestions: quizData.length,
        currentQuestion: currentQuestion + 1,
        answeredQuestions: userAnswers.filter(answer => answer !== undefined).length,
        timeRemaining: globalTimeLeft,
        progressPercentage: Math.round(((currentQuestion + 1) / quizData.length) * 100)
    };
}