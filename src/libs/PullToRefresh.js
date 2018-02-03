const _ = require('lodash');

const STATUS = {
  normal: 0,
  pull: 1,
  animate: 2,
  update: 3,
};

class PullToRefresh {
  constructor(el, options) {
    const defaultOptions = {
      onUpdate() {},
    };

    this.el = el;
    this.loaderHeight = 50;
    this.positionTop = 0;
    this.status = STATUS.normal;
    this.touchStart = {};
    this.pullStart = {};
    this.options = _.assign(defaultOptions, options);

    el.addEventListener('touchstart', (e) => {
      this.onTouchStart(e);
    });
    el.addEventListener('touchmove', (e) => {
      this.onTouchMove(e);
    }, { passive: false });
    el.addEventListener('touchend', (e) => {
      this.onTouchEnd(e);
    });

    this.el.style.position = 'relative';
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

        this.el.style.top = `${this.positionTop}px`;
      } else {
        this.status = STATUS.normal;
        this.positionTop = 0;
        this.el.style.top = this.positionTop;
      }

      e.preventDefault();
    }
  }

  onTouchEnd() {
    if (this.status === STATUS.pull) {
      if (this.positionTop >= this.loaderHeight) {
        this.status = STATUS.update;
        this.positionTop = this.loaderHeight;
        this.el.style.top = `${this.positionTop}px`;
        setTimeout(() => {
          this.options.onUpdate();

          this.status = STATUS.normal;
          this.positionTop = 0;
          this.el.style.top = this.positionTop;
        }, 1000);
      } else {
        this.status = STATUS.normal;
        this.positionTop = 0;
        this.el.style.top = this.positionTop;
      }
    }
  }
}

module.exports = PullToRefresh;
