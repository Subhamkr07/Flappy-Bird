// Get references to HTML elements
const canvas = document.getElementById('gameCanvas'); 

// --- FIX FOR NARROW DISPLAY: Set canvas internal resolution ---
// These dimensions should ideally match the width of your .game-container in CSS
// and the fixed height you set for the canvas in CSS.
canvas.width = 431; // Matches the 'width: 431px;' of your .game-container
canvas.height = 480; // Matches the 'height: 480px;' of your canvas in CSS
// -----------------------------------------------------------

const ctx = canvas.getContext('2d');
const img = new Image();
// This image is a sprite sheet for Flappy Bird, used for background and bird/pipes.
img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

// Get references to score and screen elements (IDs from updated HTML)
const scoreDisplay = document.getElementById('currentScoreDisplay'); 
const bestScoreDisplay = document.getElementById('bestScoreDisplay'); 
const finalScoreDisplay = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// General game settings
let gamePlaying = false; // Controls if the game is active
const gravity = 0.5;    // How fast the bird falls
const speed = 6.2;      // Horizontal speed of pipes and background
const size = [51, 36];  // Bird size [width, height] from the sprite sheet
const jump = -11.5;     // How much the bird jumps upwards
// Bird's horizontal position on the canvas (1/10th of canvas width from left)
const cTenth = (canvas.width / 10);

let index = 0;          // Used for animation frames and background scrolling
let bestScore = 0;      // Stores the highest score achieved
let flight;             // Bird's current vertical speed (affected by gravity)
let flyHeight;          // Bird's current vertical position
let currentScore;       // Score for the current game
let pipes = [];         // Array to hold pipe positions and properties

// Pipe settings
const pipeWidth = 78;   // Width of the pipes
const pipeGap = 270;    // Vertical gap between top and bottom pipes
// Function to determine random Y position for the top pipe's bottom edge
const pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

/**
 * Initializes or resets all game variables to their starting values.
 * Also manages the visibility of the start/game over screens.
 */
