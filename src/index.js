const PullToRefresh = require('./libs/PullToRefresh');

const init = (wrapper, loader, options) => new PullToRefresh(wrapper, loader, options);

window.PullToRefresh = init;
