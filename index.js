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

// =====================
// ITEMS
// =====================
const itemTypes = ['trampoline', 'drone', 'rocket'];

function getItemForPlatform() {
    const rand = Math.random();
    if (rand < 0.05) return 'rocket';        // редкий
    if (rand < 0.15) return 'drone';         // чуть чаще
    if (rand < 0.35) return 'trampoline';    // чаще
    return null;                              // на многих платформах нет предмета
}

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
    let currentY = 0;
    for (let i = 0; i < count; i++) {
        const gap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
        const type = getPlatformTypeByScore();
        let vx = 0;
        if (type === 'moving_slow') vx = Math.random() < 0.5 ? 1 : -1;
        if (type === 'moving_fast') vx = Math.random() < 0.5 ? 3 : -3;

        // предмет на платформе
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
    player.x += inputX * 6;
    if (player.x < -PLAYER_SIZE) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_SIZE;

    player.vy += GRAVITY;
    player.y += player.vy;

    platforms.forEach(p => {
        // коллизия с платформой
        if (player.vy < 0 &&
            player.y <= p.y + PLATFORM_HEIGHT &&
            player.y >= p.y &&
            player.x + PLAYER_SIZE > p.x &&
            player.x < p.x + PLATFORM_WIDTH) {

            if (p.type === 'broken' && p.used) return;

            player.vy = player.jumpForce;

            if (p.type === 'broken') p.used = true;

            // проверка предмета
            if (p.item) {
                switch (p.item) {
                    case 'trampoline': player.vy += 5; break; // маленький буст
                    case 'drone': player.vy += 8; break;      // сильнее
                    case 'rocket': player.vy += 12; break;    // сильный буст
                }
                p.item = null; // забрали предмет
            }
        }

        // движение платформif (p.type === 'moving_slow' || p.type === 'moving_fast') {
            p.x += p.vx;
            if (p.x < 0 || p.x + PLATFORM_WIDTH > canvas.width) p.vx *= -1;
        }
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
        switch (p.type) {
            case 'normal': ctx.fillStyle = '#00ff88'; break;
            case 'broken': ctx.fillStyle = '#ff4444'; break;
            case 'moving_slow': ctx.fillStyle = '#00ffff'; break;
            case 'moving_fast': ctx.fillStyle = '#ff00ff'; break;
        }
        ctx.fillRect(p.x, canvas.height - p.y, PLATFORM_WIDTH, PLATFORM_HEIGHT);

        // рисуем предмет по центру платформы
        if (p.item) {
            const itemX = p.x + PLATFORM_WIDTH / 2 - 10;
            const itemY = canvas.height - p.y - 20;
            switch(p.item) {
                case 'trampoline': ctx.fillStyle = '#ffff00'; break;
                case 'drone': ctx.fillStyle = '#ff8800'; break;
                case 'rocket': ctx.fillStyle = '#ff0000'; break;
            }
            ctx.fillRect(itemX, itemY, 20, 20);
        }
    });

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
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
