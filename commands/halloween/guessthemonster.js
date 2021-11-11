const currentGames = {};
const axios = require('axios');
const Discord = require('discord.js');
const Database = require('../../models/user');
const GuildDatabase = require('../../models/guild');
const Functions = require('../../structures/Functions');
const Command = require('../../structures/CommandClass');
const Monsters = require('../../assets/json/monsters.json');

module.exports = class GuessTheMonster extends Command {
	constructor(client) {
		super(client, {
			name: 'guessthemonster',
			type: 'CHAT_INPUT',
			usage: 'guessthemonster',
			category: 'Halloween',
			description: 'Guess the monster with it\'s image.',
			cooldown: 10,
		});
	}

	async run(client, interaction) {
		try {
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
			const GuildData = await GuildDatabase.findOne({
				_id: interaction.guild.id,
			});
			if (!GuildData) {
				await new GuildDatabase({ _id: interaction.guild.id }).save();
				const embed1 = new Discord.MessageEmbed()
					.setColor('#43b481')
					.setDescription(
						'<:Success:907325753698447400> | Successfully registered your guild! Please run the command again.',
					);
				return interaction.editReply({ embeds: [embed1] });
			}
			if (
				GuildData.lastGuess &&
				86400000 - (Date.now() - GuildData.lastGuess) > 0
			) {
				const embed1 = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						`<:Error:907325609334685756> | Someone recently started this event, come back after **${Functions.convertTime(
							86400000 - (Date.now() - GuildData.lastGuess),
						)}**`,
					);
				return interaction.editReply({ embeds: [embed1] });
			}
			if (currentGames[interaction.guild.id]) {
				const embed1 = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						`<:Error:907325609334685756> | This event is already runnning in <#${
							currentGames[`${interaction.guild.id}_channel`]
						}>. You can't start a new one.`,
					);
				return interaction.editReply({ embeds: [embed1] });
			}

			const participants = [];
			const candy = Math.floor(Math.random() * 10) + 5;
			const monster = Monsters[Math.floor(Math.random() * Monsters.length)];
			const data = await axios({
				method: 'get',
				url: `https://cdn.sujalgoel.engineer/images/discord-monster/${monster}.png`,
				responseType: 'arraybuffer',
			});

			const btn1 = new Discord.MessageButton()
				.setStyle('DANGER')
				.setLabel('Cancel')
				.setEmoji('🛑')
				.setCustomId('CANCEL');

			const attachment = new Discord.MessageAttachment(
				data.data,
				'monster.png',
			);
			const embed1 = new Discord.MessageEmbed()
				.setAuthor(
					`Guess ${client.user.username}'s Monsters`,
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setColor('#f75f1c')
				.setDescription(
					`You only have **1 minute** to guess the monster. The winner will be rewarded with **${candy} candies**. 🍬`,
				)
				.setImage('attachment://monster.png')
				.setFooter(
					`Requested by ${interaction.user.tag}`,
					interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.setTimestamp();

			const msg = await interaction.editReply({
				embeds: [embed1],
				files: [attachment],
				components: [{ type: 1, components: [btn1] }],
			});

			const gameCreatedAt = Date.now();
			const collector = await interaction.channel.createMessageCollector({
				filter: (m) => !m.author.bot,
				time: 60000,
			});

			currentGames[interaction.guild.id] = true;
			currentGames[`${interaction.guild.id}_channel`] = interaction.channel.id;

			collector.on('collect', async (m) => {
				if (!participants.includes(m.author.id)) {
					participants.push(m.author.id);
				}
				if (m.content.toLowerCase() === monster.toLowerCase()) {
					const UserData = await Database.findOne({ _id: m.author.id });
					const time = Functions.convertTime(Date.now() - gameCreatedAt);
					const embed2 = new Discord.MessageEmbed()
						.setAuthor(
							`Guess ${client.user.username}'s Monsters`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
						)
						.setColor('#f75f1c')
						.setDescription(
							`GG, It was **${monster}**. <@${
								m.author.id
							}> got it correct in **${time}** and they have been rewarded with **${candy} candies**. 🍬\n\n__**Stats of the game:**__\n**Duration**: ${time}\n**Number of participants**: ${
								participants.length
							} Participants\n**Participants**: ${participants
								.map((p) => '<@' + p + '>')
								.join(', ')}.`,
						)
						.setImage('attachment://monster.png')
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						)
						.setTimestamp();
					m.reply({ embeds: [embed2], files: [attachment] });
					if (!UserData) {
						await new Database({
							_id: m.author.id,
							candy: 100 + candy,
						}).save();
					} else {
						UserData.candy += candy;
						await UserData.save();
						GuildData.lastGuess = Date.now();
						await GuildData.save();
					}
					btn1.setDisabled(true);
					await interaction.editReply({
						embeds: [embed1],
						files: [attachment],
						components: [{ type: 1, components: [btn1] }],
					});
					collector.stop();
					return delete currentGames[interaction.guild.id];
				} else {
					const embed2 = new Discord.MessageEmbed()
						.setColor('#f04947')
						.setDescription(
							`<:Error:907325609334685756> | The monster isn't **\`${m.content}\`**.`,
						);
					m.reply({ embeds: [embed2] });
				}
			});

			const gameCollector = msg.createMessageComponentCollector({
				filter: (fn) => fn,
			});

			gameCollector.on('collect', async (button) => {
				if (button.user.id !== interaction.member.id) {
					return button.reply({
						content: `Only <@${interaction.member.id}> can use the buttons.`,
						ephemeral: true,
					});
				}

				await button.deferUpdate();
				btn1.setDisabled(true);
				gameCollector.stop();
				collector.stop();
				interaction.editReply({
					embeds: [embed1],
					files: [attachment],
					components: [{ type: 1, components: [btn1] }],
				});
				const embed2 = new Discord.MessageEmbed()
					.setAuthor(
						`Guess ${client.user.username}'s Monsters`,
						client.user.displayAvatarURL({ format: 'png', size: 2048 }),
					)
					.setColor('#f75f1c')
					.setDescription(`Better luck next time! It was **${monster}**.`)
					.setImage('attachment://monster.png')
					.setFooter(
						`Requested by ${interaction.user.tag}`,
						interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
					)
					.setTimestamp();
				msg.reply({
					embeds: [embed2],
					files: [attachment],
				});
				return delete currentGames[interaction.guild.id];
			});

			client.on('messageDelete', async (m) => {
				if (m.id === msg.id) {
					return collector.stop();
				}
			});

			collector.on('end', async (m, reason) => {
				if (reason === 'time') {
					btn1.setDisabled(true);
					gameCollector.stop();
					collector.stop();
					interaction.editReply({
						embeds: [embed1],
						files: [attachment],
						components: [{ type: 1, components: [btn1] }],
					});
					await GuildData.save();
					const embed2 = new Discord.MessageEmbed()
						.setAuthor(
							`Guess ${client.user.username}'s Monsters`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
						)
						.setColor('#f75f1c')
						.setDescription(`Better luck next time! It was **${monster}**.`)
						.setImage('attachment://monster.png')
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						)
						.setTimestamp();
					msg.reply({
						embeds: [embed2],
						files: [attachment],
					});
					return delete currentGames[interaction.guild.id];
				}
			});
		} catch (e) {
			console.log(e);
		}
	}
};
