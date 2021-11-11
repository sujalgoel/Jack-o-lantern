const Discord = require('discord.js');
const GuildDatabase = require('../../models/guild');
const Command = require('../../structures/CommandClass');

module.exports = class EnableWelcomeChannel extends Command {
	constructor(client) {
		super(client, {
			name: 'enablewelcomechannel',
			type: 'CHAT_INPUT',
			options: [
				{
					name: 'channel',
					description: 'The channel where the welcome message will be sent.',
					type: 7,
					required: true,
				},
				{
					name: 'message',
					description:
						'{user} > Member Tag | {mention} > Member Ping | {username} > Member Username | {guild} > Guild Name.',
					type: 'STRING',
					required: true,
				},
			],
			usage: 'enablewelcomechannel',
			category: 'Moderator',
			description: 'Enable welcome channel plugin.',
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
					'<:Success:907325753698447400> | Successfully registered your guild! Please run the command again.',
				);
			return interaction.editReply({
				embeds: [embed1],
			});
		} else {
			const channel = interaction.options.getChannel('channel');
			if (channel.type !== 'GUILD_TEXT') {
				const embed1 = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						'<:Error:907325609334685756> | The channel you have selected is not a text channel.',
					);
				return interaction.editReply({ embeds: [embed1] });
			}
			const message = interaction.options.getString('message');
			data.welcomeChannel = channel.id;
			data.welcomeMessage = message;
			await data.save();
			const embed1 = new Discord.MessageEmbed()
				.setColor('#43b481')
				.setDescription(
					`<:Success:907325753698447400> | Successfully enabled welcome channel plugin in <#${channel.id}>`,
				);
			interaction.editReply({ embeds: [embed1] });
		}
	}
};
