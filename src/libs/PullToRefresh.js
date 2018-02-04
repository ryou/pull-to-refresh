const Velocity = require('velocity-animate');
const calcVectorDirection = require('./calcVectorDirection');

const STATUS = {
  normal: 0,
  pull: 1,
  animate: 2,
  update: 3,
};

class PullToRefresh {
  constructor(wrapper, loader, options) {
    const defaultOptions = {
      onStartUpdate() {
        this.updateComplete();
      },
      willUpdateClass: '-will-update',
      waitResponseClass: '-wait-response',
    };

    this.wrapper = wrapper;
    this.loader = loader;
    this.loaderHeight = this.loader.offsetHeight;
    this.status = STATUS.normal;
    this.touchStart = {};
    this.pullStart = {};
    this.options = Object.assign(defaultOptions, options);

    wrapper.addEventListener('touchstart', (e) => {
      this.onTouchStart(e);
    });
    wrapper.addEventListener('touchmove', (e) => {
      this.onTouchMove(e);
    }, { passive: false });
    wrapper.addEventListener('touchend', (e) => {
      this.onTouchEnd(e);
    });

    this.wrapper.style.position = 'relative';
  }

  static calcTouchPoint(e) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  onTouchStart(e) {
    this.touchStart = PullToRefresh.calcTouchPoint(e);
  }

  onTouchMove(e) {
    const touch = PullToRefresh.calcTouchPoint(e);

    if (window.scrollY === 0 && this.status === STATUS.normal) {
      const direction = calcVectorDirection(this.touchStart, touch);

      if (direction === 'down') {
        this.status = STATUS.pull;
        this.pullStart = touch;
      }
    } else if (this.status === STATUS.pull) {
      const difference = {
        x: touch.x - this.pullStart.x,
        y: touch.y - this.pullStart.y,
      };

      if (difference.y > 0) {
        const move = difference.y / 2;
        this.wrapper.style.top = `${move}px`;

        if (move >= this.loaderHeight) {
          this.loader.classList.add(this.options.willUpdateClass);
        } else {
          this.loader.classList.remove(this.options.willUpdateClass);
        }
      } else {
        this.status = STATUS.normal;
        this.wrapper.style.top = 0;
      }

      e.preventDefault();
    }
  }

  onTouchEnd() {
    if (this.status === STATUS.pull) {
      if (this.loader.classList.contains(this.options.willUpdateClass)) {
        this.startUpdate();
      } else {
        Velocity(this.wrapper, {
          top: 0,
        }, {
          duration: 150,
          complete: () => {
            this.status = STATUS.normal;
          },
        });
      }
    }
  }

  startUpdate() {
    this.status = STATUS.update;

    this.loader.classList.remove(this.options.willUpdateClass);
    this.loader.classList.add(this.options.waitResponseClass);

    Velocity(this.wrapper, {
      top: `${this.loaderHeight}px`,
    }, {
      duration: 150,
    });

    this.options.onStartUpdate();
  }

  updateComplete() {
    this.loader.classList.remove(this.options.waitResponseClass);

    Velocity(this.wrapper, {
      top: 0,
    }, {
      duration: 150,
      complete: () => {
        this.status = STATUS.normal;
      },
    });
  }
}

module.exports = PullToRefresh;
