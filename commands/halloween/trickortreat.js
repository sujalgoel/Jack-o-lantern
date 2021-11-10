const currentGames = {};
const Discord = require('discord.js');
const Database = require('../../models/user');
const Functions = require('../../structures/Functions');
const Command = require('../../structures/CommandClass');

module.exports = class TrickorTreat extends Command {
	constructor(client) {
		super(client, {
			name: 'trickortreat',
			type: 'CHAT_INPUT',
			usage: 'trickortreat',
			category: 'Halloween',
			description: 'You already know what I mean. Don\'t you?',
			cooldown: 10,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		try {
			const data = await Database.findOne({ _id: interaction.user.id });
			if (!data) {
				const embed1 = new Discord.MessageEmbed()
					.setAuthor(
						`${client.user.username}'s Notification`,
						client.user.displayAvatarURL({ format: 'png', size: 2048 }),
					)
					.setColor('#f75f1c')
					.setDescription(
						'You are requested to register yourself using **`/register`** command to get 100 candies. 🍬',
					)
					.setFooter(
						`Requested by ${interaction.user.tag}`,
						interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
					)
					.setTimestamp();
				return interaction.editReply({ embeds: [embed1] });
			}
			if (currentGames[interaction.user.id]) {
				const embed2 = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						`<:Error:907325609334685756> | You already have this game running in <#${
							currentGames[`${interaction.user.id}_channel`]
						}>. You can't start a new one.`,
					);
				return interaction.editReply({ embeds: [embed2] });
			}

			currentGames[interaction.user.id] = true;
			currentGames[`${interaction.user.id}_channel`] = interaction.channel.id;

			const embed1 = new Discord.MessageEmbed()
				.setAuthor(
					`${client.user.username}'s Trick or Treat?`,
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setColor('#f75f1c')
				.setDescription(
					'Are you ready to visit a random house in your neighbourhood? They will either treat you with some candies or trick you to lose some.',
				)
				.setThumbnail(
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setFooter(
					`Requested by ${interaction.user.tag}`,
					interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.setTimestamp();

			const btn1 = new Discord.MessageButton()
				.setStyle('SUCCESS')
				.setLabel('Yes')
				.setEmoji('✔️')
				.setCustomId('yes');

			const btn2 = new Discord.MessageButton()
				.setStyle('DANGER')
				.setLabel('No')
				.setEmoji('✖️')
				.setCustomId('no');

			const msg = await interaction.editReply({
				embeds: [embed1],
				components: [{ type: 1, components: [btn1, btn2] }],
			});

			const collector = msg.createMessageComponentCollector({
				filter: (fn) => fn,
				time: 60000,
			});

			collector.on('collect', async (button) => {
				if (button.user.id !== interaction.member.id) {
					return button.reply({
						content: `Only <@${interaction.member.id}> can use the buttons.`,
						ephemeral: true,
					});
				}

				await button.deferUpdate();

				if (button.customId === 'yes') {
					btn1.setDisabled(true);
					btn2.setStyle('SECONDARY').setDisabled(true);

					if (data.lastCandy && 21600000 - (Date.now() - data.lastCandy) > 0) {
						const embed2 = new Discord.MessageEmbed()
							.setColor('#f04947')
							.setDescription(
								`<:Error:907325609334685756> | You played this game recently, come back after **${Functions.convertTime(
									21600000 - (Date.now() - data.lastCandy),
								)}**`,
							);
						delete currentGames[interaction.user.id];
						return interaction.editReply({
							embeds: [embed2],
							components: [{ type: 1, components: [btn1, btn2] }],
						});
					}
					if (data.candy < 20) {
						const embed2 = new Discord.MessageEmbed()
							.setColor('#f04947')
							.setDescription(
								`<:Error:907325609334685756> | You don't have enough candies to play this game! You need **${
									20 - data.candy
								} more ${20 - data.candy > 1 ? 'candies' : 'candy'}**. 🍬`,
							);
						delete currentGames[interaction.user.id];
						return interaction.editReply({
							embeds: [embed2],
							components: [{ type: 1, components: [btn1, btn2] }],
						});
					}
					const possibility = Math.random() >= 0.3;
					const candy = Math.floor(Math.random() * 10) + 2;
					if (possibility) {
						const embed2 = new Discord.MessageEmbed()
							.setAuthor(
								'It\'s Sweet! You got some candies.',
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							)
							.setColor('#f75f1c')
							.setDescription(
								`You have been treated with **${candy} candies**. You now have **${
									data.candy + candy
								} candies**. 🍬`,
							)
							.setFooter(
								`Requested by ${interaction.user.tag}`,
								interaction.user.displayAvatarURL({
									dynamic: true,
									size: 2048,
								}),
							)
							.setTimestamp();
						data.candy += candy;
						data.lastCandy = Date.now();
						await data.save();
						delete currentGames[interaction.user.id];
						return interaction.editReply({
							embeds: [embed2],
							components: [{ type: 1, components: [btn1, btn2] }],
						});
					} else {
						const embed2 = new Discord.MessageEmbed()
							.setAuthor(
								'Oh no! You have been tricked.',
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							)
							.setColor('#f75f1c')
							.setDescription(
								`You have been tricked to give them **${candy} candies**. You now have **${
									data.candy - candy
								} candies** left. 🍬`,
							)
							.setFooter(
								`Requested by ${interaction.user.tag}`,
								interaction.user.displayAvatarURL({
									dynamic: true,
									size: 2048,
								}),
							)
							.setTimestamp();
						if (data.candy - candy < 0) {
							data.candy = 0;
						} else {
							data.candy -= candy;
						}
						data.lastCandy = Date.now();
						await data.save();
						delete currentGames[interaction.user.id];
						return interaction.editReply({
							embeds: [embed2],
							components: [{ type: 1, components: [btn1, btn2] }],
						});
					}
				} else {
					const embed2 = new Discord.MessageEmbed()
						.setAuthor(
							`${client.user.username}'s Trick or Treat?`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
						)
						.setColor('#f75f1c')
						.setDescription(
							'Okay! I got that you are a scaredy-cat. I got it now.',
						)
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						)
						.setTimestamp();
					btn1.setStyle('SECONDARY').setDisabled(true);
					btn2.setDisabled(true);
					interaction.editReply({
						embeds: [embed2],
						components: [{ type: 1, components: [btn1, btn2] }],
					});
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
};
