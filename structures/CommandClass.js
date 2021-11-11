/* eslint-disable no-unused-vars */
/* eslint-disable no-inline-comments */

module.exports = class Command {
	constructor(client, meta = {}) {
		this.client = client;
		this.name = meta.name;
		this.type = meta.type;
		this.options = meta.options || [];
		this.usage = meta.usage || this.name;
		this.category = meta.category || null;
		this.description = meta.description || null;
		this.cooldown = meta.cooldown || 0; // in seconds
		this.contextDescription = meta.contextDescription || null;
	}

	async run(message, run) {
		throw new Error(
			`The Slash Command "${this.name}" does not provide a run method.`,
		);
	}
};
