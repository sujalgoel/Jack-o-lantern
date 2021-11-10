const Discord = require('discord.js');
const Database = require('../../models/user');
const Command = require('../../structures/CommandClass');

module.exports = class Register extends Command {
	constructor(client) {
		super(client, {
			name: 'register',
			type: 'CHAT_INPUT',
			usage: 'register',
			category: 'Info',
			description: 'Register your profile in our database.',
			cooldown: 10,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		const data = await Database.findOne({ _id: interaction.user.id });
		if(!data) {
			await new Database({
				_id: interaction.user.id,
				candy: 100,
			}).save();
			const embed = new Discord.MessageEmbed()
				.setColor('#43b481')
				.setDescription(
					'<:Success:907325753698447400> | Successfully registered your account and rewarded you **100 candies**. 🍬',
				);
			interaction.editReply({ embeds: [embed] });
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor('#f04947')
				.setDescription(
					'<:Error:907325609334685756> | Your account is already registered.',
				);
			interaction.editReply({ embeds: [embed] });
		}
	}
};
