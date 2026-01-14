document.addEventListener('DOMContentLoaded', () => {

  /* ===== Telegram WebApp Integration ===== */
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready()
    Telegram.WebApp.expand()
  }

  /* ===== Логическая база для масштабирования ===== */
  const BASE_WIDTH = 400
  const BASE_HEIGHT = 600

  const grid = document.querySelector('.grid')
  let scale = 1

  function resizeGrid() {
    scale = Math.min(
      window.innerWidth / BASE_WIDTH,
      window.innerHeight / BASE_HEIGHT
    )
    grid.style.width = BASE_WIDTH + 'px'
    grid.style.height = BASE_HEIGHT + 'px'
    grid.style.transform = scale(${scale})
    grid.style.transformOrigin = 'bottom left'
  }

  resizeGrid()
  window.addEventListener('resize', resizeGrid)

  /* ===== Doodler ===== */
  const doodler = document.createElement('div')
  doodler.classList.add('doodler')
  grid.appendChild(doodler)

  let doodlerX = 170
  let doodlerY = 150
  let velocityY = 0

  const BASE_DOODLER_WIDTH = 60
  const BASE_DOODLER_HEIGHT = 60

  doodler.style.width = BASE_DOODLER_WIDTH + 'px'
  doodler.style.height = BASE_DOODLER_HEIGHT + 'px'

  /* ===== Platforms ===== */
  const platforms = []
  const BASE_PLATFORM_WIDTH = 85
  const BASE_PLATFORM_HEIGHT = 15

  function createPlatform(x, y) {
    const p = document.createElement('div')
    p.classList.add('platform')
    p.style.width = BASE_PLATFORM_WIDTH + 'px'
    p.style.height = BASE_PLATFORM_HEIGHT + 'px'
    p.style.left = x + 'px'
    p.style.bottom = y + 'px'
    grid.appendChild(p)
    platforms.push({ el: p, x, y })
  }

  for (let i = 0; i < 6; i++) {
    createPlatform(
      Math.random() * (BASE_WIDTH - BASE_PLATFORM_WIDTH),
      i * 100
    )
  }

  /* ===== Physics ===== */
  const GRAVITY = -0.6
  const JUMP_FORCE = 15

  function update() {
    velocityY += GRAVITY
    doodlerY += velocityY

    if (doodlerY < 0) doodlerY = 0

    platforms.forEach(p => {
      if (
        velocityY < 0 &&
        doodlerY <= p.y + BASE_PLATFORM_HEIGHT &&
        doodlerY >= p.y &&
        doodlerX + BASE_DOODLER_WIDTH > p.x &&
        doodlerX < p.x + BASE_PLATFORM_WIDTH
      ) {
        velocityY = JUMP_FORCE
      }
    })

    doodler.style.left = doodlerX + 'px'
    doodler.style.bottom = doodlerY + 'px'

    requestAnimationFrame(update)
  }

  velocityY = JUMP_FORCE
  update()

  /* ===== Touch control ===== */
  grid.addEventListener('touchstart', e => {
    const x = e.touches[0].clientX
    if (x < window.innerWidth / 2) doodlerX -= 20
    else doodlerX += 20
  }, { passive: false })

})
