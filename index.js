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
const JUMP_FORCE = 15;
const PLAYER_SIZE = 50;
const PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 20;
const PLATFORM_GAP = 120;

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
    vy: 0
};

// =====================
// INPUT (TOUCH)
// =====================
let inputX = 0;

canvas.addEventListener('touchstart', e => {
    const x = e.touches[0].clientX;
    inputX = x < canvas.width / 2 ? -1 : 1;
});

canvas.addEventListener('touchend', () => {
    inputX = 0;
});

// =====================
// PLATFORMS
// =====================
const platforms = [];

function createPlatforms() {
    for (let i = 0; i < 10; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - PLATFORM_WIDTH),
            y: i * PLATFORM_GAP,
            type: Math.random() < 0.25 ? 'broken' : 'normal',
            used: false
        });
    }
}

createPlatforms();

// =====================
// UPDATE
// =====================
function update(dt) {
    // --- horizontal move
    player.x += inputX * 6;
    if (player.x < -PLAYER_SIZE) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_SIZE;

    // --- gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // --- collisions
    platforms.forEach(p => {
        if (
            player.vy < 0 &&
            player.y <= p.y + PLATFORM_HEIGHT &&
            player.y >= p.y &&
            player.x + PLAYER_SIZE > p.x &&
            player.x < p.x + PLATFORM_WIDTH
        ) {
            if (p.type === 'broken' && p.used) return;

            player.vy = JUMP_FORCE;
            if (p.type === 'broken') p.used = true;
        }
    });

    // --- camera (WORLD MOVES)
    if (player.y > canvas.height / 2) {
        const delta = player.y - canvas.height / 2;
        player.y = canvas.height / 2;
        platforms.forEach(p => p.y -= delta);
        score += Math.floor(delta);
    }

    // --- recycle platforms
    platforms.forEach((p, i) => {
        if (p.y < -PLATFORM_HEIGHT) {
            platforms[i] = {
                x: Math.random() * (canvas.width - PLATFORM_WIDTH),
                y: canvas.height + Math.random() * 100,
                type: Math.random() < Math.min(0.4, score / 5000) ? 'broken' : 'normal',
                used: false
            };
        }
    });

    // --- game over
    if (player.y < -100) {
        location.reload();
    }
}

// =====================
// DRAW
// =====================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x, canvas.height - player.y, PLAYER_SIZE, PLAYER_SIZE);

    // platforms
    platforms.forEach(p => {
        if (p.type === 'broken' && p.used) return;
        ctx.fillStyle = p.type === 'broken' ? '#ff4444' : '#00ff88';
        ctx.fillRect(
            p.x,
            canvas.height - p.y,
            PLATFORM_WIDTH,
            PLATFORM_HEIGHT
        );
    });

    // score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

// =====================
// LOOP
// =====================
function gameLoop(t) {
    const dt = t - lastTime;
    lastTime = t;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
