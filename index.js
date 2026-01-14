document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');

    // ===========================
    // Подгоняем grid под экран
    // ===========================
    function resizeGrid() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        grid.style.width = width + 'px';
        grid.style.height = height + 'px';
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
    // Создаём платформы
    // ===========================
    const platforms = [];
    const platformCount = 5;

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
    // Создаём Doodler
    // ===========================
    const doodler = document.createElement('div');
    doodler.classList.add('doodler');
    grid.appendChild(doodler);

    // Размер Doodler адаптивно
    doodler.style.width = window.innerWidth * 0.15 + 'px';
    doodler.style.height = 'auto';

    // Начальная позиция
    let doodlerLeft = window.innerWidth * 0.25;
    let doodlerBottom = window.innerHeight * 0.25;

    doodler.style.left = doodlerLeft + 'px';
    doodler.style.bottom = doodlerBottom + 'px';

    // ===========================
    // Запуск игры
    // ===========================
    function start() {
        createPlatforms();
        setInterval(movePlatforms, 30);
    }

    start();
});
