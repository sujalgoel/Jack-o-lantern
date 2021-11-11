const Discord = require('discord.js');
const GuildDatabase = require('../../models/guild');
const Command = require('../../structures/CommandClass');

module.exports = class DisableGoodbyeChannel extends Command {
	constructor(client) {
		super(client, {
			name: 'disablegoodbyechannel',
			type: 'CHAT_INPUT',
			usage: 'disablegoodbyechannel',
			category: 'Moderator',
			description: 'Disable goodbye channel plugin.',
			cooldown: 10,
		});
	}

	async run(client, interaction) {
		if (
			!interaction.member.permissions.has(
				Discord.Permissions.FLAGS.MANAGE_GUILD,
			)
		) {
			const embed1 = new Discord.MessageEmbed()
				.setColor('#f04947')
				.setDescription(
					'<:Error:907325609334685756> | You don\'t have `MANAGE_GUILD` permission.',
				);
			return interaction.editReply({ embeds: [embed1] });
		}
		const data = await GuildDatabase.findOne({ _id: interaction.guild.id });
		if (!data) {
			await new GuildDatabase({ _id: interaction.guild.id }).save();
			const embed1 = new Discord.MessageEmbed()
				.setColor('#43b481')
				.setDescription(
					'<:Success:907325753698447400> | Successfully disabled goodbye channel plugin.',
				);
			return interaction.editReply({ embeds: [embed1] });
		} else {
			data.goodbyeChannel = null;
			data.goodbyeMessage = null;
			await data.save();
			const embed1 = new Discord.MessageEmbed()
				.setColor('#43b481')
				.setDescription(
					'<:Success:907325753698447400> | Successfully disabled goodbye channel plugin.',
				);
			interaction.editReply({ embeds: [embed1] });
		}
	}
};
