const Discord = require('discord.js');
const Event = require('../../structures/EventClass');

module.exports = class ReadyEvent extends Event {
	constructor(client) {
		super(client, {
			name: 'guildCreate',
		});
	}
	async run(guild) {
		let channel;
		await guild.members.fetch();
		guild.channels.cache.forEach((c) => {
			if (
				!channel &&
				c.type === 'GUILD_TEXT' &&
				c.permissionsFor(guild.me).has(Discord.Permissions.FLAGS.SEND_MESSAGES)
			) {
				channel = c;
			}
		});

		const embed1 = new Discord.MessageEmbed()
			.setAuthor(
				`${this.client.user.username}'s Notification`,
				this.client.user.displayAvatarURL({ format: 'png', size: 2048 }),
			)
			.setThumbnail(
				this.client.user.displayAvatarURL({ format: 'png', size: 2048 }),
			)
			.setTitle('Thanks for adding me to your server!')
			.setColor('#f75f1c')
			.setDescription(
				`My default prefix is **\`/\`**. Yea, I support slash commands.
				Type **\`/help\`** to get the list of commands.`,
			)
			.addField(
				'Why there are no prefix commands?',
				'This is because, Discord recently introduced a new intent for bots i.e. Message Content Intent which means we need that intent for the bot to access the message and reply to them. \n\nIf the bot grows and to prevent any errors and intent requests, we made it to use only slash commands.',
			)
			.setFooter(
				`${this.client.user.username}'s Notification`,
				this.client.user.displayAvatarURL({ format: 'png', size: 2048 }),
			)
			.setTimestamp();
		return channel.send({ embeds: [embed1] });
	}
};
