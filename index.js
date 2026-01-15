const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// =====================
// RESIZE
// =====================
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

const BASE_PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 20;

const MIN_GAP = 120;
const MAX_GAP = 160;

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
// INPUT
// =====================
let inputX = 0;
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    inputX = e.touches[0].clientX < canvas.width / 2 ? -1 : 1;
});
canvas.addEventListener('touchend', () => inputX = 0);

// =====================
// PLATFORMS
// =====================
const platforms = [];

// ---------- TYPES BY SCORE ----------
function getPlatformType() {
    const normal = Math.max(0.6 - score / 12000, 0.15);
    const broken = Math.min(0.2 + score / 15000, 0.4);
    const slow = Math.min(0.1 + score / 20000, 0.25);
    const fast = 1 - normal - broken - slow;

    const r = Math.random();
    if (r < normal) return 'normal';
    if (r < normal + broken) return 'broken';
    if (r < normal + broken + slow) return 'moving_slow';
    return 'moving_fast';
}

// ---------- CREATE PLATFORM ----------
function createPlatform(y) {
    const type = getPlatformType();

    let vx = 0;
    if (type === 'moving_slow') vx = Math.random() < 0.5 ? 1.2 : -1.2;
    if (type === 'moving_fast') vx = Math.random() < 0.5 ? 4 : -4;

    return {
        x: Math.random() * (canvas.width - BASE_PLATFORM_WIDTH),
        y,
        type,
        vx,
        used: false,

        // 🔑 ВАЖНО
        activated: false,
        spawnTime: null
    };
}

// ---------- INITIAL ----------
function initPlatforms() {
    platforms.length = 0;
    let y = 0;
    while (y < canvas.height * 2) {
        platforms.push(createPlatform(y));
        y += MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
    }
}
initPlatforms();

// =====================
// UPDATE
// =====================
function update(dt) {
    const now = performance.now();

    // player movement
    player.x += inputX * 6;
    if (player.x < -PLAYER_SIZE) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_SIZE;

    player.vy += GRAVITY;
    player.y += player.vy;

    // difficulty scaling
    const platformWidth = Math.max(
        BASE_PLATFORM_WIDTH - score / 300,
        60
    );

    // platforms
    platforms.forEach(p => {

        // -------- ACTIVATE PLATFORM --------
        if (!p.activated && p.y < player.y + canvas.height) {
            p.activated = true;
            p.spawnTime = now;
        }

        // -------- BROKEN TIMER --------
        if (p.type === 'broken' && p.activated && !p.used) {
            const lifeTime = Math.max(
                9000 - score / 60, // ⬅️ МЕДЛЕННО ускоряется
                4000              // ⬅️ минимум
            );

            if (now - p.spawnTime > lifeTime) {
                p.used = true;
            }
        }

        // -------- COLLISION --------
        if (
            player.vy < 0 &&
            !p.used &&
            player.y <= p.y + PLATFORM_HEIGHT &&
            player.y >= p.y &&
            player.x + PLAYER_SIZE > p.x &&
            player.x < p.x + platformWidth
        ) {
            player.vy = BASE_JUMP_FORCE;
            if (p.type === 'broken') p.used = true;
        }

        // -------- MOVEMENT --------
        if (p.type.includes('moving')) {
            p.x += p.vx;
            if (p.x < 0 || p.x + platformWidth > canvas.width) {
                p.vx *= -1;
            }
        }
    });

    // camera
    if (player.y > canvas.height / 2) {const delta = player.y - canvas.height / 2;
        player.y = canvas.height / 2;
        platforms.forEach(p => p.y -= delta);
        score += Math.floor(delta);
    }

    // recycle
    let maxY = Math.max(...platforms.map(p => p.y));
    platforms.forEach((p, i) => {
        if (p.y < -PLATFORM_HEIGHT) {
            maxY += MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
            platforms[i] = createPlatform(maxY);
        }
    });

    if (player.y < -300) location.reload();
}

// =====================
// DRAW
// =====================
function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const platformWidth = Math.max(
        BASE_PLATFORM_WIDTH - score / 300,
        60
    );

    // player
    ctx.fillStyle = 'yellow';
    ctx.fillRect(
        player.x,
        canvas.height - player.y,
        PLAYER_SIZE,
        PLAYER_SIZE
    );

    // platforms
    platforms.forEach(p => {
        if (p.used) return;

        if (p.type === 'normal') ctx.fillStyle = '#00ff88';
        if (p.type === 'broken') ctx.fillStyle = '#ff4444';
        if (p.type === 'moving_slow') ctx.fillStyle = '#00ffff';
        if (p.type === 'moving_fast') ctx.fillStyle = '#ff00ff';

        ctx.fillRect(
            p.x,
            canvas.height - p.y,
            platformWidth,
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
