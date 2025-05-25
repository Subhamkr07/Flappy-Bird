// Get references to HTML elements
const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "images/flappy-bird-set.png";

// Sound effects
const soundJump = new Audio('sound/jump.wav');
const soundHit = new Audio('sound/hit.wav');
const soundPoint = new Audio('sound/point.wav');

// Get references to score and screen elements (IDs from updated HTML)
const scoreDisplay = document.getElementById('currentScoreDisplay'); 
const bestScoreDisplay = document.getElementById('bestScoreDisplay'); 
const finalScoreDisplay = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const gameContainer = document.querySelector('.game-container');

let gamePlaying = false; 
const gravity = 0.5;    
const speed = 6.2;      
const size = [51, 36];
const jump = -11.5;

let cTenth; 
let index = 0;          
let bestScore = 0;      
let flight;             
let flyHeight;          
let currentScore;       
let pipes = [];         

const pipeWidth = 78;
const pipeGap = 270;
let pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

const resizeCanvas = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    cTenth = (canvas.width / 10);
    pipeLoc = () => (Math.random() * ((canvas.height - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

    if (!gamePlaying) {
        setup(); 
    }
};

const setup = () => {
    currentScore = 0;
    scoreDisplay.textContent = currentScore;
    flight = jump;
    flyHeight = (canvas.height / 2) - (size[1] / 2);
    pipes = Array(3).fill().map((_, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
    bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
    bestScoreDisplay.textContent = bestScore;

    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    canvas.style.filter = 'none';
};

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
                localStorage.setItem('bestScore', bestScore);
                soundPoint.play(); // ✅ POINT SOUND
            }

            if (pipe[0] <= -pipeWidth) {
                pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
            }

            if (
                cTenth + size[0] > pipe[0] &&          
                cTenth < pipe[0] + pipeWidth &&        
                (flyHeight < pipe[1] || flyHeight + size[1] > pipe[1] + pipeGap) 
            ) {
                gameOver();
            }
        });

        flight += gravity;
        flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);

        if (flyHeight >= canvas.height - size[1]) {
            gameOver();
        }

        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);

    } else {
        ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);

        if (!startScreen.classList.contains('hidden')) {
            ctx.font = "bold 30px 'Press Start 2P'";
            ctx.fillStyle = '#fff';  
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;

            ctx.strokeText(`Best score : ${bestScore}`, 85, canvas.height / 2 - 50);
            ctx.fillText(`Best score : ${bestScore}`, 85, canvas.height / 2 - 50);

            ctx.strokeText('Click to play', 90, canvas.height / 2 + 100);
            ctx.fillText('Click to play', 90, canvas.height / 2 + 100);
        }
    }

    window.requestAnimationFrame(render);
};

const gameOver = () => {
    gamePlaying = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = currentScore;
    canvas.style.filter = 'blur(4px) grayscale(60%)';
    soundHit.play(); // ✅ HIT SOUND
};

const showStartScreen = () => {
    gamePlaying = false;
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.filter = 'blur(4px) grayscale(60%)';
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
        soundJump.play(); // ✅ JUMP SOUND
    }
});

window.addEventListener('resize', showStartScreen);

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

    const loadingPhaseDuration = 2500;

    setTimeout(() => {
        clearInterval(loadingInterval);
        loadingText.classList.add('fade-out');

        setTimeout(() => {
            const crackEffect = document.createElement('div');
            crackEffect.classList.add('crack-effect');
            logoSplash.appendChild(crackEffect);
            crackEffect.style.opacity = '1';

            setTimeout(() => {
                logoImg.style.opacity = '1';
                logoImg.style.transform = 'scale(1)';

                setTimeout(() => {
                    const words = introText.textContent.split(' ');
                    const middle = Math.ceil(words.length / 2);
                    introText.innerHTML = `<span class="intro-text-part part-left">${words.slice(0, middle).join(' ')}</span><span class="intro-text-part part-right">${words.slice(middle).join(' ')}</span>`;

                    const partLeft = introText.querySelector('.part-left');
                    const partRight = introText.querySelector('.part-right');
                    partLeft.style.transform = 'translateX(-150vw)';
                    partRight.style.transform = 'translateX(150vw)';
                    partLeft.style.opacity = '0';
                    partRight.style.opacity = '0';

                    setTimeout(() => {
                        logoSplash.style.opacity = '0';
                        setTimeout(() => {
                            logoSplash.style.display = 'none';
                            gameContainer.classList.remove('hide-initial');

                            img.onload = () => {
                                showStartScreen();
                                window.requestAnimationFrame(render);
                            };
                            if (img.complete) {
                                img.onload();
                            }

                        }, 1000);
                    }, 1200);
                }, 3500);
            }, 300);
        }, 500);
    }, loadingPhaseDuration);
});

