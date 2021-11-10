/* eslint-disable no-unused-vars */

module.exports = class Event {
	constructor(client, options = {}) {
		this.client = client;
		this.name = options.name;
	}

	async run(...args) {
		throw new Error(`The Event "${this.name}" does not provide a run method.`);
	}
};