html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Touch Jump Game</title>
    <style>
        body { margin: 0; overflow: hidden; background: #87CEEB; font-family: Arial, sans-serif; }
        canvas { display: block; background: #fff; touch-action: none; }
        #score { position: absolute; top: 20px; left: 20px; font-size: 24px; color: #333; }
    </style>
</head>
<body>
    <div id="score">Счет: 0</div>
    <canvas id="gameCanvas"></canvas>

<script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let score = 0;
    let gameActive = true;

    // Игрок
    const player = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        width: 40,
        height: 40,
        dy: 0,
        jumpForce: -15,
        gravity: 0.6
    };

    // Платформы
    const platforms = [];
    const platformCount = 7;

    function createPlatform(y) {
        return {
            x: Math.random() * (canvas.width - 70),
            y: y,
            width: 70,
            height: 15
        };
    }

    for (let i = 0; i < platformCount; i++) {
        platforms.push(createPlatform(i * (canvas.height / platformCount)));
    }

    // Управление тачем
    window.addEventListener('touchstart', (e) => {
        if (!gameActive) {
            location.reload(); // Перезагрузка при проигрыше
            return;
        }
        const touchX = e.touches[0].clientX;
        // Если нажали в левой части экрана — прыжок влево, в правой — вправо
        if (touchX < canvas.width / 2) {
            player.x -= 30;
        } else {
            player.x += 30;
        }
    });

    function update() {
        if (!gameActive) return;

        player.dy += player.gravity;
        player.y += player.dy;

        // Бесконечный экран по бокам
        if (player.x > canvas.width) player.x = 0;
        if (player.x < 0) player.x = canvas.width;

        // Прыжок от платформ
        platforms.forEach(plat => {
            if (player.dy > 0 && 
                player.x < plat.x + plat.width &&
                player.x + player.width > plat.x &&
                player.y + player.height > plat.y &&
                player.y + player.height < plat.y + plat.height) {
                player.dy = player.jumpForce;
            }
        });

        // Движение камеры и генерация новых платформ
        if (player.y < canvas.height / 2) {
            let diff = canvas.height / 2 - player.y;
            player.y = canvas.height / 2;
            score += Math.floor(diff / 10);
            scoreElement.innerText = `Счет: ${score}`;

            platforms.forEach(plat => {
                plat.y += diff;
                if (plat.y > canvas.height) {
                    plat.y = 0;
                    plat.x = Math.random() * (canvas.width - 70);
                }
            });
        }

        // Проигрыш
        if (player.y > canvas.height) {
            gameActive = false;
            alert("Игра окончена! Счет: " + score);
            location.reload();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисуем игрока
        ctx.fillStyle = "#FF5722";
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // Рисуем платформы
        ctx.fillStyle = "#4CAF50";
        platforms.forEach(plat => {
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        });

        requestAnimationFrame(() => {
            update();
            draw();
        });
    }

    draw();
</script>
</body>
</html>
