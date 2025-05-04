// DOM Elements
const gameBoard = document.getElementById('game-board');
const menuScreen = document.getElementById('menu-screen');
const victoryScreen = document.getElementById('victory-screen');
const timeElement = document.getElementById('time');
const movesElement = document.getElementById('moves');
const finalTimeElement = document.getElementById('final-time');
const finalMovesElement = document.getElementById('final-moves');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const toggleSoundBtn = document.getElementById('toggle-sound');
const soundIcon = document.getElementById('sound-icon');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const easyRecordElement = document.getElementById('easy-record');
const mediumRecordElement = document.getElementById('medium-record');
const hardRecordElement = document.getElementById('hard-record');

// Game state variables
let cards = [];
let flippedCards = [];
let matchedCards = [];
let moves = 0;
let timer = 0;
let timerInterval;
let soundEnabled = true;
let currentDifficulty = '';
let gameStarted = false;
let isProcessing = false;
let cardIcons = [
    'fa-heart', 'fa-star', 'fa-bolt', 'fa-cloud', 'fa-moon', 'fa-sun',
    'fa-bell', 'fa-fire', 'fa-gem', 'fa-snowflake', 'fa-tree', 'fa-crown',
    'fa-ghost', 'fa-car', 'fa-plane', 'fa-rocket', 'fa-gamepad', 'fa-gift',
    'fa-music', 'fa-camera', 'fa-paw', 'fa-leaf', 'fa-lemon', 'fa-pizza-slice'
];

// Difficulty settings
const difficultiesConfig = {
    easy: { cols: 4, rows: 3, pairs: 6 },
    medium: { cols: 6, rows: 3, pairs: 9 },
    hard: { cols: 6, rows: 4, pairs: 12 }
};

// Audio elements
const flipSound = new Audio();
flipSound.src = 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3';

const matchSound = new Audio();
matchSound.src = 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3';

const victorySound = new Audio();
victorySound.src = 'https://assets.mixkit.co/active_storage/sfx/1010/1010-preview.mp3';

const wrongMatchSound = new Audio();
wrongMatchSound.src = 'https://assets.mixkit.co/active_storage/sfx/2/2-preview.mp3';

// Initialize the game
function initGame() {
    loadRecords();
    addEventListeners();
    showMenuScreen();
}

// Event listeners
function addEventListeners() {
    // Difficulty buttons
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.getAttribute('data-difficulty');
            startGame(difficulty);
        });
    });
    
    // Game control buttons
    restartBtn.addEventListener('click', restartGame);
    menuBtn.addEventListener('click', showMenuScreen);
    playAgainBtn.addEventListener('click', restartGame);
    backToMenuBtn.addEventListener('click', showMenuScreen);
    
    // Sound toggle
    toggleSoundBtn.addEventListener('click', toggleSound);
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundIcon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    
    // Add a quick animation
    toggleSoundBtn.classList.add('pulse');
    setTimeout(() => toggleSoundBtn.classList.remove('pulse'), 300);
}

// Play sound
function playSound(sound) {
    if (soundEnabled) {
        sound.currentTime = 0;
        sound.play();
    }
}

// Start a new game with the selected difficulty
function startGame(difficulty) {
    currentDifficulty = difficulty;
    const config = difficultiesConfig[difficulty];
    
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedCards = [];
    moves = 0;
    timer = 0;
    gameStarted = false;
    
    // Update UI
    movesElement.textContent = moves;
    timeElement.textContent = formatTime(timer);
    
    // Clear any existing timer
    clearInterval(timerInterval);
    
    // Generate cards
    generateCards(config.pairs);
    
    // Update the game board layout
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    
    // Hide menu screen
    menuScreen.style.display = 'none';
    victoryScreen.style.display = 'none';
}

