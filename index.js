document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const doodler = document.createElement('div');

    // ===== Логический экран =====
    const LOGICAL_WIDTH = 400;
    const LOGICAL_HEIGHT = 600;

    let scale = 1;

    let doodlerLeft = LOGICAL_WIDTH * 0.25;
    let doodlerBottom = LOGICAL_HEIGHT * 0.25;
    let startPoint = doodlerBottom;

    let isGameOver = false;
    let isJumping = true;
    let isGoingLeft = false;
    let isGoingRight = false;

    let platforms = [];
    const platformCount = 5;

    let upTimerId, downTimerId, leftTimerId, rightTimerId;
    let score = 0;

    // ===== Масштабирование под экран устройства =====
    function resizeGrid() {
        scale = Math.min(
            window.innerWidth / LOGICAL_WIDTH,
            window.innerHeight / LOGICAL_HEIGHT
        );

        grid.style.width = LOGICAL_WIDTH + 'px';
        grid.style.height = LOGICAL_HEIGHT + 'px';
        grid.style.transform = scale(${scale});
        grid.style.transformOrigin = 'bottom left';
    }
    resizeGrid();
    window.addEventListener('resize', resizeGrid);

    // ===== Создание Doodler =====
    function createDoodle() {
        doodler.classList.add('doodler');
        doodler.style.width = LOGICAL_WIDTH * 0.15 + 'px';
        doodler.style.height = 'auto';
        grid.appendChild(doodler);

        doodler.style.left = doodlerLeft + 'px';
        doodler.style.bottom = doodlerBottom + 'px';
    }

    // ===== Платформы =====
    class Platform {
        constructor(bottom) {
            this.bottom = bottom;
            this.width = LOGICAL_WIDTH * 0.2;
            this.height = LOGICAL_HEIGHT * 0.03;
            this.left = Math.random() * (LOGICAL_WIDTH - this.width);

            this.visual = document.createElement('div');
            this.visual.classList.add('platform');
            this.visual.style.width = this.width + 'px';
            this.visual.style.height = this.height + 'px';
            this.visual.style.left = this.left + 'px';
            this.visual.style.bottom = this.bottom + 'px';
            grid.appendChild(this.visual);
        }
    }

    function createPlatforms() {
        const gap = LOGICAL_HEIGHT / platformCount;
        for (let i = 0; i < platformCount; i++) {
            const newPlatBottom = gap * i;
            const platform = new Platform(newPlatBottom);
            platforms.push(platform);
        }
    }

    function movePlatforms() {
        if (doodlerBottom > LOGICAL_HEIGHT * 0.3) {
            platforms.forEach(platform => {
                platform.bottom -= LOGICAL_HEIGHT * 0.007; // скорость падения
                platform.visual.style.bottom = platform.bottom + 'px';

                if (platform.bottom < 0) {
                    platform.visual.remove();
                    platforms.shift();
                    score++;
                    const newPlatform = new Platform(LOGICAL_HEIGHT);
                    platforms.push(newPlatform);
                }
            });
        }
    }

    // ===== Прыжок =====
    function jump() {
        clearInterval(downTimerId);
        isJumping = true;
        upTimerId = setInterval(() => {
            doodlerBottom += LOGICAL_HEIGHT * 0.033;
            doodler.style.bottom = doodlerBottom + 'px';
            if (doodlerBottom > startPoint + LOGICAL_HEIGHT * 0.33) {
                fall();
                isJumping = false;
            }
        }, 30);
    }

    // ===== Падение =====
    function fall() {
        isJumping = false;
        clearInterval(upTimerId);
        downTimerId = setInterval(() => {
            doodlerBottom -= LOGICAL_HEIGHT * 0.008;
            doodler.style.bottom = doodlerBottom + 'px';

            if (doodlerBottom <= 0) {
                gameOver();
            }

            platforms.forEach(platform => {
                if (
                    doodlerBottom >= platform.bottom &&
                    doodlerBottom <= platform.bottom + platform.height &&
                    doodlerLeft + doodler.offsetWidth >= platform.left &&
                    doodlerLeft <= platform.left + platform.width &&
                    !isJumping
                ) {
                    startPoint = doodlerBottom;
                    jump();
                    isJumping = true;
                }
            });
        }, 20);
    }

    // ===== Движение Doodler =====
    function moveLeft() {
        if (isGoingRight) {
            clearInterval(rightTimerId);
            isGoingRight = false;
        }
        isGoingLeft = true;
        leftTimerId = setInterval(() => {
            if (doodlerLeft >= 0) {
                doodlerLeft -= LOGICAL_WIDTH * 0.0125;
                doodler.style.left = doodlerLeft + 'px';
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
            if (doodlerLeft <= LOGICAL_WIDTH - doodler.offsetWidth) {
                doodlerLeft += LOGICAL_WIDTH * 0.0125;
                doodler.style.left = doodlerLeft + 'px';
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
        while (grid.firstChild) grid.removeChild(grid.firstChild);
        grid.innerHTML = score;
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
    }

    // ===== Запуск =====
    start();
});
