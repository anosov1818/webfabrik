/**
 * main.js — мобильное меню, подменю-аккордеон, fallback для кнопки, 3D tag cloud.
 *
 * Форма:   Rx = Rz = R, Ry = 0.6 R.
 * Размер:  R = min((w−80)/2, (h−80)/1.2), BASE = 51.
 * Объём:   fillR — экспоненциальное распределение (K = 4).
 * Центр:   PHP, JavaScript, MySQL, HTML5, Laravel.
 * Скорость: AUTO_ROT_Y = 0.0012 (полный оборот ~87 сек).
 */

// ---------------------------------------------------------------------------
// Утилита
// ---------------------------------------------------------------------------

const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;

// ---------------------------------------------------------------------------
// 1. Мобильное меню
// ---------------------------------------------------------------------------

const menuWrapper   = document.querySelector('.menu-wrapper');
const mobileTrigger = document.getElementById('mobile-nav-trigger');

if (menuWrapper && mobileTrigger) {
    const setOpen = open => {
        menuWrapper.classList.toggle('_active', open);
        mobileTrigger.setAttribute('aria-expanded', String(open));
        mobileTrigger.setAttribute(
            'aria-label',
            open ? 'Закрыть меню' : 'Открыть меню'
        );
    };

    mobileTrigger.addEventListener('click', event => {
        event.stopPropagation();
        setOpen(!menuWrapper.classList.contains('_active'));
    });

    menuWrapper.addEventListener('click', event => {
        const link = event.target.closest('nav a');
        if (!link) return;

        // «Услуги» на мобилке — toggle подменю, само меню не закрываем
        if (link.classList.contains('arrow') && isMobile()) return;

        setOpen(false);

        // Сбрасываем открытые подменю, чтобы при следующем открытии было свёрнуто
        menuWrapper.querySelectorAll('li._sub-open').forEach(li => {
            li.classList.remove('_sub-open');
        });
    });
}

// ---------------------------------------------------------------------------
// 2. Подменю «Услуги» — аккордеон на мобилке
// ---------------------------------------------------------------------------

document.querySelectorAll('nav.menu a.arrow').forEach(arrow => {
    arrow.addEventListener('click', event => {
        if (!isMobile()) return;

        // На мобилке клик по «Услуги» не ведёт на services.html,
        // а раскрывает/скрывает подменю
        event.preventDefault();

        const li = arrow.closest('li');
        if (li) li.classList.toggle('_sub-open');
    });
});

// ---------------------------------------------------------------------------
// 3. Fallback для <button class="order">
// ---------------------------------------------------------------------------

document.querySelectorAll('button.order').forEach(btn => {
    btn.addEventListener('click', event => {
        const target = document.querySelector('#apply');
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ---------------------------------------------------------------------------
// 4. 3D tag cloud — эллипсоид ×1.5, главные технологии в центре
// ---------------------------------------------------------------------------

(() => {

    const scene = document.querySelector('.technologies-scene');
    if (!scene) return;

    const items = [...scene.querySelectorAll('.tech-item')];
    if (!items.length) return;

    const N = items.length;
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const BASE = 51;

    const AUTO_ROT_Y = 0.0012;
    const DRAG_SENS  = 0.008;
    const HEIGHT_RATIO = 0.6;
    const EXP_K = 4;

    const CENTER_POINTS = {
        0: { dir: [ 0.0, -1.0,  0.0], fillR: 0.22, factor: 1.0 },
        1: { dir: [ 1.0,  0.0,  0.0], fillR: 0.24, factor: 1.0 },
        4: { dir: [ 0.0,  1.0,  0.0], fillR: 0.22, factor: 1.0 },
        7: { dir: [-1.0,  0.0,  0.0], fillR: 0.24, factor: 1.0 },
        9: { dir: [ 0.0,  0.0,  1.0], fillR: 0.30, factor: 1.0 },
    };

    let Rx = 0, Ry = 0, Rz = 0;
    let rx = 0, ry = 0;
    let vx = 0, vy = 0;
    let dragging = false;
    let lastX = 0, lastY = 0;

    const rand = (seed) => {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x);
    };

    const EXP_MINUS_1 = Math.exp(EXP_K) - 1;

    const points = items.map((el, i) => {
        let nx, ny, nz, fillR, factor;

        if (CENTER_POINTS[i]) {
            const cp = CENTER_POINTS[i];
            [nx, ny, nz] = cp.dir;
            fillR = cp.fillR;
            factor = cp.factor;
        } else {
            const y = 1 - (i / (N - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const theta = i * GOLDEN_ANGLE;

            nx = Math.cos(theta) * r;
            ny = y;
            nz = Math.sin(theta) * r;

            const u = rand(i + 0.13);
            const expU = Math.log(1 + u * EXP_MINUS_1) / EXP_K;
            fillR = 0.4 + 0.6 * expU;

            factor = 0.7 + 0.7 * rand(i * 7.3 + 3.7);
        }

        const size = BASE * factor;

        el.style.width  = size + 'px';
        el.style.height = size + 'px';
        el.style.marginLeft = (-size / 2) + 'px';
        el.style.marginTop  = (-size / 2) + 'px';

        return { el, nx, ny, nz, fillR };
    });

    const updateRadii = () => {
        const rect = scene.getBoundingClientRect();

        const rByWidth  = (rect.width  - 80) / 2;
        const rByHeight = (rect.height - 80) / (2 * HEIGHT_RATIO);
        const R = Math.max(50, Math.min(rByWidth, rByHeight));

        Rx = R;
        Ry = R * HEIGHT_RATIO;
        Rz = R;
    };
    updateRadii();
    window.addEventListener('resize', updateRadii);

    const render = () => {

        if (!dragging) {
            ry += vy;
            rx += vx;
            vy *= 0.95;
            vx *= 0.95;
            if (Math.abs(vy) < 0.002 && Math.abs(vx) < 0.002) {
                vy = 0;
                vx = 0;
                ry += AUTO_ROT_Y;
            }
        }

        const cy = Math.cos(ry), sy = Math.sin(ry);
        const cx = Math.cos(rx), sx = Math.sin(rx);

        for (let i = 0; i < N; i++) {
            const p = points[i];
            const f = p.fillR;

            const x0 = p.nx * Rx * f;
            const y0 = p.ny * Ry * f;
            const z0 = p.nz * Rz * f;

            const x1 =  x0 * cy + z0 * sy;
            const z1 = -x0 * sy + z0 * cy;

            const y2 =  y0 * cx + z1 * sx;
            const z2 = -y0 * sx + z1 * cx;

            p.el.style.transform =
                `translate3d(${x1.toFixed(1)}px, ${y2.toFixed(1)}px, ${z2.toFixed(1)}px)`;

            p.el.style.zIndex = Math.round(z2 + 1000);
        }

        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    scene.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        vy = 0;
        vx = 0;
        scene.classList.add('dragging');
        scene.setPointerCapture(e.pointerId);
    });

    scene.addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        ry += dx * DRAG_SENS;
        rx -= dy * DRAG_SENS;

        vy =  dx * DRAG_SENS;
        vx = -dy * DRAG_SENS;

        lastX = e.clientX;
        lastY = e.clientY;
    });

    const endDrag = e => {
        if (!dragging) return;
        dragging = false;
        scene.classList.remove('dragging');
        try { scene.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    scene.addEventListener('pointerup', endDrag);
    scene.addEventListener('pointercancel', endDrag);

    scene.addEventListener('dblclick', () => {
        vx = 0;
        vy = 0;
    });

})();