const cmdCooldown = {};
const cntxtCooldown = {};
const Discord = require('discord.js');
const Event = require('../../structures/EventClass');
const Functions = require('../../structures/Functions');

module.exports = class InteractionCreate extends Event {
	constructor(client) {
		super(client, {
			name: 'interactionCreate',
		});
	}
	async run(interaction) {
		const client = this.client;

		switch (true) {
		case interaction.isCommand(): {
			if (interaction.user.bot) {
				const embed = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						'<:Error:907325609334685756> | Bots aren\'t allowed to use slash commands.',
					);
				return interaction.reply({ embeds: [embed] });
			}
			if (interaction.channel.type === 'dm') {
				const embed = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						'<:Error:907325609334685756> | Slash commands are only available in guild.',
					);
				return interaction.reply({ embeds: [embed] });
			}
			const command = client.commands.get(interaction.commandName);
			if (!command) return;
			try {
				await interaction.deferReply();
				let uCooldown = cmdCooldown[interaction.user.id];
				if (!uCooldown) {
					cmdCooldown[interaction.user.id] = {};
					uCooldown = cmdCooldown[interaction.user.id];
				}
				const time = uCooldown[interaction.commandName] || 0;
				if (time && time > Date.now()) {
					const embed = new Discord.MessageEmbed()
						.setColor('#f04947')
						.setDescription(
							`<:Error:907325609334685756> | You must wait **${Functions.convertTime(
								Math.ceil(time - Date.now()),
							)}** to be able to run the command again.`,
						);
					return interaction.editReply({ embeds: [embed] });
				}
				cmdCooldown[interaction.user.id][interaction.commandName] =
						Date.now() + 1000 * command.cooldown;
				command.run(client, interaction);
			} catch (e) {
				console.log(e);
			}
			break;
		}
		case interaction.isContextMenu(): {
			if (interaction.user.bot) {
				const embed = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						'<:Error:907325609334685756> | Bots aren\'t allowed to use context commands.',
					);
				return interaction.reply({ embeds: [embed] });
			}
			if (interaction.channel.type === 'dm') {
				const embed = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						'<:Error:907325609334685756> | Context commands are only available in guild.',
					);
				return interaction.reply({ embeds: [embed] });
			}
			const command = client.commands.get(interaction.commandName);
			if (!command) return;
			try {
				await interaction.deferReply();
				let uCooldown = cntxtCooldown[interaction.user.id];
				if (!uCooldown) {
					cntxtCooldown[interaction.user.id] = {};
					uCooldown = cntxtCooldown[interaction.user.id];
				}
				const time = uCooldown[interaction.commandName] || 0;
				if (time && time > Date.now()) {
					const embed = new Discord.MessageEmbed()
						.setColor('#f04947')
						.setDescription(
							`<:Error:907325609334685756> | You must wait **${Functions.convertTime(
								Math.ceil(time - Date.now()),
							)}** to be able to run the command again.`,
						);
					return interaction.editReply({ embeds: [embed] });
				}
				cntxtCooldown[interaction.user.id][interaction.commandName] =
						Date.now() + 1000 * command.cooldown;
				command.run(client, interaction);
			} catch (e) {
				console.log(e);
			}
			break;
		}
		}
	}
};
