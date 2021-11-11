const currentGames = {};
const Discord = require('discord.js');
const Database = require('../../models/user');
const Functions = require('../../structures/Functions');
const Command = require('../../structures/CommandClass');

module.exports = class LickTheLock extends Command {
	constructor(client) {
		super(client, {
			name: 'lickthelock',
			type: 'CHAT_INPUT',
			usage: 'lickthelock',
			category: 'Halloween',
			description: 'Lick the lock or be the witch\'s prop.',
			cooldown: 3,
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

			const candy = Math.floor(Math.random() * 10) + 5;
			const licks = Math.floor(Math.random() * 20) + 20;

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

			const embed1 = new Discord.MessageEmbed()
				.setAuthor(
					`Help ${client.user.username} Escape`,
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setColor('#f75f1c')
				.setDescription(
					`A witch has taken hostage of ${client.user.username}, and he needs your help to escape. Would you like to help?`,
				)
				.setThumbnail(
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setFooter(
					`Requested by ${interaction.user.tag}`,
					interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.addField(
					'What do you have to do?',
					`The clock is ticking. In order to help ${client.user.username} escape, You will have to lick the lock atleast **1 time** in **3 seconds** to reset it and you have to do so **${licks} times**. You will be rewarded with **${candy} candies**. 🍬`,
				)
				.setTimestamp();

			const msg = await interaction.editReply({
				embeds: [embed1],
				components: [{ type: 1, components: [btn1, btn2] }],
			});

			const confirmCollector = msg.createMessageComponentCollector({
				filter: (fn) => fn,
				time: 60000,
			});

			confirmCollector.on('collect', async (confirmButton) => {
				if (confirmButton.user.id !== interaction.member.id) {
					return confirmButton.reply({
						content: `Only <@${interaction.member.id}> can use the buttons.`,
						ephemeral: true,
					});
				}
				await confirmButton.deferUpdate();
				confirmCollector.stop();
				if (confirmButton.customId === 'no') {
					delete currentGames[interaction.user.id];
					btn1.setStyle('SECONDARY').setDisabled(true);
					btn2.setDisabled(true);
					const embed2 = new Discord.MessageEmbed()
						.setAuthor(
							`Help ${client.user.username} Escape`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
						)
						.setColor('#f75f1c')
						.setDescription(
							`Wait!. What...? You choose not to save ${client.user.username}? As a punishment, you won't be able to play this game for the next 12 hours.`,
						)
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						)
						.setTimestamp();
					interaction.editReply({
						embeds: [embed2],
						components: [{ type: 1, components: [btn1, btn2] }],
					});
				} else if (confirmButton.customId === 'yes') {
					if (data.lastLick && 21600000 - (Date.now() - data.lastLick) > 0) {
						const embed2 = new Discord.MessageEmbed()
							.setColor('#f04947')
							.setDescription(
								`<:Error:907325609334685756> | You played this game recently, come back after **${Functions.convertTime(
									21600000 - (Date.now() - data.lastLick),
								)}**`,
							);
						delete currentGames[interaction.user.id];
						return interaction.editReply({
							embeds: [embed2],
							components: [{ type: 1, components: [btn1, btn2] }],
						});
					}
					let lick = 0;
					const gameCreatedAt = Date.now();

					const btn3 = new Discord.MessageButton()
						.setStyle('PRIMARY')
						.setLabel('Lick')
						.setEmoji('👅')
						.setCustomId('LICK');

					const embed2 = new Discord.MessageEmbed()
						.setAuthor(
							`Help ${client.user.username} Escape`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
						)
						.setColor('#f75f1c')
						.setDescription(
							`The clock is ticking. In order to help ${client.user.username} escape, You will have to lick the lock atleast **1 time** in **3 seconds** to reset it and you have to do so **${licks} times**. You will be rewarded with **${candy} candies**. 🍬`,
						)
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						)
						.addField('Total Licks/Remaining Licks', `${lick}/${licks}`)
						.setTimestamp();

					interaction.editReply({
						embeds: [embed2],
						components: [{ type: 1, components: [btn3] }],
					});

					const collector = msg.createMessageComponentCollector({
						filter: (fn) => fn,
						time: 4000,
					});

					collector.on('collect', async (button) => {
						if (button.user.id !== interaction.member.id) {
							return button.reply({
								content: `Only <@${interaction.member.id}> can use the buttons.`,
								ephemeral: true,
							});
						}
						lick++;
						await button.deferUpdate();
						if (lick >= licks) {
							delete currentGames[interaction.user.id];
							collector.stop();
							btn3.setDisabled(true);
							const embed3 = new Discord.MessageEmbed()
								.setAuthor(
									`Help ${client.user.username} Escape`,
									client.user.displayAvatarURL({ format: 'png', size: 2048 }),
								)
								.setColor('#f75f1c')
								.setDescription(
									`GG, You helped ${
										client.user.username
									} escape by licking the lock **${lick} times** in **${Functions.convertTime(
										Date.now() - gameCreatedAt,
									)}**. You have been rewarded with **${candy} candies**. 🍬`,
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
							data.lastLick = Date.now();
							await data.save();

							return interaction.editReply({
								embeds: [embed3],
								components: [{ type: 1, components: [btn3] }],
							});
						}

						const embed3 = new Discord.MessageEmbed()
							.setAuthor(
								`Help ${client.user.username} Escape`,
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							)
							.setColor('#f75f1c')
							.setDescription(
								`The clock is ticking. In order to help ${client.user.username} escape, You will have to lick the lock atleast **1 time** in **3 seconds** to reset it and you have to do so **${licks} times**. You will be rewarded with **${candy} candies**. 🍬`,
							)
							.setFooter(
								`Requested by ${interaction.user.tag}`,
								interaction.user.displayAvatarURL({
									dynamic: true,
									size: 2048,
								}),
							)
							.addField('Total Licks/Remaining Licks', `${lick}/${licks}`)
							.setTimestamp();

						interaction.editReply({
							embeds: [embed3],
							components: [{ type: 1, components: [btn3] }],
						});
						collector.resetTimer();
					});

					collector.on('end', async (collected, reason) => {
						if (reason === 'time') {
							delete currentGames[interaction.user.id];
							btn3.setDisabled(true);
							const reward = Math.ceil(lick / candy);
							const embed3 = new Discord.MessageEmbed()
								.setAuthor(
									`Help ${client.user.username} Escape`,
									client.user.displayAvatarURL({ format: 'png', size: 2048 }),
								)
								.setColor('#f75f1c')
								.setDescription(
									`Oh Shoot! Stop licking the lock. Witch came and took ${client.user.username} to some other place but don't worry. ${client.user.username} left **${reward} candies** 🍬 for you. Happy Halloween! 🎃`,
								)
								.setFooter(
									`Requested by ${interaction.user.tag}`,
									interaction.user.displayAvatarURL({
										dynamic: true,
										size: 2048,
									}),
								)
								.setTimestamp();
							data.candy += reward;
							data.lastLick = Date.now();
							await data.save();

							return interaction.editReply({
								embeds: [embed3],
								components: [{ type: 1, components: [btn3] }],
							});
						}
					});
				}
			});

			client.on('messageDelete', async (m) => {
				if (m.id === msg.id) {
					return confirmCollector.stop();
				}
			});

			confirmCollector.on('end', async (collected, reason) => {
				if (reason === 'time') {
					delete currentGames[interaction.user.id];
					btn1.setDisabled(true);
					btn2.setDisabled(true);
					interaction.editReply({
						embeds: [embed1],
						components: [{ type: 1, components: [btn1, btn2] }],
					});
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
};
