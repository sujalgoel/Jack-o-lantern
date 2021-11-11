const Discord = require('discord.js');
const Database = require('../../models/user');
const Command = require('../../structures/CommandClass');

module.exports = class Balance extends Command {
	constructor(client) {
		super(client, {
			name: 'balance',
			type: 'CHAT_INPUT',
			options: [
				{
					name: 'user',
					description: 'The user to get the balance of.',
					type: 6,
				},
			],
			usage: 'balance',
			category: 'Info',
			description: 'Check the candy of a user.',
			cooldown: 3,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		const member = interaction.options.getUser('user')
			? interaction.options.getUser('user').id
			: interaction.user.id;

		const data = await Database.findOne({ _id: member });
		if (!data) {
			const embed = new Discord.MessageEmbed()
				.setColor('#f04947')
				.setDescription(
					`<:Error:907325609334685756> | ${member === interaction.user.id ? 'You aren\'t registered.' : 'This user isn\'t registered.'}`,
				);
			return interaction.editReply({ embeds: [embed] });
		}
		let description = '';
		if (member === interaction.user.id) {
			description = `Good Job! You racked up **${data.candy} candies**. 🍬`;
		} else {
			description = `${
				interaction.options.getUser('user').username
			} racked up **${data.candy} candies**. 🍬`;
		}
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				`${client.user.username}'s Notification`,
				client.user.displayAvatarURL({ format: 'png', size: 2048 }),
			)
			.setColor('#f75f1c')
			.setDescription(description)
			.setFooter(
				`Requested by ${interaction.user.tag}`,
				interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
			)
			.setTimestamp();
		interaction.editReply({ embeds: [embed] });
	}
};
