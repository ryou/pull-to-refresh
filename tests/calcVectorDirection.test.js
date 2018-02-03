const calcVectorDirection = require('../src/libs/calcVectorDirection');

module.exports = () => {
  {
    const start = {
      x: 0,
      y: 0,
    };
    const end = {
      x: 100,
      y: 0,
    };
    console.assert(calcVectorDirection(start, end) === 'right', 'right check');
  }
  {
    const start = {
      x: 0,
      y: 0,
    };
    const end = {
      x: 0,
      y: 100,
    };
    console.assert(calcVectorDirection(start, end) === 'down', 'down check');
  }
  {
    const start = {
      x: 0,
      y: 0,
    };
    const end = {
      x: -100,
      y: 0,
    };
    console.assert(calcVectorDirection(start, end) === 'left', 'left check');
  }
  {
    const start = {
      x: 0,
      y: 0,
    };
    const end = {
      x: 0,
      y: -100,
    };
    console.assert(calcVectorDirection(start, end) === 'up', 'up check');
  }
};
