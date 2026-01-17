
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ==================
// CONFIG
// ==================
const GRAVITY = -0.6;
const PLAYER_SIZE = 40;
const PLATFORM_WIDTH = 70;
const PLATFORM_HEIGHT = 15;
const MIN_GAP = 100;
const MAX_GAP = 150;
const CAMERA_SPEED = 1.25;
const PLAYER_SPEED = 7;

// ==================
// GAME STATE
// ==================
let score = 0;
let lastTime = 0;

// ==================
// PLAYER
// ==================
const player = {
    x: canvas.width / 2,
    y: canvas.height / 3,
    vy: 0,
    hp: 100
};

// ==================
// PLATFORMS
// ==================
const platforms = [];

// ==================
// ENEMIES
// ==================
const enemies = [];

// ==================
// INPUT
// ==================
let inputX = 0;
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') inputX = -1;
    if (e.key === 'ArrowRight') inputX = 1;
});
window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') inputX = 0;
});

// ==================
// START PLATFORM
// ==================
platforms.push({
    x: canvas.width / 2 - PLATFORM_WIDTH / 2,
    y: 50,
    type: 'normal'
});

// ==================
// INITIAL PLATFORM GENERATION
// ==================
function generatePlatforms(count) {
    let currentY = 100;
    for (let i = 0; i < count; i++) {
        const gap = MIN_GAP + Math.random()*(MAX_GAP-MIN_GAP);
        platforms.push({
            x: Math.random()*(canvas.width-PLATFORM_WIDTH),
            y: currentY,
            type: 'normal'
        });
        currentY += gap;
    }
}
generatePlatforms(20);

// ==================
// SPAWN ENEMIES
// ==================
function spawnEnemies() {
    platforms.forEach(p => {
        if (Math.random() < 0.02 && p.y > player.y) {
            enemies.push({
                x: p.x + Math.random()*(PLATFORM_WIDTH-30),
                y: p.y + PLATFORM_HEIGHT,
                vx: Math.random()<0.5 ? 2 : -2,
                size: 30
            });
        }
    });
}

// ==================
// UPDATE
// ==================
function update(dt) {
    player.x += inputX*PLAYER_SPEED;
    if (player.x < -PLAYER_SIZE) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_SIZE;

    player.vy += GRAVITY;
    player.y += player.vy;

    // PLATFORM COLLISION
    platforms.forEach(p => {
        if (player.vy < 0 &&
            player.y <= p.y + PLATFORM_HEIGHT &&
            player.y >= p.y &&
            player.x + PLAYER_SIZE > p.x &&
            player.x < p.x + PLATFORM_WIDTH) {
            player.vy = 15; // jump
        }
    });

    // CAMERA SCROLL
    if (player.y > canvas.height/2) {
        const delta = (player.y - canvas.height/2)*CAMERA_SPEED;
        player.y = canvas.height/2;
        platforms.forEach(p => p.y -= delta);
        enemies.forEach(e => e.y -= delta);
        score += Math.floor(delta);
    }

    // ENEMY UPDATE
    enemies.forEach((e, i) => {
        e.x += e.vx;
        if (e.x < 0 || e.x + e.size > canvas.width) e.vx *= -1;

        // COLLISION WITH PLAYER
        if (player.x + PLAYER_SIZE > e.x &&
            player.x < e.x + e.size &&
            player.y < e.y + e.size &&
            player.y + PLAYER_SIZE > e.y) {
            player.hp -= 1;
        }

        // REMOVE OFFSCREEN
        if (e.y < player.y - canvas.height) enemies.splice(i,1);
    });

    // RECYCLE PLATFORMS
    let maxY = Math.max(...platforms.map(p=>p.y));
    platforms.forEach((p,i)=>{
        if (p.y < -PLATFORM_HEIGHT) {
            const gap = MIN_GAP + Math.random()*(MAX_GAP-MIN_GAP);
            platforms[i] = {
                x: Math.random()*(canvas.width-PLATFORM_WIDTH),
                y: maxY + gap,
                type: 'normal'
            };
            maxY = platforms[i].y;
        }
    });

    // SPAWN ENEMIES
    spawnEnemies();

    // GAME OVER
    if (player.hp <= 0 || player.y < -200) {
        alert('Game Over! Score: '+score);
        location.reload();
    }
}

// ==================
// DRAW
// ==================
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#111';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // PLATFORMS
    ctx.fillStyle='#0f0';
    platforms.forEach(p=>{
        ctx.fillRect(p.x, canvas.height - p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);
    });

    // PLAYER
    ctx.fillStyle='#00f';
    ctx.fillRect(player.x, canvas.height - player.y, PLAYER_SIZE, PLAYER_SIZE);

    // ENEMIES
    ctx.fillStyle='#f00';
    enemies.forEach(e=>{
        ctx.fillRect(e.x, canvas.height - e.y, e.size, e.size);
    });

    // HUD
    ctx.fillStyle='#fff';
    ctx.font='20px Arial';
    ctx.fillText('Score: '+score,20,30);
    ctx.fillText('HP: '+player.hp, canvas.width-100,30);
}

// ==================
// GAME LOOP
// ==================
function gameLoop(t) {
    const dt = t - lastTime;
    lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
</script>