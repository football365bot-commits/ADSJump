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
    vy: 0,
    jumpForce: BASE_JUMP_FORCE
};

// =====================
// INPUT (TOUCH)
// =====================
let inputX = 0;

canvas.addEventListener('touchstart', e => {
    const x = e.touches[0].clientX;
    inputX = x < canvas.width / 2 ? -1 : 1;
});
canvas.addEventListener('touchend', () => inputX = 0);

// =====================
// PLATFORMS + ITEMS
// =====================
const platforms = [];
const items = [];

function spawnItem(platform) {
    if (Math.random() > 0.3) return;

    const types = ['batut', 'drone', 'rocket', 'energy', 'adrenaline'];
    const type = types[Math.floor(Math.random() * types.length)];

    items.push({
        type,
        x: platform.x + PLATFORM_WIDTH / 2 - 10,
        y: platform.y + PLATFORM_HEIGHT,
        active: true
    });
}

function createPlatforms() {
    for (let i = 0; i < 10; i++) {
        const p = {
            x: Math.random() * (canvas.width - PLATFORM_WIDTH),
            y: i * PLATFORM_GAP,
            type: Math.random() < 0.25 ? 'broken' : 'normal',
            used: false
        };
        platforms.push(p);
        spawnItem(p);
    }
}
createPlatforms();

// =====================
// EFFECTS
// =====================
let activeBoost = 0;
let boostTimer = 0;

// =====================
// AUTO SHOOT
// =====================
const bullets = [];
setInterval(() => {
    bullets.push({
        x: player.x + PLAYER_SIZE / 2 - 2,
        y: player.y,
        vy: 10
    });
}, 400);

// =====================
// UPDATE
// =====================
function update(dt) {

    // horizontal
    player.x += inputX * 6;
    if (player.x < -PLAYER_SIZE) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_SIZE;

    // effects timer
    if (boostTimer > 0) {
        boostTimer -= dt;
        if (boostTimer <= 0) {
            player.jumpForce = BASE_JUMP_FORCE;
        }
    }

    // gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // platform collision
    platforms.forEach(p => {
        if (
            player.vy < 0 &&
            player.y <= p.y + PLATFORM_HEIGHT &&
            player.y >= p.y &&
            player.x + PLAYER_SIZE > p.x &&
            player.x < p.x + PLATFORM_WIDTH
        ) {
            if (p.type === 'broken' && p.used) return;

            player.vy = player.jumpForce;
            if (p.type === 'broken') p.used = true;
        }
    });

    // item collision
    items.forEach(item => {
        if (!item.active) return;

        if (
            player.x < item.x + 20 &&
            player.x + PLAYER_SIZE > item.x &&
            player.y < item.y + 20 &&
            player.y + PLAYER_SIZE > item.y
        ) {
            item.active = false;

            if (item.type === 'batut') {
                player.vy = 18;
            }
            if (item.type === 'drone') {
                player.vy = 22;
            }
            if (item.type === 'rocket') {
                player.vy = 30;
            }
            if (item.type === 'energy') {
                player.vy = 18;
            }
            if (item.type === 'adrenaline') {
                player.jumpForce = 18;
                boostTimer = 3000;
            }
        }
    });

    // bullets
    bullets.forEach(b => b.y += b.vy);
    bullets.filter(b => b.y < canvas.height + 100);

    // camera
    if (player.y > canvas.height / 2) {
        const delta = player.y - canvas.height / 2;
        player.y = canvas.height / 2;
        platforms.forEach(p => p.y -= delta);
        items.forEach(i => i.y -= delta);
        bullets.forEach(b => b.y -= delta);
        score += Math.floor(delta);
    }

    // recycle platforms
    platforms.forEach((p, i) => {
        if (p.y < -PLATFORM_HEIGHT) {
            const np = {
                x: Math.random() * (canvas.width - PLATFORM_WIDTH),
                y: canvas.height + Math.random() * 100,
                type: Math.random() < Math.min(0.4, score / 5000) ? 'broken' : 'normal',
                used: false
            };
            platforms[i] = np;
            spawnItem(np);
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
    platforms.forEach(p => {
        if (p.type === 'broken' && p.used) return;
        ctx.fillStyle = p.type === 'broken' ? '#ff4444' : '#00ff88';
        ctx.fillRect(p.x, canvas.height - p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
    });

    // items
    items.forEach(i => {
        if (!i.active) return;
        const colors = {
            batut: 'purple',
            drone: 'cyan',
            rocket: 'orange',
            energy: 'lime',
            adrenaline: 'pink'
        };
        ctx.fillStyle = colors[i.type];
        ctx.fillRect(i.x, canvas.height - i.y, 20, 20);
    });

    // bullets
    ctx.fillStyle = 'white';
    bullets.forEach(b => {
        ctx.fillRect(b.x, canvas.height - b.y, 4, 10);
    });

    // score
    ctx.fillStyle = '#fff';
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
