/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function myFunction() {
	const x = document.getElementById('myTopnav');
	if (x.className === 'topnav') {
		x.className += ' responsive';
	} else {
		x.className = 'topnav';
	}
}
