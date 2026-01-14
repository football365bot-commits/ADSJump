document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');

    function resizeGrid() {
        const width = window.innerWidth;   // ширина экрана
        const height = window.innerHeight; // высота экрана

        grid.style.width = width + 'px';
        grid.style.height = height + 'px';
    }

    // запускаем сразу при загрузке
    resizeGrid();

    // подгоняем при изменении размера экрана
    window.addEventListener('resize', resizeGrid);
});
