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

// Add a new element
const menuContent = document.querySelector('.menu-content');
const victoryContent = document.querySelector('.victory-content');

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
let clickLocked = false; // Additional lock for rapid clicking
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
flipSound.volume = 0.5;

const matchSound = new Audio();
matchSound.src = 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3';
matchSound.volume = 0.6;

const victorySound = new Audio();
victorySound.src = 'https://assets.mixkit.co/active_storage/sfx/1010/1010-preview.mp3';
victorySound.volume = 0.7;

const wrongMatchSound = new Audio();
wrongMatchSound.src = 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3';
wrongMatchSound.volume = 0.3;

const clickSound = new Audio();
clickSound.src = 'https://assets.mixkit.co/active_storage/sfx/1115/1115-preview.mp3';
clickSound.volume = 0.3;

// Initialize the game
function initGame() {
    // Check if browser supports localStorage
    if (!storageAvailable('localStorage')) {
        console.warn('LocalStorage is not available. Game records will not be saved.');
    }
    
    loadRecords();
    addEventListeners();
    showMenuScreen();
    
    // Check if sound preference was previously set
    const savedSoundSetting = localStorage.getItem('soundEnabled');
    if (savedSoundSetting !== null) {
        soundEnabled = savedSoundSetting === 'true';
        updateSoundIcon();
    }
    
    // Preload sounds
    preloadSounds();
}

// Check if storage is available
function storageAvailable(type) {
    try {
        const storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

// Preload sounds to avoid delay on first play
function preloadSounds() {
    [flipSound, matchSound, victorySound, wrongMatchSound, clickSound].forEach(sound => {
        sound.load();
        // Play and immediately pause to initialize
        sound.play().catch(() => {/* Silently catch any autoplay restrictions */});
        sound.pause();
        sound.currentTime = 0;
    });
}

// Event listeners
function addEventListeners() {
    // Difficulty buttons
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(clickSound);
            const difficulty = btn.getAttribute('data-difficulty');
            startGame(difficulty);
        });
    });
    
    // Game control buttons
    restartBtn.addEventListener('click', () => {
        playSound(clickSound);
        restartGame();
    });
    
    menuBtn.addEventListener('click', () => {
        playSound(clickSound);
        showMenuScreen();
    });
    
    playAgainBtn.addEventListener('click', () => {
        playSound(clickSound);
        restartGame();
    });
    
    backToMenuBtn.addEventListener('click', () => {
        playSound(clickSound);
        showMenuScreen();
    });
    
    // Sound toggle
    toggleSoundBtn.addEventListener('click', toggleSound);
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    // Handle visibility change to pause game when tab is inactive
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Close menu when clicking outside the menu content
    menuScreen.addEventListener('click', (e) => {
        if (e.target === menuScreen) {
            // Only close if a game is already in progress
            if (currentDifficulty) {
                menuScreen.style.display = 'none';
            }
        }
    });
    
    // Prevent clicks on menu content from bubbling to parent
    menuContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Close victory screen when clicking outside
    victoryScreen.addEventListener('click', (e) => {
        if (e.target === victoryScreen) {
            hideVictoryScreen();
        }
    });
    
    // Prevent clicks on victory content from bubbling to parent
    victoryContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Add confetti effect on victory
    document.addEventListener('confetti', createConfetti);
}

// Handle key presses
function handleKeyPress(e) {
    // ESC key to return to menu
    if (e.key === 'Escape') {
        showMenuScreen();
    }
    
    // R key to restart game
    if (e.key === 'r' && currentDifficulty) {
        restartGame();
    }
    
    // M key to toggle sound
    if (e.key === 'm') {
        toggleSound();
    }
}

