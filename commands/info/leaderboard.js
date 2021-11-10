const Discord = require('discord.js');
const Database = require('../../models/user');
const Command = require('../../structures/CommandClass');

module.exports = class Leaderboard extends Command {
	constructor(client) {
		super(client, {
			name: 'leaderboard',
			type: 'CHAT_INPUT',
			usage: 'leaderboard',
			category: 'Info',
			description: 'Take a look at the candies leaderboard.',
			cooldown: 5,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		const data = await Database.find({});
		const leaderboard = data.sort((a, b) => b.candy - a.candy).slice(0, 10);
		let lb = '';
		for (let i = 0; i < leaderboard.length; i++) {
			const user = client.users.cache.get(leaderboard[i]._id)
				? client.users.cache.get(leaderboard[i]._id).tag
				: 'Unknown User';
			lb += `\`#${i + 1}\` **${user} ~** ${leaderboard[i].candy} Candies 🍬\n`;
		}

		const embed = new Discord.MessageEmbed()
			.setAuthor(
				`${client.user.username}'s Candy Leaderboard`,
				client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				'https://jack-o-lantern.sujalgoel.engineer/leaderboard',
			)
			.setURL('https://jack-o-lantern.sujalgoel.engineer/leaderboard')
			.setTitle('Global candy leaderboard')
			.setColor('#f75f1c')
			.setDescription(lb)
			.setThumbnail(client.user.displayAvatarURL({ format: 'png', size: 2048 }))
			.setFooter(
				`Requested by ${interaction.user.tag}`,
				interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
			)
			.setTimestamp();
		interaction.editReply({ embeds: [embed] });
	}
};
