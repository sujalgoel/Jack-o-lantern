module.exports = {
	clean: (text) => {
		if (typeof text === 'string') {
			return text
				.replace(/`/g, '`' + String.fromCharCode(8203))
				.replace(/@/g, '@' + String.fromCharCode(8203));
		} else {
			return text;
		}
	},
	convertTime: (time) => {
		const absoluteSeconds = Math.floor((time / 1000) % 60);
		const absoluteMinutes = Math.floor((time / (1000 * 60)) % 60);
		const absoluteHours = Math.floor((time / (1000 * 60 * 60)) % 24);
		const absoluteDays = Math.floor(time / (1000 * 60 * 60 * 24));
		const d = absoluteDays
			? absoluteDays === 1
				? '1 day'
				: `${absoluteDays} days`
			: null;
		const h = absoluteHours
			? absoluteHours === 1
				? '1 hour'
				: `${absoluteHours} hours`
			: null;
		const m = absoluteMinutes
			? absoluteMinutes === 1
				? '1 minute'
				: `${absoluteMinutes} minutes`
			: null;
		const s = absoluteSeconds
			? absoluteSeconds === 1
				? '1 second'
				: `${absoluteSeconds} seconds`
			: null;
		const absoluteTime = [];
		if (d) absoluteTime.push(d);
		if (h) absoluteTime.push(h);
		if (m) absoluteTime.push(m);
		if (s) absoluteTime.push(s);
		return absoluteTime.join(', ');
	},
	getRandomString: (length) => {
		const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += randomChars.charAt(
				Math.floor(Math.random() * randomChars.length),
			);
		}
		return result;
	},
	shuffleArray: (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	},
};
