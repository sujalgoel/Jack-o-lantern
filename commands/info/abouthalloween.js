const Discord = require('discord.js');
const Command = require('../../structures/CommandClass');

module.exports = class AboutHalloween extends Command {
	constructor(client) {
		super(client, {
			name: 'abouthalloween',
			type: 'CHAT_INPUT',
			usage: 'abouthalloween',
			category: 'Info',
			description: 'Don\'t know what is Halloween? Learn from here.',
			cooldown: 3,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		const embed = new Discord.MessageEmbed()
			.setColor('#f75f1c')
			.setAuthor('According to History.com', 'https://www.history.com/.image/MTU1MTMyMDIxMzE4OTAzNjgy/icons-favicon.png', 'https://www.history.com')
			.setDescription(
				'Halloween is a holiday celebrated each year on October 31. The tradition originated with the ancient Celtic festival of **[Samhain](https://www.history.com/topics/holidays/samhain)**, when people would light bonfires and wear costumes to ward off ghosts. In the eighth century, Pope Gregory III designated November 1 as a time to honor all saints. Soon, All Saints Day incorporated some of the traditions of Samhain. The evening before was known as All Hallows Eve, and later Halloween. Over time, Halloween evolved into a day of activities like trick-or-treating, carving jack-o-lanterns, festive gatherings, donning costumes and eating treats.',
			)
			.setThumbnail(client.user.displayAvatarURL({ format: 'png', size: 2048 }))
			.addField('Want to know more?', 'Click the button below.')
			.setFooter(
				`Requested by ${interaction.user.tag}`,
				interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
			)
			.setTimestamp();

		const btn1 = new Discord.MessageButton()
			.setStyle('LINK')
			.setEmoji('🎃')
			.setURL('https://www.history.com/topics/halloween/history-of-halloween')
			.setLabel('Halloween');

		interaction.editReply({
			embeds: [embed],
			components: [{ type: 1, components: [btn1] }],
		});
	}
};