// Generate cards for the game
function generateCards(numPairs) {
    // Clear the game board
    gameBoard.innerHTML = '';
    
    // Select random icons for this game
    const gameIcons = [...cardIcons]
        .sort(() => 0.5 - Math.random())
        .slice(0, numPairs);
    
    // Create pairs of cards
    cards = [];
    
    gameIcons.forEach(icon => {
        // Create two cards with the same icon (a pair)
        for (let i = 0; i < 2; i++) {
            cards.push({
                id: Math.random().toString(36).substr(2, 9),
                icon: icon,
                isFlipped: false,
                isMatched: false
            });
        }
    });
    
    // Shuffle the cards
    cards = cards.sort(() => 0.5 - Math.random());
    
    // Render the cards
    renderCards();
}

// Render cards on the game board
function renderCards() {
    gameBoard.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`;
        cardElement.dataset.id = card.id;
        
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <i class="fas ${card.icon}"></i>
                </div>
                <div class="card-back"></div>
            </div>
        `;
        
        cardElement.addEventListener('click', () => handleCardClick(card.id));
        gameBoard.appendChild(cardElement);
    });
}

// Handle card click
function handleCardClick(cardId) {
    // Ignore clicks if already processing a pair or card is already flipped/matched
    if (isProcessing) return;
    
    const card = cards.find(c => c.id === cardId);
    
    // Ignore clicks on already flipped or matched cards
    if (card.isFlipped || card.isMatched) return;
    
    // Start timer on first move
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Flip the card
    card.isFlipped = true;
    flippedCards.push(card);
    playSound(flipSound);
    
    // Update UI
    renderCards();
    
    // If two cards are flipped, check for a match
    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        movesElement.textContent = moves;
        
        setTimeout(() => {
            checkForMatch();
            isProcessing = false;
        }, 800);
    }
}

// Check if the two flipped cards match
function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.icon === card2.icon) {
        // It's a match!
        card1.isMatched = true;
        card2.isMatched = true;
        matchedCards.push(card1, card2);
        playSound(matchSound);
        
        // Check if all cards are matched (game won)
        if (matchedCards.length === cards.length) {
            gameWon();
        }
    } else {
        // Not a match, flip them back
        card1.isFlipped = false;
        card2.isFlipped = false;
        playSound(wrongMatchSound);
    }
    
    // Clear flipped cards
    flippedCards = [];
    
    // Update UI
    renderCards();
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timeElement.textContent = formatTime(timer);
    }, 1000);
}

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// Game won
function gameWon() {
    clearInterval(timerInterval);
    
    // Update victory screen
    finalTimeElement.textContent = formatTime(timer);
    finalMovesElement.textContent = moves;
    
    // Check if it's a new record
    const currentRecord = localStorage.getItem(`record_${currentDifficulty}`);
    if (!currentRecord || timer < parseInt(currentRecord)) {
        localStorage.setItem(`record_${currentDifficulty}`, timer);
        updateRecordDisplay();
    }
    
    // Show victory screen
    setTimeout(() => {
        playSound(victorySound);
        victoryScreen.style.display = 'flex';
    }, 500);
}

// Restart the current game
function restartGame() {
    startGame(currentDifficulty);
}

// Show the menu screen
function showMenuScreen() {
    // Stop the current game
    clearInterval(timerInterval);
    
    // Show menu
    menuScreen.style.display = 'flex';
    victoryScreen.style.display = 'none';
}

// Load records from localStorage
function loadRecords() {
    updateRecordDisplay();
}

// Update record display
function updateRecordDisplay() {
    const easyRecord = localStorage.getItem('record_easy');
    const mediumRecord = localStorage.getItem('record_medium');
    const hardRecord = localStorage.getItem('record_hard');
    
    easyRecordElement.textContent = easyRecord ? formatTime(parseInt(easyRecord)) : '--:--';
    mediumRecordElement.textContent = mediumRecord ? formatTime(parseInt(mediumRecord)) : '--:--';
    hardRecordElement.textContent = hardRecord ? formatTime(parseInt(hardRecord)) : '--:--';
}

// Initialize the game
document.addEventListener('DOMContentLoaded', initGame); 