const setup = () => {
    currentScore = 0;
    scoreDisplay.textContent = currentScore; // Update the current score display in HTML
    
    // Set bird's initial jump force (it will immediately start falling due to gravity)
    flight = jump; 

    // Set initial bird height to the middle of the canvas
    flyHeight = (canvas.height / 2) - (size[1] / 2);

    // Setup first 3 pipes, positioned horizontally off-screen to the right,
    // with a gap between them.
    pipes = Array(3).fill().map((_, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);

    // Initially, show the start screen and hide the game over screen
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    // Ensure the canvas is visible
    canvas.style.display = 'block';
};

/**
 * The main game rendering and logic loop.
 * This function is called repeatedly by `window.requestAnimationFrame` for smooth animation.
 */
const render = () => {
    // Increment index for animating sprites and scrolling background
    index++;

    // Clear the entire canvas to prepare for redrawing the next frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw repeating background (first part) to create a continuous scroll effect
    // The background image is drawn from the sprite sheet's top-left (0,0) to fill canvas dimensions.
    // The X position is shifted based on 'index' and 'speed' and then wrapped using modulo.
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
    // Draw repeating background (second part)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

    // Game logic only runs when gamePlaying is true
    if (gamePlaying) {
        // Hide start and game over screens during active gameplay
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        // Iterate through each pipe to update its position and check for collisions/scoring
        pipes.forEach(pipe => {
            // Move pipe to the left based on game speed
            pipe[0] -= speed;

            // Draw top pipe section
            // Source coordinates (432, 588 - pipe[1]) point to the pipe sprite in the image.
            // pipe[1] determines the height of the top pipe (its bottom edge Y coordinate).
            ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
            
            // Draw bottom pipe section
            // Source coordinates (432 + pipeWidth, 108) point to the bottom pipe sprite.
            // pipe[1] + pipeGap determines the top edge Y coordinate of the bottom pipe.
            ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

            // Check if bird has successfully passed a pipe (for scoring)
            // This condition ensures score is incremented only once per pipe
            if (pipe[0] + pipeWidth < cTenth && pipe[0] + pipeWidth + speed >= cTenth) {
                currentScore++;
                scoreDisplay.textContent = currentScore; // Update current score display
                bestScore = Math.max(bestScore, currentScore); // Update best score if current is higher
                bestScoreDisplay.textContent = bestScore;       // Update best score display
            }

            // If a pipe moves completely off-screen to the left, remove it and add a new one
            if (pipe[0] <= -pipeWidth) {
                // Creates a new 'pipes' array: all pipes except the first, plus a new pipe at the end.
                pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
            }

            // Collision detection: Check if the bird hits the current pipe
            // Conditions:
            // 1. Bird's right edge overlaps pipe's left edge
            // 2. Bird's left edge overlaps pipe's right edge
            // 3. Bird's top edge is above top pipe's bottom edge OR Bird's bottom edge is below bottom pipe's top edge
            if (
                cTenth + size[0] > pipe[0] &&          // Bird's right side past pipe's left side
                cTenth < pipe[0] + pipeWidth &&        // Bird's left side before pipe's right side
                (flyHeight < pipe[1] || flyHeight + size[1] > pipe[1] + pipeGap) // Bird hits top or bottom part of pipe
            ) {
                gamePlaying = false; // End the game
                finalScoreDisplay.textContent = currentScore; // Display final score on game over screen
                gameOverScreen.classList.remove('hidden');    // Show game over screen
            }
        });

        // Apply gravity: increase bird's downward speed
        flight += gravity;
        // Update bird's vertical position, preventing it from falling below the canvas bottom
        flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);

        // Check if bird hits the ground (bottom of the canvas)
        if (flyHeight >= canvas.height - size[1]) {
            gamePlaying = false; // End the game
            finalScoreDisplay.textContent = currentScore; // Display final score
            gameOverScreen.classList.remove('hidden');    // Show game over screen
        }

        // Draw the bird animation
        // The bird's sprite changes every 3 frames ((index % 9) / 3) to create a flapping effect.
        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);

    } else {
        // Game is not playing (either start screen or game over screen is displayed)
        // Draw the bird in the center for the start/game over screen preview
        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);

        // Display "Best score" and "Click to play" text on the start screen
        // Only draw this text if the start screen HTML element is currently visible
        if (!startScreen.classList.contains('hidden')) {
            // Set font properties for the text
            ctx.font = "bold 30px 'Press Start 2P'"; // Use the imported font
            ctx.fillStyle = '#fff';   // White fill color for text
            ctx.strokeStyle = '#000'; // Black stroke/outline for text
            ctx.lineWidth = 3;        // Thickness of the text outline

            // Draw best score text
            ctx.strokeText(`Best score : ${bestScore}`, 85, 245);
            ctx.fillText(`Best score : ${bestScore}`, 85, 245);

            // Draw "Click to play" text
            ctx.strokeText('Click to play', 90, 535);
            ctx.fillText('Click to play', 90, 535);
        }
    }

    // Request the next animation frame, making the render function loop continuously
    window.requestAnimationFrame(render);
};

// --- Event Listeners ---

// Event listener for the "Start Game" button
startButton.addEventListener('click', () => {
    gamePlaying = true;    // Set game state to playing
    setup();               // Initialize game variables and hide start screen
});

// Event listener for the "Play Again" button (on game over screen)
restartButton.addEventListener('click', () => {
    gamePlaying = true;    // Set game state to playing
    setup();               // Reset game variables and hide game over screen
});

// Event listener for any click on the document to make the bird jump
// This only works if the game is currently playing
document.addEventListener('click', () => {
    if (gamePlaying) {
        flight = jump; // Apply the jump force to the bird
    }
});

// Initial setup call when the script first loads
setup();

// Ensures the game rendering loop starts only after the bird/pipe image is fully loaded.
// This prevents drawing issues if the image isn't ready.
img.onload = render;
