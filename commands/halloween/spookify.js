const axios = require('axios');
const Discord = require('discord.js');
const Command = require('../../structures/CommandClass');

module.exports = class SpookifyCmd extends Command {
	constructor(client) {
		super(client, {
			name: 'spookify',
			type: 'CHAT_INPUT',
			options: [
				{
					name: 'user',
					description: 'The user to spookify.',
					type: 6,
				},
			],
			usage: 'spookify',
			category: 'Halloween',
			description: 'Spookifies user avatar.',
			cooldown: 5,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		try {
			const memberId = interaction.options.getUser('user')
				? interaction.options.getUser('user').id
				: interaction.user.id;
			const member = interaction.guild.members.cache.get(memberId);

			const data = await axios({
				method: 'get',
				url: `https://api.sujalgoel.engineer/image/halloween?image=${member.user.displayAvatarURL(
					{ format: 'png', size: 2048 },
				)}`,
				headers: {
					Authorization: `Sujal ${process.env.API_KEY}`,
				},
				responseType: 'json',
			});

			const attachment = new Discord.MessageAttachment(
				Buffer.from(data.data.data.image.split(',')[1], 'base64'),
				'spookify.png',
			);

			const embed = new Discord.MessageEmbed()
				.setAuthor(
					`${member.user.username}'s Spookified Avatar`,
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setColor('#f75f1c')
				.setImage('attachment://spookify.png')
				.setFooter(
					`Requested by ${interaction.user.tag}`,
					interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.setTimestamp();

			interaction.editReply({ embeds: [embed], files: [attachment] });
		} catch (e) {
			console.log(e);
		}
	}
};
