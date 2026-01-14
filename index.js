document.addEventListener('DOMContentLoaded', () => {

  /* Telegram */
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready()
    Telegram.WebApp.expand()
  }

  const LOGICAL_WIDTH = 400
  const LOGICAL_HEIGHT = 600

  const grid = document.querySelector('.grid')

  let scale = 1

  function resize() {
    scale = Math.min(
      window.innerWidth / LOGICAL_WIDTH,
      window.innerHeight / LOGICAL_HEIGHT
    )

    grid.style.width = LOGICAL_WIDTH + 'px'
    grid.style.height = LOGICAL_HEIGHT + 'px'
    grid.style.transform = scale(${scale})
    grid.style.transformOrigin = 'top left'
  }

  resize()
  window.addEventListener('resize', resize)

  /* ===== Doodler ===== */
  const doodler = document.createElement('div')
  doodler.classList.add('doodler')
  doodler.style.width = '60px'
  doodler.style.height = '60px'
  grid.appendChild(doodler)

  let doodlerX = 170
  let doodlerY = 150
  let velocityY = 0

  /* ===== Platforms ===== */
  const platforms = []
  const PLATFORM_WIDTH = 85
  const PLATFORM_HEIGHT = 15

  function createPlatform(x, y) {
    const p = document.createElement('div')
    p.classList.add('platform')
    p.style.width = PLATFORM_WIDTH + 'px'
    p.style.height = PLATFORM_HEIGHT + 'px'
    p.style.left = x + 'px'
    p.style.bottom = y + 'px'
    grid.appendChild(p)
    platforms.push({ el: p, x, y })
  }

  for (let i = 0; i < 6; i++) {
    createPlatform(
      Math.random() * (LOGICAL_WIDTH - PLATFORM_WIDTH),
      i * 100
    )
  }

  /* ===== Physics ===== */
  const GRAVITY = -0.6
  const JUMP_FORCE = 15

  function update() {
    velocityY += GRAVITY
    doodlerY += velocityY

    if (doodlerY < 0) {
      doodlerY = 0
      velocityY = JUMP_FORCE
    }

    platforms.forEach(p => {
      if (
        velocityY < 0 &&
        doodlerY <= p.y + PLATFORM_HEIGHT &&
        doodlerY >= p.y &&
        doodlerX + 50 > p.x &&
        doodlerX < p.x + PLATFORM_WIDTH
      ) {
        velocityY = JUMP_FORCE
      }
    })

    // Ограничения по X
    if (doodlerX < 0) doodlerX = 0
    if (doodlerX > LOGICAL_WIDTH - 60) doodlerX = LOGICAL_WIDTH - 60

    doodler.style.left = doodlerX + 'px'
    doodler.style.bottom = doodlerY + 'px'

    requestAnimationFrame(update)
  }

  velocityY = JUMP_FORCE
  update()

  /* ===== Touch control ===== */
  grid.addEventListener('touchstart', e => {
    e.preventDefault()

    const rect = grid.getBoundingClientRect()
    const touchX = (e.touches[0].clientX - rect.left) / scale

    if (touchX < LOGICAL_WIDTH / 2) doodlerX -= 20
    else doodlerX += 20
  }, { passive: false })

})
