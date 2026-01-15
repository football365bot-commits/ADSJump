const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// =====================
// CONFIG
// =====================
const GRAVITY = -0.6;
const BASE_JUMP_FORCE = 15;
const PLAYER_SIZE = 50;
const PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 20;
const MAX_JUMP_HEIGHT = 200; // максимальная высота, которую игрок может допрыгнуть

// =====================
// GAME STATE
// =====================
let lastTime = 0;
let score = 0;

// =====================
// PLAYER
// =====================
const player = {
    x: canvas.width / 2,
    y: canvas.height / 3,
    vy: 0,
    jumpForce: BASE_JUMP_FORCE
};

// =====================
// INPUT
// =====================
let inputX = 0;
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const x = e.touches[0].clientX;
    inputX = x < canvas.width / 2 ? -1 : 1;
});
canvas.addEventListener('touchend', e => { e.preventDefault(); inputX = 0; });

// =====================
// PLATFORMS
// =====================
const platforms = [];

// создаём начальные платформы (только 3–4)
function createInitialPlatforms() {
    let y = 0;
    const initialCount = 4; // стартовое количество платформ
    for (let i = 0; i < initialCount; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - PLATFORM_WIDTH),
            y: y,
            type: 'normal'
        });
        // между платформами расстояние = половина или чуть меньше MAX_JUMP_HEIGHT
        y += MAX_JUMP_HEIGHT * (0.7 + Math.random() * 0.3);
    }
}
createInitialPlatforms();

// функция генерации новой платформы над экраном
function generatePlatformAbove(lastY) {
    // расстояние между платформами — примерно половина MAX_JUMP_HEIGHT
    const gap = MAX_JUMP_HEIGHT * (0.7 + Math.random() * 0.3);
    const newY = lastY + gap;

    return {
        x: Math.random() * (canvas.width - PLATFORM_WIDTH),
        y: newY,
        type: 'normal'
    };
}

// =====================
// UPDATE
// =====================
function update(dt) {
    // горизонтальное движение
    player.x += inputX * 6;
    if (player.x < -PLAYER_SIZE) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_SIZE;

    // гравитация
    player.vy += GRAVITY;
    player.y += player.vy;

    // коллизия с платформами
    platforms.forEach(p => {
        if (player.vy < 0 &&
            player.y <= p.y + PLATFORM_HEIGHT &&
            player.y >= p.y &&
            player.x + PLAYER_SIZE > p.x &&
            player.x < p.x + PLATFORM_WIDTH) {
            player.vy = player.jumpForce;
        }
    });

    // камера
    if (player.y > canvas.height / 2) {
        const delta = player.y - canvas.height / 2;
        player.y = canvas.height / 2;
        platforms.forEach(p => p.y -= delta);
        score += Math.floor(delta);
    }

    // recycle платформ: удаляем слишком низкие и добавляем сверху
    let maxY = Math.max(...platforms.map(p => p.y));
    platforms.forEach((p, i) => {
        if (p.y < -PLATFORM_HEIGHT) {
            platforms[i] = generatePlatformAbove(maxY);
            maxY = platforms[i].y;
        }
    });

    // game over
    if (player.y < -200) location.reload();
}

// =====================
// DRAW
// =====================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x, canvas.height - player.y, PLAYER_SIZE, PLAYER_SIZE);

    // platforms
    ctx.fillStyle = '#00ff88';
    platforms.forEach(p => {
        ctx.fillRect(p.x, canvas.height - p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
    });

    // score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

// =====================
// GAME LOOP
// =====================
function gameLoop(t) {
    const dt = t - lastTime;
    lastTime = t;update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
