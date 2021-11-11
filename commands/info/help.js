const Discord = require('discord.js');
const Command = require('../../structures/CommandClass');

module.exports = class Help extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			type: 'CHAT_INPUT',
			options: [
				{
					name: 'command',
					description: 'Stop it. Get some specific commmand help.',
					type: 'STRING',
					required: false,
				},
			],
			usage: 'help',
			category: 'Info',
			description: 'Stop it. Get some help.',
			cooldown: 5,
		});
	}

	async run(client, interaction) {
		const query = interaction.options.getString('command');

		if (query) {
			const command = client.commands.get(query);
			if (command) {
				const embed = new Discord.MessageEmbed()
					.setAuthor(
						`Information for "${command.name}" command`,
						client.user.displayAvatarURL({ format: 'png', size: 2048 }),
					)
					.setColor('#f75f1c')
					.setTimestamp()
					.setThumbnail(
						client.user.displayAvatarURL({ format: 'png', size: 2048 }),
					)
					.setDescription(
						`**❯ Name:** \`${command.name}\`
					**❯ Category:** \`${command.category}\`
					**❯ Usage:** \`${command.contextDescription ? 'Right-Click > Apps > ' : '/'}${
	command.usage
}\`
					**❯ Description:** \`${
	command.contextDescription
		? command.contextDescription
		: command.description
}\``,
					)
					.setFooter(
						'Syntax: <> = required, [] = optional',
						`${client.user.displayAvatarURL({ format: 'png', size: 2048 })}`,
					);
				return interaction.editReply({ embeds: [embed] });
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						'<:Error:907325609334685756> | Command not found! Try again with a valid command.',
					);
				return interaction.editReply({ embeds: [embed] });
			}
		} else {
			let page = 0;
			const embeds = [];
			const buttons = [];
			let field = '**`#1` -** This page\n';
			let categories;
			if (client.commands) {
				categories = [
					...new Set(client.commands.map((command) => command.category)),
				];
			} else {
				categories = [];
			}
			for (let i = 0; i < categories.length; i++) {
				field += `**\`#${i + 2}\` -** ${categories[i]}\n`;
			}
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					`${client.user.username}'s Help Menu`,
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setThumbnail(
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setTitle('Help')
				.setTimestamp()
				.setImage('https://i.sujalgoel.engineer/yxkqsVfC.png')
				.setColor('#f75f1c')
				.setDescription(
					'My prefix is `/` \nFor more info on a specific command, type `/help <command>`',
				)
				.addField(
					'Note',
					'User Info command now supports [Spotify Card](https://imgur.com/a/XKx0jeH).',
				)
				.addField('Pages', field);
			embeds.push(embed);
			for (const category of categories) {
				const cmds = client.commands.filter(
					(command) => command.category === category,
				);
				const commands = [];
				commands.push(
					cmds.map(
						(cmd) =>
							`${cmd.name} ~ ${
								cmd.description ? cmd.description : cmd.contextDescription
							}`,
					),
				);

				const emds = [];

				for (let i = 0; i < commands.length; i++) {
					const emd = new Discord.MessageEmbed()
						.setAuthor(
							`${client.user.username}'s Help Menu`,
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
						)
						.setThumbnail(
							client.user.displayAvatarURL({ format: 'png', size: 2048 }),
						)
						.setFooter(
							`Requested by ${interaction.user.tag}`,
							interaction.user.displayAvatarURL({
								dynamic: true,
								size: 2048,
							}),
						)
						.setImage('https://i.sujalgoel.engineer/yxkqsVfC.png')
						.setTitle(`Help - ${category}`)
						.setColor('#f75f1c')
						.setTimestamp();
					let description = '';
					for (let j = 0; j < commands[i].length; j++) {
						description += `**[${commands[i][j]
							.split('~')[0]
							.trim()}](https://jack-o-lantern.sujalgoel.engineer/)**\n<:reply:879436354918961192> ${commands[
							i
						][j]
							.split('~')[1]
							.trim()}\n`;
					}
					emd.setDescription(description);
					emds.push(emd);
				}
				for (let i = 0; i < emds.length; i++) {
					embeds.push(emds[i]);
				}
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
				time: 30000,
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

			client.on('messageDelete', async (m) => {
				if (m.id === msg.id) {
					return collector.stop();
				}
			});

			collector.on('end', async (m, reason) => {
				if (reason === 'time') {
					buttons[0].setDisabled(true),
					buttons[1].setDisabled(true),
					buttons[2].setDisabled(true),
					buttons[3].setDisabled(true);
					await interaction.editReply({
						embeds: [
							embeds[page].setFooter(
								`Page: ${page + 1} | Requested by ${interaction.user.tag}`,
								interaction.user.displayAvatarURL({
									dynamic: true,
									size: 2048,
								}),
							),
						],
						components: [{ type: 1, components: [btn1, btn2, btn3, btn4] }],
					});
				}
			});
		}
	}
};
