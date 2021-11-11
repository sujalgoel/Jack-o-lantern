/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

document.onkeydown = function(e) {
	e = e || window.event;
	if (e.ctrlKey) {
		const c = e.which || e.keyCode;
		switch (c) {
		case 83:
		case 85:
		case 65:
		case 73:
		case 123:
			e.preventDefault();
			e.stopPropagation();
			break;
		}
	}
};

window.addEventListener(
	'contextmenu',
	function(e) {
		e.preventDefault();
	},
	false,
);
