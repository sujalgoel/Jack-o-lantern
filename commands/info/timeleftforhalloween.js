const Discord = require('discord.js');
const Command = require('../../structures/CommandClass');

module.exports = class TimeLeftForHalloween extends Command {
	constructor(client) {
		super(client, {
			name: 'timeleftforhalloween',
			type: 'CHAT_INPUT',
			usage: 'timeleftforhalloween',
			category: 'Info',
			description: 'Get to know the time left for the next halloween.',
			cooldown: 5,
		});
	}

	async run(client, interaction) {
		let diff = Math.floor(
			(new Date(new Date().getFullYear() + 1, 9, 31, 0, 0, 0, 0) - new Date()) /
				1000,
		);
		const date = new Date().toString();
		const embed = new Discord.MessageEmbed()
			.setColor('#f75f1c')
			.setAuthor(
				`Time left for Halloween ${new Date().getFullYear() + 1}.`,
				client.user.displayAvatarURL({ format: 'png', size: 2048 }),
			)
			.setDescription(
				`${Math.floor(diff / 86400)} days, ${Math.floor(
					(diff %= 86400) / 3600,
				)} hours, ${Math.floor((diff %= 3600) / 60)} minutes and ${Math.floor(
					(diff %= 60),
				)} seconds left for Halloween ${
					new Date().getFullYear() + 1
				}. ${date.slice(date.indexOf('('))}`,
			)
			.setThumbnail(client.user.displayAvatarURL({ format: 'png', size: 2048 }))
			.setFooter(
				`Requested by ${interaction.user.tag}`,
				interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
			)
			.setTimestamp();

		const btn1 = new Discord.MessageButton()
			.setStyle('LINK')
			.setEmoji('🎃')
			.setURL('https://www.timeanddate.com/countdown/halloween')
			.setLabel('Halloween Countdown');

		interaction.editReply({
			embeds: [embed],
			components: [{ type: 1, components: [btn1] }],
		});
	}
};
