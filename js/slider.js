/**
 * slider.js — слайдер «большой / средний / маленький» с кликабельными точками.
 */

class Slider {
    constructor(options = {}) {
        this.total      = 3;
        this.intervalMs = options.intervalMs ?? 6000;
        this.fadeMs     = options.fadeMs     ?? 350;
        this.step       = 0;

        this.positions = [
            { width: 35, right: -13, top: 14 },
            { width: 15, right: 35,  top: -5 },
            { width: 24, right: 25,  top: 43 },
        ];

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
        const big = (3 - step) % this.total;
        const order = [
            big,
            (big + this.total - 1) % this.total,
            (big + 1) % this.total,
        ];

        order.forEach((slideIndex, posIndex) => {
            const pos = this.positions[posIndex];
            const el  = this.slides[slideIndex];
            el.style.right = pos.right + '%';
            el.style.top   = pos.top   + '%';
            el.style.width = pos.width + '%';
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