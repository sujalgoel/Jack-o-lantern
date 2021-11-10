const currentGames = {};
const Discord = require('discord.js');
const Database = require('../../models/user');
const GuildDatabase = require('../../models/guild');
const Functions = require('../../structures/Functions');
const Command = require('../../structures/CommandClass');

module.exports = class RushforCandy extends Command {
	constructor(client) {
		super(client, {
			name: 'rushforcandy',
			type: 'CHAT_INPUT',
			usage: 'rushforcandy',
			category: 'Halloween',
			description: 'Rush to pick up the dropped candies.',
			cooldown: 10,
			defaultPermission: true,
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
				return interaction.editReply({
					embeds: [embed1],
				});
			}
			if (
				GuildData.lastRush &&
				86400000 - (Date.now() - GuildData.lastRush) > 0
			) {
				const embed1 = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						`<:Error:907325609334685756> | Someone recently started this event, come back after **${Functions.convertTime(
							86400000 - (Date.now() - GuildData.lastRush),
						)}**`,
					);
				return interaction.editReply({
					embeds: [embed1],
				});
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

			const candy = Math.floor(Math.random() * 10) + 2;
			const embed1 = new Discord.MessageEmbed()
				.setAuthor(
					`${client.user.username}'s Rush Candy?`,
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setColor('#f75f1c')
				.setDescription(
					`You saw someone tripping in the street and they dropped **${candy} candies**. 🍬 Click the button to pick them.`,
				)
				.setThumbnail(
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setFooter(
					`Requested by ${interaction.user.tag}`,
					interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.setTimestamp();
			const msg = await interaction.editReply({ embeds: [embed1] });

			currentGames[interaction.guild.id] = true;
			currentGames[`${interaction.guild.id}_channel`] = interaction.channel.id;

			setTimeout(async function() {
				const rows = [];
				const buttons = [];
				const gameCreatedAt = Date.now();

				for (let i = 0; i < 24; i++) {
					buttons.push(
						new Discord.MessageButton()
							.setDisabled(true)
							.setLabel('\u200b')
							.setStyle('PRIMARY')
							.setCustomId(Functions.getRandomString(20)),
					);
				}

				buttons.push(
					new Discord.MessageButton()
						.setStyle('PRIMARY')
						.setEmoji('🍬')
						.setCustomId('CORRECT'),
				);

				Functions.shuffleArray(buttons);

				for (let i = 0; i < 5; i++) {
					rows.push(new Discord.MessageActionRow());
				}

				rows.forEach((row, i) => {
					row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
				});

				await interaction.editReply({
					embeds: [embed1],
					components: rows,
				});

				const Collector = msg.createMessageComponentCollector({
					filter: (fn) => fn,
					time: 60000,
				});

				Collector.on('collect', async (button) => {
					if (button.customId === 'CORRECT') {
						const data = await Database.findOne({ _id: button.user.id });
						await button.deferUpdate();
						Collector.stop();
						buttons.forEach((element) => {
							element.setDisabled(true);
						});
						rows.length = 0;
						for (let i = 0; i < 5; i++) {
							rows.push(new Discord.MessageActionRow());
						}
						rows.forEach((row, i) => {
							row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
						});
						const embed2 = new Discord.MessageEmbed()
							.setAuthor(
								`${client.user.username}'s Rush Candy?`,
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							)
							.setDescription(
								`GG, <@${button.user.id}> picked **${candy} candies** 🍬 in **${
									(Date.now() - gameCreatedAt) / 1000
								} seconds** from the ground.`,
							)
							.setThumbnail(
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							)
							.setColor('#f75f1c')
							.setFooter(
								`Requested by ${interaction.user.tag}`,
								interaction.user.displayAvatarURL({
									dynamic: true,
									size: 2048,
								}),
							)
							.setTimestamp();

						if (!data) {
							await new Database({
								_id: button.user.id,
								candy: 100 + candy,
							}).save();
						} else {
							data.candy += candy;
							await data.save();
							GuildData.lastRush = Date.now();
							await GuildData.save();
						}
						await interaction.editReply({
							embeds: [embed2],
							components: rows,
						});
					}
					return delete currentGames[interaction.guild.id];
				});

				this.client.on('messageDelete', async (m) => {
					if(m.id === msg.id) {
						return Collector.stop();
					}
				});

				Collector.on('end', async (_msg, reason) => {
					if (reason === 'time') {
						buttons.forEach((element) => {
							element.setDisabled(true);
						});
						rows.length = 0;
						for (let i = 0; i < 5; i++) {
							rows.push(new Discord.MessageActionRow());
						}
						rows.forEach((row, i) => {
							row.addComponents(buttons.slice(0 + i * 5, 5 + i * 5));
						});
						const embed2 = new Discord.MessageEmbed()
							.setAuthor(
								`${client.user.username}'s Rush Candy?`,
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							)
							.setColor('#f75f1c')
							.setFooter(
								`Requested by ${interaction.user.tag}`,
								interaction.user.displayAvatarURL({
									dynamic: true,
									size: 2048,
								}),
							)
							.setThumbnail(
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							)
							.setDescription(
								'You all were too slow! The stranger left the street.',
							)
							.setTimestamp();
						await interaction.editReply({
							embeds: [embed2],
							components: rows,
						});
						return delete currentGames[interaction.guild.id];
					}
				});
			}, Math.floor(Math.random() * 5000) + 1000);
		} catch (e) {
			console.log(e);
		}
	}
};
