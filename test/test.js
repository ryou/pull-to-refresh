const PullToRefresh = require('../libs/PullToRefresh');

const dir = PullToRefresh.calcVectorDirection({
  x: 0,
  y: 0,
}, {
  x: 100,
  y: -1,
});

console.log(dir);
