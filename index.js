document.addEventListener('DOMContentLoaded', () => {

  // ===== Telegram Mini App Integration =====
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }

  const grid = document.querySelector('.grid');

  // ===== Логическая база =====
  const BASE_WIDTH = 400;
  const BASE_HEIGHT = 600;

  // Масштаб для подгонки под экран пользователя
  let scaleX = (tg?.viewportWidth || window.innerWidth) / BASE_WIDTH;
  let scaleY = (tg?.viewportHeight || window.innerHeight) / BASE_HEIGHT;

  grid.style.width = BASE_WIDTH + 'px';
  grid.style.height = BASE_HEIGHT + 'px';
  grid.style.transform = scale(${scaleX}, ${scaleY});
  grid.style.transformOrigin = 'top left';

  // ===== Игровые переменные =====
  let doodler = document.createElement('div');
  doodler.classList.add('doodler');
  grid.appendChild(doodler);

  let doodlerWidth = 60;   // базовая ширина
  let doodlerHeight = 60;  // базовая высота
  let doodlerX = BASE_WIDTH / 2 - doodlerWidth / 2;
  let doodlerY = 150 * scaleY;

  let velocityY = 0;
  const GRAVITY = -0.6 * scaleY;
  const JUMP_FORCE = 15 * scaleY;

  // ===== Платформы =====
  const platforms = [];
  const PLATFORM_BASE_WIDTH = 85;
  const PLATFORM_BASE_HEIGHT = 15;
  const PLATFORM_COUNT = 5;

  function createPlatform(x, y) {
    const p = document.createElement('div');
    p.classList.add('platform');
    p.style.width = PLATFORM_BASE_WIDTH + 'px';
    p.style.height = PLATFORM_BASE_HEIGHT + 'px';
    p.style.left = x + 'px';
    p.style.bottom = y + 'px';
    grid.appendChild(p);
    platforms.push({ el: p, x, y });
  }

  for (let i = 0; i < PLATFORM_COUNT; i++) {
    createPlatform(
      Math.random() * (BASE_WIDTH - PLATFORM_BASE_WIDTH),
      100 + i * (BASE_HEIGHT / PLATFORM_COUNT)
    );
  }

  // ===== Обновление позиций =====
  function update() {
    // движение по вертикали
    velocityY += GRAVITY;
    doodlerY += velocityY;

    if (doodlerY < 0) doodlerY = 0;

    // проверка столкновения с платформами
    platforms.forEach(p => {
      if (
        velocityY < 0 &&
        doodlerY <= p.y + PLATFORM_BASE_HEIGHT &&
        doodlerY >= p.y &&
        doodlerX + doodlerWidth > p.x &&
        doodlerX < p.x + PLATFORM_BASE_WIDTH
      ) {
        velocityY = JUMP_FORCE;
      }
    });

    doodler.style.left = doodlerX + 'px';
    doodler.style.bottom = doodlerY + 'px';

    requestAnimationFrame(update);
  }

  // старт прыжка
  velocityY = JUMP_FORCE;
  update();

  // ===== Сенсорное управление =====
  grid.addEventListener('touchstart', e => {
    e.preventDefault();
    const touchX = e.touches[0].clientX / scaleX; // делим на scale, чтобы координаты были логические
    if (touchX < BASE_WIDTH / 2) doodlerX -= 20;
    else doodlerX += 20;
  }, { passive: false });

  grid.addEventListener('touchend', e => {
    e.preventDefault();
  });

});
