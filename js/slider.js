/**
 * slider.js — слайдер «большой / средний / маленький».
 *
 * Позиционирование полностью в CSS (классы .is-big / .is-medium / .is-small).
 * JS только переключает классы. Никаких inline-стилей.
 *
 * Порядок подобран так, чтобы совпадал с оригиналом:
 *   positions[0] = big  (35%, -13%, 14%)
 *   positions[1] = SMALL (15%, 35%, -5%)
 *   positions[2] = MEDIUM (24%, 25%, 43%)
 */

class Slider {
    constructor(options = {}) {
        this.total      = 3;
        this.intervalMs = options.intervalMs ?? 6000;
        this.fadeMs     = options.fadeMs     ?? 350;
        this.step       = 0;

        this.roles = ['is-big', 'is-small', 'is-medium'];

        this.slides = Array.from({ length: this.total },
            (_, i) => document.getElementById('slide' + (i + 1)));
        this.dots   = Array.from({ length: this.total },
            (_, i) => document.getElementById('dot' + (i + 1)));
        this.texts  = Array.from(document.querySelectorAll('.slider-text-block'));

        const missing = this.slides.some(el => !el)
                     || this.dots.some(el => !el)
                     || this.texts.length !== this.total;

        if (missing) {
            console.warn('Slider: не найдены все slide/dot/text элементы');
            return;
        }

        this.init();
    }

    init() {
        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => this.jumpTo(i));
        });
        this.goTo(0);
    }

    jumpTo(index) {
        this.stop();
        this.goTo(index);
        this.start();
    }

    goTo(index) {
        this.step = ((index % this.total) + this.total) % this.total;
        this.applySlides(this.step);
        this.applyDots(this.step);
        this.applyTexts(this.step);
    }

    nextSlide() {
        this.goTo(this.step + 1);
        return this;
    }

    start() {
        this.stop();
        this._timer = setInterval(() => this.nextSlide(), this.intervalMs);
        return this;
    }

    stop() {
        clearInterval(this._timer);
        return this;
    }

    applySlides(step) {
        // Кто «большой» на этом шаге
        const bigIndex = (3 - step) % this.total;

        // Порядок как в оригинале: [big, small, medium]
        // → slide[bigIndex]       получает is-big
        // → slide[(big+2)%N]      получает is-small
        // → slide[(big+1)%N]      получает is-medium
        const order = [
            bigIndex,
            (bigIndex + 2) % this.total,  // small
            (bigIndex + 1) % this.total,  // medium
        ];

        order.forEach((slideIndex, roleIndex) => {
            const el = this.slides[slideIndex];
            el.classList.remove('is-big', 'is-medium', 'is-small');
            el.classList.add(this.roles[roleIndex]);
        });
    }

    applyDots(step) {
        this.dots.forEach((dot, i) => {
            dot.style.opacity = i === step ? '1' : '0.3';
            dot.setAttribute('aria-current', i === step ? 'true' : 'false');
        });
    }

    applyTexts(step) {
        this.texts.forEach((el, i) => {
            el.classList.toggle('is-active', i === step);
        });
    }
}

const slider = new Slider();
slider.start();