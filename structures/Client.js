const Discord = require('discord.js');
const EventHandler = require('../handler/Event');

module.exports = class BotClient extends Discord.Client {
	constructor(...opt) {
		super({
			opt,
			intents: [
				Discord.Intents.FLAGS.GUILDS,
				Discord.Intents.FLAGS.GUILD_MEMBERS,
				Discord.Intents.FLAGS.GUILD_MESSAGES,
				Discord.Intents.FLAGS.GUILD_PRESENCES,
				Discord.Intents.FLAGS.GUILD_VOICE_STATES,
			],
		});

		this.events = new Discord.Collection();
		this.commands = new Discord.Collection();
		new EventHandler(this).build('../events');
	}

	async login() {
		await super.login(process.env.TOKEN);
	}
};
