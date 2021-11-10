const axios = require('axios');
const Discord = require('discord.js');
const Command = require('../../structures/CommandClass');

module.exports = class HalloweenReddit extends Command {
	constructor(client) {
		super(client, {
			name: 'halloweenreddit',
			type: 'CHAT_INPUT',
			usage: 'halloweenreddit',
			category: 'Halloween',
			description: 'Get some posts from Halloween subreddit.',
			cooldown: 5,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		try {
			const data = await axios({
				method: 'get',
				url: 'https://api.sujalgoel.engineer/fun/reddit/halloween',
				headers: {
					Authorization: `Sujal ${process.env.API_KEY}`,
				},
				responseType: 'json',
			});

			const title = data.data.message.subreddit.title;
			const url = data.data.message.subreddit.postLink;
			const gallery = data.data.message.subreddit.gallery;

			if (gallery) {
				let page = 0;
				const embeds = [];
				const buttons = [];
				const images = data.data.message.subreddit.image;
				for (const image of images) {
					embeds.push(
						new Discord.MessageEmbed()
							.setAuthor(
								`${client.user.username}'s halloween reddit search'`,
								client.user.displayAvatarURL({ format: 'png', size: 2048 }),
								'https://reddit.com/r/halloween',
							)
							.setThumbnail(
								'https://www.redditinc.com/assets/images/site/reddit-logo.png',
							)
							.setTitle(`${title}`)
							.setURL(url)
							.setColor('#f75f1c')
							.setImage(image)
							.setTimestamp(),
					);
				}

				const btn1 = new Discord.MessageButton()
					.setStyle('PRIMARY')
					.setDisabled(true)
					.setEmoji('907312868360327219')
					.setCustomId('first');

				const btn2 = new Discord.MessageButton()
					.setStyle('PRIMARY')
					.setDisabled(true)
					.setEmoji('907304402820427777')
					.setCustomId('prev');

				const btn3 = new Discord.MessageButton()
					.setStyle('PRIMARY')
					.setEmoji('907304357651939348')
					.setCustomId('next');

				const btn4 = new Discord.MessageButton()
					.setStyle('PRIMARY')
					.setEmoji('907312958332342382')
					.setCustomId('last');

				buttons.push(btn1);
				buttons.push(btn2);
				buttons.push(btn3);
				buttons.push(btn4);

				const msg = await interaction.editReply({
					embeds: [
						embeds[page].setFooter(
							`Page: ${page + 1} | Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						),
					],
					components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
				});

				const collector = await msg.createMessageComponentCollector({
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
					switch (button.customId) {
					case buttons[0].customId:
						page = 0;
						buttons[0].setDisabled(true);
						buttons[1].setDisabled(true);
						buttons[2].setDisabled(false);
						buttons[3].setDisabled(false);
						break;
					case buttons[1].customId:
						page = --page;
						if (page === 0) {
							buttons[0].setDisabled(true);
							buttons[1].setDisabled(true);
							buttons[2].setDisabled(false);
							buttons[3].setDisabled(false);
						} else {
							buttons[0].setDisabled(false);
							buttons[1].setDisabled(false);
							buttons[2].setDisabled(false);
							buttons[3].setDisabled(false);
						}
						break;
					case buttons[2].customId:
						page = ++page;
						if (page === embeds.length - 1) {
							buttons[0].setDisabled(false);
							buttons[1].setDisabled(false);
							buttons[2].setDisabled(true);
							buttons[3].setDisabled(true);
						} else {
							buttons[0].setDisabled(false);
							buttons[1].setDisabled(false);
							buttons[2].setDisabled(false);
							buttons[3].setDisabled(false);
						}
						break;
					case buttons[3].customId:
						page = embeds.length - 1;
						buttons[0].setDisabled(false);
						buttons[1].setDisabled(false);
						buttons[2].setDisabled(true);
						buttons[3].setDisabled(true);
						break;
					}
					await button.deferUpdate();
					await interaction.editReply({
						embeds: [
							embeds[page].setFooter(
								`Page: ${page + 1} | Requested by ${interaction.user.tag}`,
								interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
							),
						],
						components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
					});
					collector.resetTimer();
				});

				this.client.on('messageDelete', async (m) => {
					if(m.id === msg.id) {
						return collector.stop();
					}
				});

				collector.on('end', async (m, reason) => {
					if(reason === 'time') {
						buttons[0].setDisabled(true),
						buttons[1].setDisabled(true),
						buttons[2].setDisabled(true),
						buttons[3].setDisabled(true);
						await interaction.editReply({
							embeds: [
								embeds[page].setFooter(
									`Page: ${page + 1} | Requested by ${interaction.user.tag}`,
									interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
								),
							],
							components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
						});
					}
				});
			} else {
				const image = data.data.message.subreddit.image;
				if (image) {
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							`${client.user.username}'s halloween reddit search'`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							'https://reddit.com/r/halloween',
						)
						.setThumbnail(
							'https://www.redditinc.com/assets/images/site/reddit-logo.png',
						)
						.setTitle(`${title}`)
						.setURL(url)
						.setColor('#f75f1c')
						.setImage(image)
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						)
						.setTimestamp();
					await interaction.editReply({ embeds: [embed] });
				} else {
					const embed = new Discord.MessageEmbed()
						.setAuthor(
							`${client.user.username}'s halloween reddit search'`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
							'https://reddit.com/r/halloween',
						)
						.setThumbnail(
							'https://www.redditinc.com/assets/images/site/reddit-logo.png',
						)
						.setTitle(`${title}`)
						.setURL(url)
						.setColor('#f75f1c')
						.setDescription('There is no image to this post. Would you like to view it on reddit?')
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
						)
						.setTimestamp();

					const btn1 = new Discord.MessageButton()
						.setStyle('LINK')
						.setEmoji('907651239796441099')
						.setURL(url)
						.setLabel('Reddit Link');

					interaction.editReply({
						embeds: [embed],
						components: [{ type: 1, components: [btn1] }],
					});
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
};
