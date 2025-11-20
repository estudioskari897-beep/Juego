const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highscoreElement = document.getElementById('highscore');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let gameRunning = false;

let highscore = localStorage.getItem('strikeSnakeHighscore') || 0;
highscoreElement.textContent = highscore;

// Generar comida en posición aleatoria
function randomFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Evitar que aparezca encima de la serpiente
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            randomFood();
            return;
        }
    }
}

// Dibujar todo
function draw() {
    // Fondo
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar serpiente (estilo militar verde)
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00ff41' : '#008f11';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Ojos en la cabeza
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = 4;
            if (dx === 1) { // derecha
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 4, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 12, eyeSize, eyeSize);
            } else if (dx === -1) { // izquierda
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 12, eyeSize, eyeSize);
            } else if (dy === -1) { // arriba
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 4, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 4, eyeSize, eyeSize);
            } else if (dy === 1) { // abajo
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 12, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 12, eyeSize, eyeSize);
            }
        }
    });

    // Dibujar comida (granada estilo militar)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Detalle de la granada
    ctx.fillStyle = '#ff6666';
    ctx.fillRect(food.x * gridSize + gridSize/2 - 2, food.y * gridSize + 2, 4, 8);
}

// Actualizar juego
function update() {
    if (!gameRunning) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Colisión con paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Colisión con sí misma
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Comer comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        randomFood();
        
        // Efecto de velocidad cada 50 puntos
        if (score % 50 === 0) {
            clearInterval(gameLoop);
            gameLoop = setInterval(loop, Math.max(50, 150 - score));
        }
    } else {
        snake.pop();
    }

    draw();
}

// Game Over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    if (score > highscore) {
        highscore = score;
        highscoreElement.textContent = highscore;
        localStorage.setItem('strikeSnakeHighscore', highscore);
    }
    
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.font = '50px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('¡MISIÓN FALLIDA!', canvas.width/2, canvas.height/2 - 30);
    ctx.font = '30px Courier New';
    ctx.fillText(`Puntos: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Pulsa "Nueva Partida"', canvas.width/2, canvas.height/2 + 60);
}

// Controles
document.addEventListener('keydown', e => {
    if (!gameRunning && (e.key === ' ' || e.key === 'Enter')) {
        startGame();
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

// Iniciar juego
function startGame() {
    snake = [{ x: 10, y: 10 }];
    food = { x: 15, y: 15 };
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    
    clearInterval(gameLoop);
    gameLoop = setInterval(loop, 150);
    randomFood();
    draw();
}

function loop() {
    update();
}

// Inicio automático al cargar
window.onload = () => {
    draw();
    ctx.fillStyle = '#00ff41';
    ctx.font = '30px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Pulsa NUEVA PARTIDA', canvas.width/2, canvas.height/2);
};