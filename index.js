document.addEventListener('DOMContentLoaded', () => {
    // ===== Telegram Mini App Integration =====
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready()
        Telegram.WebApp.expand()
    }
    // =========================================

    const grid = document.querySelector('.grid')
    const doodler = document.createElement('div')

    let doodlerLeft = 0.125 // в процентах от ширины grid (пример: 50/400)
    let doodlerBottom = 0.25 // в процентах от высоты grid (пример: 150/600)
    let isGameOver = false

    const platformCount = 5
    const platforms = []

    let upTimerId
    let downTimerId
    let leftTimerId
    let rightTimerId

    let isJumping = true
    let isGoingLeft = false
    let isGoingRight = false
    let score = 0
    let startPoint = doodlerBottom

    // ===== Получаем размеры в пикселях по текущему экрану =====
    function pxWidth(percent) { return percent * grid.offsetWidth }
    function pxHeight(percent) { return percent * grid.offsetHeight }

    // ===== Создание Doodler =====
    function createDoodle() {
        grid.appendChild(doodler)
        doodler.classList.add('doodler')
        doodler.style.width = pxWidth(0.2175) + 'px' // 87/400
        doodler.style.height = pxHeight(0.1416) + 'px' // 85/600
        doodler.style.left = pxWidth(doodlerLeft) + 'px'
        doodler.style.bottom = pxHeight(doodlerBottom) + 'px'
    }

    // ===== Класс платформы =====
    class Platform {
        constructor(bottomPercent) {
            this.bottom = bottomPercent // в процентах
            this.left = Math.random() * (1 - 0.2125) // 85/400
            this.visual = document.createElement('div')
            const visual = this.visual
            visual.classList.add('platform')
            visual.style.width = pxWidth(0.2125) + 'px'
            visual.style.height = pxHeight(0.025) + 'px' // 15/600
            visual.style.left = pxWidth(this.left) + 'px'
            visual.style.bottom = pxHeight(this.bottom) + 'px'
            grid.appendChild(visual)
        }

        updatePosition() {
            this.visual.style.left = pxWidth(this.left) + 'px'
            this.visual.style.bottom = pxHeight(this.bottom) + 'px'
        }
    }

    // ===== Создание платформ =====
    function createPlatforms() {
        for (let i = 0; i < platformCount; i++) {
            let gap = 1 / platformCount
            let platBottom = i * gap
            let p = new Platform(platBottom)
            platforms.push(p)
        }
    }

    // ===== Движение платформ вверх =====
    function movePlatforms() {
        if (doodlerBottom > 0.33) { // 1/3 высоты экрана
            platforms.forEach(platform => {
                platform.bottom -= 0.0067 // пропорционально движению
                if (platform.bottom < 0) {
                    platform.visual.remove()
                    platforms.shift()
                    score++
                    let newPlat = new Platform(1)
                    platforms.push(newPlat)
                }
                platform.updatePosition()
            })
        }
    }

    // ===== Прыжок =====
    function jump() {
        clearInterval(downTimerId)
        isJumping = true
        upTimerId = setInterval(() => {
            doodlerBottom += 0.0333 // примерно 20px / 600px
            doodler.style.bottom = pxHeight(doodlerBottom) + 'px'
            if (doodlerBottom > startPoint + 0.333) { // примерно 200px
                fall()
                isJumping = false
            }
        }, 30)
    }

    // ===== Падение =====
    function fall() {
        isJumping = false
        clearInterval(upTimerId)
        downTimerId = setInterval(() => {
            doodlerBottom -= 0.0083 // примерно 5px / 600px
            doodler.style.bottom = pxHeight(doodlerBottom) + 'px'

            if (doodlerBottom <= 0) {
                gameOver()
            }

            platforms.forEach(platform => {
                if (
                    doodlerBottom >= platform.bottom &&
                    doodlerBottom <= platform.bottom + 0.025 &&(doodlerLeft + 0.2175) >= platform.left &&
                    doodlerLeft <= platform.left + 0.2125 &&
                    !isJumping
                ) {
                    startPoint = doodlerBottom
                    jump()
                    isJumping = true
                }
            })
        }, 20)
    }

    // ===== Движение Doodler =====
    function moveLeft() {
        if (isGoingRight) { clearInterval(rightTimerId); isGoingRight = false }
        isGoingLeft = true
        leftTimerId = setInterval(() => {
            if (doodlerLeft >= 0) {
                doodlerLeft -= 0.0125 // 5px / 400px
                doodler.style.left = pxWidth(doodlerLeft) + 'px'
            } else moveRight()
        }, 20)
    }

    function moveRight() {
        if (isGoingLeft) { clearInterval(leftTimerId); isGoingLeft = false }
        isGoingRight = true
        rightTimerId = setInterval(() => {
            if (doodlerLeft <= 1 - 0.2175) {
                doodlerLeft += 0.0125
                doodler.style.left = pxWidth(doodlerLeft) + 'px'
            } else moveLeft()
        }, 20)
    }

    function moveStraight() {
        isGoingLeft = false
        isGoingRight = false
        clearInterval(leftTimerId)
        clearInterval(rightTimerId)
    }

    // ===== Конец игры =====
    function gameOver() {
        isGameOver = true
        while (grid.firstChild) grid.removeChild(grid.firstChild)
        grid.innerHTML = score
        clearInterval(upTimerId)
        clearInterval(downTimerId)
        clearInterval(leftTimerId)
        clearInterval(rightTimerId)
    }

    // ===== Старт игры =====
    function start() {
        if (!isGameOver) {
            createPlatforms()
            createDoodle()
            setInterval(movePlatforms, 30)
            jump(startPoint)

            // ===== Сенсорное управление =====
            grid.addEventListener('touchstart', (e) => {
                e.preventDefault()
                const touchX = e.touches[0].clientX
                const screenWidth = window.innerWidth
                if (touchX < screenWidth / 2) moveLeft()
                else moveRight()
            })
            grid.addEventListener('touchend', (e) => {
                e.preventDefault()
                moveStraight()
            })
        }
    }

    start()
})
