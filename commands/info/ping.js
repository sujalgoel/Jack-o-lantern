const Discord = require('discord.js');
const Command = require('../../structures/CommandClass');

module.exports = class Ping extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			type: 'CHAT_INPUT',
			usage: 'ping',
			category: 'Info',
			description: 'Check my latency.',
			cooldown: 3,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				`${client.user.username}'s Ping`,
				client.user.displayAvatarURL({ format: 'png', size: 2048 }),
			)
			.setColor('#f75f1c')
			.setDescription(`:heart_decoration: **Heartbeat »** ${client.ws.ping} ms`)
			.setFooter(
				`Requested by ${interaction.user.tag}`,
				interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
			)
			.setTimestamp();
		interaction.editReply({ embeds: [embed] });
	}
};
