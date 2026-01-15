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
const PLATFORM_WIDTH = 80;
const PLATFORM_HEIGHT = 18;
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
    vy: 0,
    jumpForce: BASE_JUMP_FORCE,
    hp: 100
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

// =====================
// ITEMS
// =====================
const itemTypes = ['trampoline', 'drone', 'rocket', 'spikes', 'bomb', 'medkit', 'adrenaline'];

function getItemForPlatform() {
    const rand = Math.random();
    if (rand < 0.003) return 'rocket';
    if (rand < 0.008) return 'drone';
    if (rand < 0.020) return 'trampoline';
    if (rand < 0.035) return 'bomb';
    if (rand < 0.055) return 'spikes';
    if (rand < 0.060) return 'medkit';
    if (rand < 0.040) return 'adrenaline';
    return null;
}

// =====================
// START PLATFORM
// =====================
function createStartPlatform() {
    const startPlatform = {
        x: canvas.width / 2 - PLATFORM_WIDTH / 2,
        y: 50,
        type: 'normal',
        vx: 0,
        used: false,
        item: null,
        temp: true,
        lifeTime: 2000,
        spawnTime: performance.now()
    };
    platforms.push(startPlatform);
}

createStartPlatform();

// =====================
// PLATFORM GENERATION
// =====================
function getPlatformTypeByScore() {
    const normalChance = Math.max(0.6 - score / 10000, 0.2);
    const brokenChance = Math.min(0.2 + score / 15000, 0.4);
    const movingSlowChance = Math.min(0.1 + score / 20000, 0.2);
    const movingFastChance = 1 - normalChance - brokenChance - movingSlowChance;

    const rand = Math.random();
    if (rand < normalChance) return 'normal';
    if (rand < normalChance + brokenChance) return 'broken';
    if (rand < normalChance + brokenChance + movingSlowChance) return 'moving_slow';
    return 'moving_fast';
}

function generateInitialPlatforms(count) {
    let currentY = 100;
    for (let i = 0; i < count; i++) {
        const gap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
        const type = getPlatformTypeByScore();
        let vx = 0;
        if (type === 'moving_slow') vx = Math.random() < 0.5 ? 1 : -1;
        if (type === 'moving_fast') vx = Math.random() < 0.5 ? 3 : -3;

        const itemType = getItemForPlatform();

        platforms.push({
            x: Math.random() * (canvas.width - PLATFORM_WIDTH),
            y: currentY,
            type: type,
            vx: vx,
            used: false,
            item: itemType
        });
        currentY += gap;
    }
}

generateInitialPlatforms(20);

// =====================
// UPDATE
// =====================
function update(dt) {
    const now = performance.now();

    player.x += inputX * 7;
    if (player.x < -PLAYER_SIZE) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_SIZE;

    player.vy += GRAVITY;
    player.y += player.vy;

    platforms.forEach((p, index) => {
        // удаляем временную платформу, если время вышло
        if (p.temp && now - p.spawnTime > p.lifeTime) {
            platforms.splice(index, 1);
            return;
        }

        // коллизия с платформой
        if (player.vy < 0 && player.y <= p.y + PLATFORM_HEIGHT &&player.y >= p.y &&
            player.x + PLAYER_SIZE > p.x &&
            player.x < p.x + PLATFORM_WIDTH) {

            if (p.type === 'broken' && p.used) return;

            player.vy = player.jumpForce;

            if (p.type === 'broken') p.used = true;

            // проверка предмета
            if (p.item) {
                switch (p.item) {
                    case 'trampoline': player.vy += 5; break;
                    case 'drone': player.vy += 35; break;
                    case 'rocket': player.vy += 75; break;
                    case 'spikes': player.hp -= 1; break;
                    case 'bomb': player.hp -= 5; break;
                    case 'medkit': player.hp = Math.min(player.hp + 1, 100); break;
                    case 'adrenaline': player.hp = Math.min(player.hp + 5, 100); break;
                }
                p.item = null;
            }
        }

        // === Динамическое движение платформ ===
        if (p.type === 'moving_slow') {
            let speed = 1 + score * 0.00005;
            if (speed > 3) speed = 3;
            p.vx = Math.sign(p.vx) * speed;
            p.x += p.vx;
        } else if (p.type === 'moving_fast') {
            let speed = 3 + score * 0.0001;
            if (speed > 8) speed = 8;
            p.vx = Math.sign(p.vx) * speed;
            p.x += p.vx;
        }

        // отражение от краёв
        if (p.x < 0) p.vx = Math.abs(p.vx);
        if (p.x + PLATFORM_WIDTH > canvas.width) p.vx = -Math.abs(p.vx);
    });

    // камера
    if (player.y > canvas.height / 2) {
        const delta = player.y - canvas.height / 2;
        player.y = canvas.height / 2;
        platforms.forEach(p => p.y -= delta);
        score += Math.floor(delta);
    }

    // recycle платформ
    let maxY = Math.max(...platforms.map(p => p.y));
    platforms.forEach((p, i) => {
        if (p.y < -PLATFORM_HEIGHT) {
            const gap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
            const type = getPlatformTypeByScore();
            let vx = 0;
            if (type === 'moving_slow') vx = Math.random() < 0.5 ? 1 : -1;
            if (type === 'moving_fast') vx = Math.random() < 0.5 ? 3 : -3;
            const itemType = getItemForPlatform();

            platforms[i] = {
                x: Math.random() * (canvas.width - PLATFORM_WIDTH),
                y: maxY + gap,
                type: type,
                vx: vx,
                used: false,
                item: itemType
            };
            maxY = platforms[i].y;
        }
    });

    if (player.y < -200 || player.hp <= 0) location.reload();
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
        switch (p.type) {
            case 'normal': ctx.fillStyle = '#00ff88'; break;
            case 'broken': ctx.fillStyle = '#ff4444'; break;
            case 'moving_slow': ctx.fillStyle = '#00ffff'; break;
            case 'moving_fast': ctx.fillStyle = '#ff00ff'; break;
        }
        ctx.fillRect(p.x, canvas.height - p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);

        // предметы по центру платформы
        if (p.item) {
            const itemX = p.x + PLATFORM_WIDTH / 2 - 10;
            const itemY = canvas.height - p.y - 20;
            switch(p.item) {
                case 'trampoline': ctx.fillStyle = '#ffff00'; break;
                case 'drone': ctx.fillStyle = '#ff8800'; break;
                case 'rocket': ctx.fillStyle = '#ff0000'; break;
                case 'spikes': ctx.fillStyle = '#888888'; break;
                case 'bomb': ctx.fillStyle = '#000000'; break;
                case 'medkit': ctx.fillStyle = '#00ff00'; break;
                case 'adrenaline': ctx.fillStyle = '#ff00ff'; break;}
            ctx.fillRect(itemX, itemY, 20, 20);
        }
    });

    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`HP: ${player.hp}`, canvas.width - 100, 30);
}

// =====================
// GAME LOOP
// =====================
function gameLoop(t) {
    const dt = t - lastTime;
    lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
