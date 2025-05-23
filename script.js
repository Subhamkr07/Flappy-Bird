// Get references to HTML elements
const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d');
const img = new Image();
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
let gamePlaying = false; 
const gravity = 0.5;    
const speed = 6.2;      
const size = [51, 36];  // Bird size [width, height]
const jump = -11.5;     

// cTenth will now be calculated dynamically based on canvas.width
let cTenth; 

let index = 0;          
let bestScore = 0;      
let flight;             
let flyHeight;          
let currentScore;       
let pipes = [];         

// Pipe settings
const pipeWidth = 78;
const pipeGap = 270;
// pipeLoc will now use the dynamically set canvas.height
let pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

/**
 * Dynamically resizes the canvas's internal drawing buffer to match its display size.
 * This is crucial for responsiveness to prevent stretching and ensure crisp rendering.
 */
const resizeCanvas = () => {
    // Get the actual computed width and height of the canvas element as rendered by CSS
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Recalculate cTenth and pipeLoc based on the new canvas dimensions
    cTenth = (canvas.width / 10);
    pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

    // Re-setup the game to adjust pipe positions and bird position to the new canvas size
    // This is important so pipes don't appear out of place after a resize.
    setup(); 
};


/**
 * Initializes or resets all game variables to their starting values.
 * Also manages the visibility of the start/game over screens.
 */
const setup = () => {
    currentScore = 0;
    scoreDisplay.textContent = currentScore; 
    
    flight = jump; 

    flyHeight = (canvas.height / 2) - (size[1] / 2);

    // Setup first 3 pipes, positioned horizontally off-screen to the right,
    // using the potentially new canvas.width
    pipes = Array(3).fill().map((_, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);

    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    canvas.style.display = 'block';
};

/**
 * The main game rendering and logic loop.
 */
const render = () => {
    index++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

    if (gamePlaying) {
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        pipes.forEach(pipe => {
            pipe[0] -= speed;

            ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
            ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

            if (pipe[0] + pipeWidth < cTenth && pipe[0] + pipeWidth + speed >= cTenth) {
                currentScore++;
                scoreDisplay.textContent = currentScore; 
                bestScore = Math.max(bestScore, currentScore); 
                bestScoreDisplay.textContent = bestScore;       
            }

            if (pipe[0] <= -pipeWidth) {
                pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
            }

            if (
                cTenth + size[0] > pipe[0] &&          
                cTenth < pipe[0] + pipeWidth &&        
                (flyHeight < pipe[1] || flyHeight + size[1] > pipe[1] + pipeGap) 
            ) {
                gamePlaying = false; 
                finalScoreDisplay.textContent = currentScore; 
                gameOverScreen.classList.remove('hidden');    
            }
        });

        flight += gravity;
        flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);

        if (flyHeight >= canvas.height - size[1]) {
            gamePlaying = false; 
            finalScoreDisplay.textContent = currentScore; 
            gameOverScreen.classList.remove('hidden');    
        }

        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);

    } else {
        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);

        if (!startScreen.classList.contains('hidden')) {
            ctx.font = "bold 30px 'Press Start 2P'"; 
            ctx.fillStyle = '#fff';   
            ctx.strokeStyle = '#000'; 
            ctx.lineWidth = 3;        

            ctx.strokeText(`Best score : ${bestScore}`, 85, canvas.height / 2 - 50); // Adjusted Y position
            ctx.fillText(`Best score : ${bestScore}`, 85, canvas.height / 2 - 50);

            ctx.strokeText('Click to play', 90, canvas.height / 2 + 100); // Adjusted Y position
            ctx.fillText('Click to play', 90, canvas.height / 2 + 100);
        }
    }

    window.requestAnimationFrame(render);
};

// --- Event Listeners ---

startButton.addEventListener('click', () => {
    gamePlaying = true;    
    setup();               
});

restartButton.addEventListener('click', () => {
    gamePlaying = true;    
    setup();               
});

document.addEventListener('click', () => {
    if (gamePlaying) {
        flight = jump; 
    }
});

// --- Initial setup and responsiveness ---

// Call resizeCanvas initially to set up dimensions
// This ensures canvas dimensions are set correctly immediately.
resizeCanvas();

// Call resizeCanvas whenever the window is resized
window.addEventListener('resize', resizeCanvas);

// Ensures the game rendering loop starts only after the image is fully loaded.
// render will implicitly call setup() through resizeCanvas() on first load.
img.onload = render;
