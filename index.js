<canvas id="game"></canvas>
<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// =====================
// RESIZE
// =====================
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    energyButton.x = (canvas.width - energyButton.width) / 2;
    energyButton.y = canvas.height - 70;
}
window.addEventListener('resize', resize);
resize();

// =====================
// CONFIG
// =====================
const GRAVITY = -0.6;
const BASE_JUMP_FORCE = 15;
const PLAYER_SIZE = 50;
const PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 20;
const MIN_GAP = 100;
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
let playerEnergyCount = 3;

// =====================
// ENERGY BUTTON
// =====================
const energyButton = {
    width: 150,
    height: 50,
    color: '#ffcc00',
    text: 'ENERGY',
    x: (canvas.width - 150)/2,
    y: canvas.height - 70
};
function useEnergy() {
    if(playerEnergyCount > 0){
        player.vy = 28;
        playerEnergyCount--;
    }
}

// =====================
// INPUT
// =====================
let inputX = 0;
canvas.addEventListener('touchstart', e=>{
    e.preventDefault();
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;

    // кнопка энергетика
    if(tx > energyButton.x && tx < energyButton.x + energyButton.width &&
       ty > energyButton.y && ty < energyButton.y + energyButton.height){
        useEnergy();
        return;
    }

    inputX = tx < canvas.width/2 ? -1 : 1;
});
canvas.addEventListener('touchend', e=>{
    e.preventDefault();
    inputX = 0;
});
document.addEventListener('keydown', e=>{
    if(e.code === 'Space') useEnergy();
});

// =====================
// PLATFORMS & ITEMS
// =====================
const platforms = [];
const items = [];
function spawnItem(platform){
    if(Math.random() > 0.3) return;
    const types = ['batut','drone','rocket','adrenaline'];
    const type = types[Math.floor(Math.random()*types.length)];
    items.push({
        type,
        x: platform.x + PLATFORM_WIDTH/2 - 10,
        y: platform.y + PLATFORM_HEIGHT,
        active: true
    });
}
function createPlatforms(){
    let currentY = 0;
    while(currentY < canvas.height*2){
        const gap = MIN_GAP + Math.random()*(MAX_GAP-MIN_GAP);
        const p = {
            x: Math.random()*(canvas.width-PLATFORM_WIDTH),
            y: currentY,
            type: Math.random()<0.25?'broken':'normal',
            used:false,
            vx:0
        };
        if(Math.random() < 0.15){
            p.type = 'moving';
            p.vx = Math.random()<0.5?1:-1;
        }
        platforms.push(p);
        spawnItem(p);
        currentY += gap;
    }
}
createPlatforms();

// =====================
// EFFECTS
// =====================
let boostTimer = 0;

// =====================
// BULLETS
// =====================
const bullets = [];

// =====================
// ENEMIES
// =====================
const enemies = [];
const enemyTypes = [
    {type:'small', size:30, hp:1},
    {type:'medium', size:50, hp:3},
    {type:'large', size:70, hp:5}
];
let autoShootTimer = 0;

// =====================
// HELPER
// =====================
function collision(a,b){
    return a.x < b.x + b.size &&
           a.x + 4 > b.x &&
           a.y < b.y + b.size &&
           a.y + 10 > b.y;
}