// Handle page visibility changes
function handleVisibilityChange() {
    if (document.hidden && gameStarted) {
        // Pause timer when tab is inactive
        clearInterval(timerInterval);
    } else if (!document.hidden && gameStarted && !matchedCards.length === cards.length) {
        // Resume timer when tab is active again
        startTimer();
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundIcon();
    
    // Save sound preference
    localStorage.setItem('soundEnabled', soundEnabled);
    
    // Add a quick animation
    toggleSoundBtn.classList.add('pulse');
    setTimeout(() => toggleSoundBtn.classList.remove('pulse'), 300);
}

// Update sound icon based on current state
function updateSoundIcon() {
    soundIcon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

// Play sound
function playSound(sound) {
    if (soundEnabled) {
        // Clone the sound to avoid issues with overlapping plays
        const soundClone = sound.cloneNode();
        soundClone.volume = sound.volume;
        soundClone.play().catch(() => {/* Silently catch any autoplay restrictions */});
    }
}

// Start a new game with the selected difficulty
function startGame(difficulty) {
    if (!difficulty) {
        console.error('No difficulty selected');
        return;
    }
    
    currentDifficulty = difficulty;
    const config = difficultiesConfig[difficulty];
    
    // Remove any new record message if it exists
    const newRecordMsg = document.querySelector('.new-record');
    if (newRecordMsg) {
        newRecordMsg.remove();
    }
    
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedCards = [];
    moves = 0;
    timer = 0;
    gameStarted = false;
    isProcessing = false;
    clickLocked = false;
    
    // Update UI
    movesElement.textContent = moves;
    timeElement.textContent = formatTime(timer);
    
    // Clear any existing timer
    clearInterval(timerInterval);
    
    // Generate cards
    generateCards(config.pairs);
    
    // Update the game board layout
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    
    // Add a class to the game board for different difficulty levels
    gameBoard.className = 'game-board ' + difficulty;
    
    // Add a nice animation to the game board
    gameBoard.classList.add('board-appear');
    setTimeout(() => {
        gameBoard.classList.remove('board-appear');
    }, 1000);
    
    // Adjust sizes for optimal viewing
    const cardSize = calculateOptimalCardSize(config.cols, config.rows);
    document.documentElement.style.setProperty('--card-size', `${cardSize}px`);
    
    // Hide menu screen
    menuScreen.style.display = 'none';
    victoryScreen.style.display = 'none';
}

// Calculate optimal card size based on viewport and grid dimensions
function calculateOptimalCardSize(cols, rows) {
    const containerWidth = gameBoard.clientWidth;
    const containerHeight = gameBoard.clientHeight;
    
    // Ensure minimum card sizes regardless of screen size
    const minCardSize = 80;
    
    // Calculate available space accounting for gaps
    const maxCardWidth = Math.max((containerWidth / cols) - 16, minCardSize); // Account for gap
    const maxCardHeight = Math.max((containerHeight / rows) - 16, minCardSize); // Account for gap
    
    // Use aspect ratio but ensure minimum size
    return Math.max(Math.min(maxCardWidth, (maxCardHeight * 0.75)), minCardSize); // Keep aspect ratio
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
    if (isProcessing || clickLocked) return;
    
    const card = cards.find(c => c.id === cardId);
    
    // Ignore clicks on already flipped or matched cards
    if (!card || card.isFlipped || card.isMatched) return;
    
    // Start timer on first move
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Briefly lock clicks to prevent double-click issues
    clickLocked = true;
    setTimeout(() => {
        clickLocked = false;
    }, 300);
    
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
        
        // Add wrong animation class
        const cardElements = document.querySelectorAll('.card.flipped');
        cardElements.forEach(el => {
            el.classList.add('wrong');
            setTimeout(() => {
                el.classList.remove('wrong');
            }, 500);
        });
    }
    
    // Clear flipped cards
    flippedCards = [];
    
    // Update UI
    renderCards();
}

// Start the timer
function startTimer() {
    // Clear any existing timer first
    clearInterval(timerInterval);
    
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
    let isNewRecord = false;
    
    if (!currentRecord || timer < parseInt(currentRecord)) {
        localStorage.setItem(`record_${currentDifficulty}`, timer);
        updateRecordDisplay();
        isNewRecord = true;
    }
    
    // Create a custom event to trigger confetti
    const confettiEvent = new Event('confetti');
    
    // Show victory screen with slight delay for animations to finish
    setTimeout(() => {
        playSound(victorySound);
        victoryScreen.style.display = 'flex';
        
        // If it's a new record, show a special message
        if (isNewRecord) {
            const recordMsg = document.createElement('div');
            recordMsg.className = 'new-record';
            recordMsg.innerHTML = '<i class="fas fa-trophy"></i> New Record!';
            document.querySelector('.victory-content h2').after(recordMsg);
            
            // Dispatch the confetti event
            document.dispatchEvent(confettiEvent);
        }
    }, 500);
}

// Restart the current game
function restartGame() {
    if (!currentDifficulty) {
        // If no game has been started yet, just show the menu
        showMenuScreen();
        return;
    }
    
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

// Reset all game records
function resetRecords() {
    if (confirm('Are you sure you want to reset all game records?')) {
        localStorage.removeItem('record_easy');
        localStorage.removeItem('record_medium');
        localStorage.removeItem('record_hard');
        updateRecordDisplay();
    }
}

// Add a function to hide victory screen
function hideVictoryScreen() {
    victoryScreen.style.display = 'none';
}

// Add confetti effect for victory celebration
function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    const colors = ['#fd79a8', '#6c5ce7', '#00b894', '#fdcb6e', '#00cec9'];
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation completes
    setTimeout(() => {
        confettiContainer.remove();
    }, 8000);
}

// Initialize the game
document.addEventListener('DOMContentLoaded', initGame); 