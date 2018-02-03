const PullToRefresh = require('./libs/PullToRefresh');

const init = (el, options) => new PullToRefresh(el, options);

window.PullToRefresh = init;
