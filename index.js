document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const doodler = document.createElement('div');
    let doodlerLeftSpace = 50;
    let startPoint = 0;
    let doodlerBottomSpace = 0;
    let isGameOver = false;

    let platformCount = 5;
    let platforms = [];
    let upTimerId;
    let downTimerId;
    let leftTimerId;
    let rightTimerId;
    let isJumping = true;
    let isGoingLeft = false;
    let isGoingRight = false;
    let score = 0;

    // ===========================
    // Настройка размера grid по экрану Telegram
    function resizeGrid() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        grid.style.width = width + 'px';
        grid.style.height = height + 'px';

        // Базовые размеры Doodler и платформ в % от экрана
        doodler.style.width = (width * 0.15) + 'px';
        doodler.style.height = 'auto';
    }
    resizeGrid();
    window.addEventListener('resize', resizeGrid);
    // ===========================

    // Создание Doodler
    function createDoodle() {
        grid.appendChild(doodler);
        doodler.classList.add('doodler');

        startPoint = grid.offsetHeight * 0.25; // стартовая высота Doodler
        doodlerBottomSpace = startPoint;
        doodlerLeftSpace = grid.offsetWidth * 0.25;

        doodler.style.left = doodlerLeftSpace + 'px';
        doodler.style.bottom = doodlerBottomSpace + 'px';
    }

    // Класс платформы
    class Platform {
        constructor(newPlatBottom) {
            this.bottom = newPlatBottom;
            this.left = Math.random() * (grid.offsetWidth - grid.offsetWidth * 0.2);
            this.width = grid.offsetWidth * 0.2;
            this.height = grid.offsetHeight * 0.03;
            this.visual = document.createElement('div');

            const visual = this.visual;
            visual.classList.add('platform');
            visual.style.left = this.left + 'px';
            visual.style.bottom = this.bottom + 'px';
            visual.style.width = this.width + 'px';
            visual.style.height = this.height + 'px';
            grid.appendChild(visual);
        }
    }

    // Создание платформ
    function createPlatforms() {
        const gap = grid.offsetHeight / platformCount;
        for (let i = 0; i < platformCount; i++) {
            const newPlatBottom = gap * i;
            const newPlatform = new Platform(newPlatBottom);
            platforms.push(newPlatform);
        }
    }

    // Движение платформ
    function movePlatforms() {
        if (doodlerBottomSpace > grid.offsetHeight * 0.3) {
            platforms.forEach(platform => {
                platform.bottom -= 4;
                platform.visual.style.bottom = platform.bottom + 'px';

                if (platform.bottom < 0) {
                    platform.visual.remove();
                    platforms.shift();
                    score++;
                    const newPlatform = new Platform(grid.offsetHeight);
                    platforms.push(newPlatform);
                }
            });
        }
    }

    // Прыжок
    function jump() {
        clearInterval(downTimerId);
        isJumping = true;
        upTimerId = setInterval(() => {
            doodlerBottomSpace += 20;
            doodler.style.bottom = doodlerBottomSpace + 'px';
            if (doodlerBottomSpace > startPoint + grid.offsetHeight * 0.33) {
                fall();
                isJumping = false;
            }
        }, 30);
    }

    // Падение
    function fall() {
        isJumping = false;
        clearInterval(upTimerId);
        downTimerId = setInterval(() => {
            doodlerBottomSpace -= 5;
            doodler.style.bottom = doodlerBottomSpace + 'px';

            if (doodlerBottomSpace <= 0) {
                gameOver();
            }

            platforms.forEach(platform => {
                if (
                    doodlerBottomSpace >= platform.bottom &&
                    doodlerBottomSpace <= platform.bottom + platform.height &&doodlerLeftSpace + doodler.offsetWidth >= platform.left &&
                    doodlerLeftSpace <= platform.left + platform.width &&
                    !isJumping
                ) {
                    startPoint = doodlerBottomSpace;
                    jump();
                    isJumping = true;
                }
            });
        }, 20);
    }

    // Движение Doodler
    function moveLeft() {
        if (isGoingRight) {
            clearInterval(rightTimerId);
            isGoingRight = false;
        }
        isGoingLeft = true;
        leftTimerId = setInterval(() => {
            if (doodlerLeftSpace >= 0) {
                doodlerLeftSpace -= 5;
                doodler.style.left = doodlerLeftSpace + 'px';
            } else moveRight();
        }, 20);
    }

    function moveRight() {
        if (isGoingLeft) {
            clearInterval(leftTimerId);
            isGoingLeft = false;
        }
        isGoingRight = true;
        rightTimerId = setInterval(() => {
            if (doodlerLeftSpace <= grid.offsetWidth - doodler.offsetWidth) {
                doodlerLeftSpace += 5;
                doodler.style.left = doodlerLeftSpace + 'px';
            } else moveLeft();
        }, 20);
    }

    function moveStraight() {
        isGoingLeft = false;
        isGoingRight = false;
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
    }

    function control(e) {
        if (e.key === 'ArrowLeft') moveLeft();
        else if (e.key === 'ArrowRight') moveRight();
        else if (e.key === 'ArrowUp') moveStraight();
    }

    // ===== Старт игры =====
    function start() {
        if (!isGameOver) {
            createPlatforms();
            createDoodle();
            setInterval(movePlatforms, 30);
            jump();
            document.addEventListener('keyup', control);

            // ===== Сенсорное управление =====
            grid.addEventListener('touchstart', e => {
                e.preventDefault();
                const x = e.touches[0].clientX;
                if (x < window.innerWidth / 2) moveLeft();
                else moveRight();
            }, { passive: false });

            grid.addEventListener('touchend', e => {
                e.preventDefault();
                moveStraight();
            }, { passive: false });
        }
    }

    // ===== Конец игры =====
    function gameOver() {
        isGameOver = true;
        while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
        }
        grid.innerHTML = score;
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
    }

    // Запуск
    start();
});
