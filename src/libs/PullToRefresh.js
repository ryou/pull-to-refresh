const Velocity = require('velocity-animate');
const _ = require('lodash');

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
    this.positionTop = 0;
    this.status = STATUS.normal;
    this.touchStart = {};
    this.pullStart = {};
    this.options = _.assign(defaultOptions, options);

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

  static calcVectorDirection(start, end) {
    let direction;
    const vector = {
      x: end.x - start.x,
      y: end.y - start.y,
    };
    const rad = Math.atan2(vector.y, vector.x);
    let theta = (rad / (2 * Math.PI)) * 360; // -179.9999 ~ 180
    theta = (theta < 0) ? 360 + theta : theta; // 0 ~ 359.9999

    if (theta < 45) {
      direction = 'right';
    } else if (theta < 135) {
      direction = 'down';
    } else if (theta < 225) {
      direction = 'left';
    } else if (theta < 315) {
      direction = 'up';
    } else {
      direction = 'right';
    }

    return direction;
  }

  onTouchStart(e) {
    this.touchStart = PullToRefresh.calcTouchPoint(e);
  }

  onTouchMove(e) {
    const touch = PullToRefresh.calcTouchPoint(e);

    if (window.scrollY === 0 && this.status === STATUS.normal) {
      const direction = PullToRefresh.calcVectorDirection(this.touchStart, touch);

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
        this.positionTop = difference.y / 2;
        this.wrapper.style.top = `${this.positionTop}px`;

        if (this.positionTop >= this.loaderHeight) {
          this.loader.classList.add(this.options.willUpdateClass);
        } else {
          this.loader.classList.remove(this.options.willUpdateClass);
        }
      } else {
        this.status = STATUS.normal;
        this.positionTop = 0;
        this.wrapper.style.top = this.positionTop;
      }

      e.preventDefault();
    }
  }

  onTouchEnd() {
    if (this.status === STATUS.pull) {
      if (this.positionTop >= this.loaderHeight) {
        this.status = STATUS.update;
        this.positionTop = this.loaderHeight;

        this.loader.classList.remove(this.options.willUpdateClass);
        this.loader.classList.add(this.options.waitResponseClass);

        Velocity(this.wrapper, {
          top: `${this.positionTop}px`,
        }, {
          duration: 150,
        });

        this.options.onStartUpdate();
      } else {
        this.positionTop = 0;

        Velocity(this.wrapper, {
          top: `${this.positionTop}px`,
        }, {
          duration: 150,
          complete: () => {
            this.status = STATUS.normal;
          },
        });
      }
    }
  }

  updateComplete() {
    this.positionTop = 0;
    this.loader.classList.remove(this.options.waitResponseClass);

    Velocity(this.wrapper, {
      top: `${this.positionTop}px`,
    }, {
      duration: 150,
      complete: () => {
        this.status = STATUS.normal;
      },
    });
  }
}

module.exports = PullToRefresh;
