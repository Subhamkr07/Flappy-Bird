// Get references to HTML elements
const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "images/flappy-bird-set.png";

// Get references to score and screen elements (IDs from updated HTML)
const scoreDisplay = document.getElementById('currentScoreDisplay'); 
const bestScoreDisplay = document.getElementById('bestScoreDisplay'); 
const finalScoreDisplay = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const gameContainer = document.querySelector('.game-container'); // Added to reference the game container

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
    // We will call setup only if game is not playing, or on explicit start/restart
    if (!gamePlaying) {
        setup(); 
    }
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

    // Initialize best score from localStorage
    bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
    bestScoreDisplay.textContent = bestScore;

    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    canvas.style.filter = 'none'; // Remove any filters
    // The gamePlaying flag will be set to true only when 'Start Game' or 'Play Again' is clicked.
    // The render loop will start implicitly when img.onload fires or explicitly on button click.
};

/**
 * The main game rendering and logic loop.
 */
const render = () => {
    index++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background animation (scrolling effect)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

    if (gamePlaying) {
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        pipes.forEach(pipe => {
            pipe[0] -= speed;

            // Draw pipe
            ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]); // Top pipe
            ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap); // Bottom pipe

            // Update score
            if (pipe[0] + pipeWidth < cTenth && pipe[0] + pipeWidth + speed >= cTenth) {
                currentScore++;
                scoreDisplay.textContent = currentScore;
                bestScore = Math.max(bestScore, currentScore);
                bestScoreDisplay.textContent = bestScore;      
                localStorage.setItem('bestScore', bestScore); // Save best score
            }

            // Reset pipe if off-screen
            if (pipe[0] <= -pipeWidth) {
                pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
            }

            // Collision detection
            if (
                cTenth + size[0] > pipe[0] &&          
                cTenth < pipe[0] + pipeWidth &&        
                (flyHeight < pipe[1] || flyHeight + size[1] > pipe[1] + pipeGap) 
            ) {
                gameOver();
            }
        });

        // Bird physics
        flight += gravity;
        flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);

        // Collision with ground
        if (flyHeight >= canvas.height - size[1]) {
            gameOver();
        }

        // Draw bird
        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);

    } else { // Game not playing (Start or Game Over screens)
        // Draw bird for start/game over screen
        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);

        // Display start screen text
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

const gameOver = () => {
    gamePlaying = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = currentScore;
    canvas.style.filter = 'blur(4px) grayscale(60%)'; // Add blur and grayscale effect
};

const showStartScreen = () => {
    gamePlaying = false;
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden'); // Ensure game over screen is hidden
    // The resizeCanvas function below already calls setup, so no need to call it directly here.
    // Instead, ensure canvas dimensions are correct and clear it.
    resizeCanvas(); // Re-measure and set canvas size
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    canvas.style.filter = 'blur(4px) grayscale(60%)'; // Apply filter for start screen
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

// Call resizeCanvas whenever the window is resized
window.addEventListener('resize', showStartScreen); // Call showStartScreen on resize to re-render correctly


// Splash Animation Logic
document.addEventListener('DOMContentLoaded', () => {
    const logoSplash = document.getElementById('logo-splash');
    const logoImg = logoSplash.querySelector('img');

    const introText = document.createElement('div');
    introText.id = 'intro-text';
    introText.textContent = 'Prepare to Enter a New World';
    logoSplash.appendChild(introText);

    const loadingText = document.createElement('div');
    loadingText.id = 'loading-text';
    loadingText.textContent = 'Loading';
    logoSplash.appendChild(loadingText);

    introText.classList.add('animate-in');
    loadingText.style.opacity = '1';

    let dotCount = 0;
    const maxDots = 3;
    const loadingInterval = setInterval(() => {
        dotCount = (dotCount % (maxDots + 1));
        const dots = '.'.repeat(dotCount);
        loadingText.textContent = 'Loading' + dots;
        dotCount++;
    }, 300);

    const loadingPhaseDuration = 2500; // Duration for loading text and crack effect start

    setTimeout(() => {
        clearInterval(loadingInterval);
        loadingText.classList.add('fade-out');

        // Introduce crack effect from the center of the logo after a slight delay
        setTimeout(() => {
            const crackEffect = document.createElement('div');
            crackEffect.classList.add('crack-effect');
            logoSplash.appendChild(crackEffect);

            // Position the crack effect to originate from the center of the logo
            // This is handled by CSS (left: 50%; top: 50%; transform: translate(-50%, -50%))
            crackEffect.style.opacity = '1';

            // Logo appears and scales
            setTimeout(() => {
                logoImg.style.opacity = '1';
                logoImg.style.transform = 'scale(1)';

                // Logo stays on screen for 3.5 seconds after appearing fully
                setTimeout(() => {
                    // Text parts animate out
                    const words = introText.textContent.split(' ');
                    const middle = Math.ceil(words.length / 2);
                    introText.innerHTML = `<span class="intro-text-part part-left">${words.slice(0, middle).join(' ')}</span><span class="intro-text-part part-right">${words.slice(middle).join(' ')}</span>`;

                    const partLeft = introText.querySelector('.part-left');
                    const partRight = introText.querySelector('.part-right');
                    partLeft.style.transform = 'translateX(-150vw)';
                    partRight.style.transform = 'translateX(150vw)';
                    partLeft.style.opacity = '0';
                    partRight.style.opacity = '0';

                    // Fade out the entire splash screen
                    setTimeout(() => {
                        logoSplash.style.opacity = '0';
                        setTimeout(() => {
                            logoSplash.style.display = 'none';
                            gameContainer.classList.remove('hide-initial'); // Show the game container
                            
                            // Initialize the game's rendering loop and show start screen
                            // This replaces the original img.onload = render;
                            img.onload = () => {
                                showStartScreen(); 
                                window.requestAnimationFrame(render); // Start the main game loop
                            };
                            // If the image is already loaded (cached), call the onload handler immediately
                            if (img.complete) {
                                img.onload(); 
                            }

                        }, 1000); // Duration of the fade-out transition
                    }, 1200); // Delay before fading out after text parts animate out
                }, 3500); // Logo stays for 3.5 seconds
            }, 300); // Delay for logo to start appearing after crack
        }, 500); // Delay before crack effect starts
    }, loadingPhaseDuration);
});
