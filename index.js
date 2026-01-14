document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');

    // ===========================
    // Переменные игры
    // ===========================
    const platforms = [];
    const platformCount = 5;
    const doodler = document.createElement('div');

    let doodlerLeft = 0;
    let doodlerBottom = 0;
    let upTimerId;
    let downTimerId;
    let leftTimerId;
    let rightTimerId;
    let isJumping = true;
    let isGoingLeft = false;
    let isGoingRight = false;
    let score = 0;

    // ===========================
    // Подгоняем grid под экран + масштабируем объекты
    // ===========================
    function resizeGrid() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        grid.style.width = width + 'px';
        grid.style.height = height + 'px';

        // Масштабируем Doodler
        doodler.style.width = width * 0.15 + 'px';
        doodler.style.height = 'auto';
        doodler.style.left = doodlerLeft + 'px';
        doodler.style.bottom = doodlerBottom + 'px';

        // Масштабируем все платформы
        platforms.forEach(platform => {
            platform.width = width * 0.2;
            platform.height = height * 0.03;

            platform.visual.style.width = platform.width + 'px';
            platform.visual.style.height = platform.height + 'px';
            platform.visual.style.left = platform.left + 'px';
            platform.visual.style.bottom = platform.bottom + 'px';
        });
    }

    resizeGrid();
    window.addEventListener('resize', resizeGrid);

    // ===========================
    // Класс платформы
    // ===========================
    class Platform {
        constructor(newPlatBottom) {
            this.width = window.innerWidth * 0.2;    // 20% ширины экрана
            this.height = window.innerHeight * 0.03; // 3% высоты экрана
            this.left = Math.random() * (window.innerWidth - this.width);
            this.bottom = newPlatBottom;

            this.visual = document.createElement('div');
            this.visual.classList.add('platform');

            this.visual.style.width = this.width + 'px';
            this.visual.style.height = this.height + 'px';
            this.visual.style.left = this.left + 'px';
            this.visual.style.bottom = this.bottom + 'px';

            grid.appendChild(this.visual);
        }
    }

    // ===========================
    // Создание платформ
    // ===========================
    function createPlatforms() {
        const gap = window.innerHeight / platformCount;
        for (let i = 0; i < platformCount; i++) {
            const newPlatBottom = i * gap;
            const newPlatform = new Platform(newPlatBottom);
            platforms.push(newPlatform);
        }
    }

    // ===========================
    // Движение платформ
    // ===========================
    function movePlatforms() {
        platforms.forEach(platform => {
            platform.bottom -= 2; // скорость падения
            platform.visual.style.bottom = platform.bottom + 'px';

            if (platform.bottom < 0) {
                platform.visual.remove();
                platforms.shift();
                const newPlatform = new Platform(window.innerHeight);
                platforms.push(newPlatform);
            }
        });
    }

    // ===========================
    // Создание Doodler
    // ===========================
    doodler.classList.add('doodler');
    grid.appendChild(doodler);

    // Начальная позиция Doodler
    doodlerLeft = window.innerWidth * 0.25;
    doodlerBottom = window.innerHeight * 0.25;

    doodler.style.left = doodlerLeft + 'px';
    doodler.style.bottom = doodlerBottom + 'px';

    // ===========================
    // Движение Doodler
    // ===========================
    function moveLeft() {
        if (isGoingRight) {
            clearInterval(rightTimerId);
            isGoingRight = false;
        }
        isGoingLeft = true;
        leftTimerId = setInterval(() => {
            if (doodlerLeft >= 0) {doodlerLeft -= 5;
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
            if (doodlerLeft <= window.innerWidth - doodler.offsetWidth) {
                doodlerLeft += 5;
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

    // ===========================
    // Запуск игры
    // ===========================
    function start() {
        createPlatforms();
        setInterval(movePlatforms, 30);
        document.addEventListener('keyup', control);

        // Сенсорное управление
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

    start();
});
