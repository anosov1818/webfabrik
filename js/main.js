/**
 * main.js — мобильное меню + fallback для кнопки «Получить расчёт».
 */

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
        if (event.target.closest('nav a')) setOpen(false);
    });
}

// ---------------------------------------------------------------------------
// 2. Fallback: если где-то в разметке остался <button class="order">
// ---------------------------------------------------------------------------

document.querySelectorAll('button.order').forEach(btn => {
    btn.addEventListener('click', event => {
        const target = document.querySelector('#apply');
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});