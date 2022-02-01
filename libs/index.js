const {x, cx, comp} = require('./xo.js');
const css = require('./pico-css.js');
const utils = require('./utils.js');


module.exports = {
	x,cx,comp,
	css : utils.isClient ? ()=>{} : css,
	...utils
};