// =====================
// UPDATE
// =====================
function update(dt){
    // горизонт
    player.x += inputX*6;
    if(player.x < -PLAYER_SIZE) player.x = canvas.width;
    if(player.x > canvas.width) player.x = -PLAYER_SIZE;

    // таймер буста
    if(boostTimer>0){
        boostTimer -= dt;
        if(boostTimer <=0) player.jumpForce = BASE_JUMP_FORCE;
    }

    // гравитация
    player.vy += GRAVITY;
    player.y += player.vy;

    // движение платформ
    platforms.forEach(p=>{
        if(p.type==='moving'){
            p.x += p.vx;
            if(p.x<0 || p.x + PLATFORM_WIDTH>canvas.width) p.vx*=-1;
        }
    });

    // коллизия платформ
    platforms.forEach(p=>{
        if(player.vy <0 && player.y <= p.y+PLATFORM_HEIGHT && player.y >= p.y &&
           player.x+PLAYER_SIZE>p.x && player.x<p.x+PLATFORM_WIDTH){
            if(p.type==='broken' && p.used) return;
            player.vy = player.jumpForce;
            if(p.type==='broken') p.used = true;
        }
    });

    // коллизия с предметами
    items.forEach(i=>{
        if(!i.active) return;
        if(player.x < i.x+20 && player.x+PLAYER_SIZE>i.x &&
           player.y < i.y+20 && player.y+PLAYER_SIZE>i.y){
            i.active = false;
            switch(i.type){
                case 'batut': player.vy=18; break;
                case 'drone': player.vy=22; break;
                case 'rocket': player.vy=30; break;
                case 'adrenaline': 
                    player.jumpForce=18;
                    boostTimer=3000; 
                    break;
            }
        }
    });

    // спавн врагов постепенно
    const baseSpawnChance = 0.005;
    const maxSpawnChance = 0.02;
    const enemySpawnChance = Math.min(baseSpawnChance + score/100000, maxSpawnChance);
    if(Math.random() < enemySpawnChance){
        const eType = enemyTypes[Math.floor(Math.random()*enemyTypes.length)];
        const safeY = player.y + canvas.height + 100;
        if(!enemies.some(e=>Math.abs(e.y - safeY)<100)){
            enemies.push({
                type:eType.type,
                x:Math.random()*(canvas.width-eType.size),
                y:safeY,
                size:eType.size,
                hp:eType.hp,
                alive:true
            });
        }
    }

    // автострельба
    autoShootTimer += dt;
    const visibleEnemies = enemies.filter(e=>e.alive && e.y < player.y+canvas.height && e.y>player.y-50);
    if(visibleEnemies.length>0 && autoShootTimer > 400){
        autoShootTimer = 0;
        let nearest = visibleEnemies.reduce((prev,curr)=> Math.abs(curr.y-player.y)<Math.abs(prev.y-player.y)?curr:prev);
        const bulletX = player.x+PLAYER_SIZE/2-2;
        const bulletY = player.y;
        const targetX = nearest.x+nearest.size/2;
        bullets.push({
            x:bulletX,
            y:bulletY,
            vx:(targetX-bulletX)/30,
            vy:10
        });
    }

    // движение пуль
    bullets.forEach(b=>{
        b.x += b.vx;
        b.y += b.vy;
    });

    // коллизия пуль с врагами
    bullets.forEach(b=>{
        visibleEnemies.forEach(e=>{
            if(!e.alive) return;
            if(collision(b,e)){
                e.hp--;
                b.y = canvas.height+100;
                if(e.hp<=0) e.alive=false;
                score +=50;
            }
        });
    });

    // камера
    if(player.y>canvas.height/2){
        const delta = player.y - canvas.height/2;
        player.y = canvas.height/2;
        platforms.forEach(p=>p.y-=delta);
        items.forEach(i=>i.y-=delta);
        bullets.forEach(b=>b.y-=delta);
        enemies.forEach(e=>e.y-=delta);
        score += Math.floor(delta);
    }

    // recycle платформ
    platforms.forEach((p,i)=>{
        if(p.y < -PLATFORM_HEIGHT){
            const gap = MIN_GAP + Math.random()*(MAX_GAP-MIN_GAP);
            const np = {
                x:Math.random()*(canvas.width-PLATFORM_WIDTH),
                y:canvas.height+gap,
                type:Math.random()<Math.min(0.25 + score/5000,0.5)?'broken':'normal',
                used:false,
                vx:0
            };
            if(Math.random()<Math.min(0.15+score/10000,0.3)){
                np.type='moving';
                np.vx = Math.random()<0.5?1:-1;
            }
            platforms[i]=np;
            spawnItem(np);
        }
    });

    // удаляем старые пули
    while(bullets.length && bullets[0].y > canvas.height + 200) bullets.shift();

    // game over
    if(player.y < -200) location.reload();
}

// =====================
// DRAW
// =====================
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // игрок
    ctx.fillStyle = 'yellow';
    ctx.fillRect(player.x, canvas.height - player.y - PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);

    // платформы
    platforms.forEach(p=>{
        if(p.type==='broken' && p.used) return;
        ctx.fillStyle = p.type==='broken'?'#ff4444':p.type==='moving'?'#00ffff':'#00ff88';
        ctx.fillRect(p.x, canvas.height - p.y - PLATFORM_HEIGHT, PLATFORM_WIDTH, PLATFORM_HEIGHT);
    });

    // предметы
    items.forEach(i=>{
        if(!i.active) return;
        const colors = {batut:'purple',drone:'cyan',rocket:'orange',adrenaline:'pink'};
        ctx.fillStyle = colors[i.type];
        ctx.fillRect(i.x, canvas.height - i.y - 20, 20, 20);
    });

    // пули
    ctx.fillStyle = 'white';
    bullets.forEach(b=>ctx.fillRect(b.x, canvas.height - b.y - 10, 4, 10));

    // враги
    enemies.forEach(e=>{
        if(!e.alive) return;
        const colors = {small:'#f00', medium:'#ff8800', large:'#ff00ff'};
        ctx.fillStyle = colors[e.type];
        ctx.fillRect(e.x, canvas.height - e.y - e.size, e.size, e.size);
    });

    // кнопка энергетика
    ctx.fillStyle = energyButton.color;
    ctx.fillRect(energyButton.x, energyButton.y, energyButton.width, energyButton.height);
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(energyButton.text, energyButton.x + energyButton.width/2, energyButton.y + energyButton.height/2);

    // счет и энергетики
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Energy: ${playerEnergyCount}`, 20, 60);
}

// =====================
// GAME LOOP
// =====================
function gameLoop(t){
    const dt = t - lastTime;
    lastTime = t;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
</script>