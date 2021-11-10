const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const Command = require('../../structures/CommandClass');

module.exports = class Ping extends Command {
	constructor(client) {
		super(client, {
			name: 'play',
			type: 'CHAT_INPUT',
			usage: 'play',
			category: 'Sound',
			description: 'Plays some spooky sound.',
			cooldown: 10,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		try {
			const channel = interaction.member.voice.channel;
			if (!channel) {
				const embed1 = new Discord.MessageEmbed()
					.setColor('#f04947')
					.setDescription(
						'<:Error:907325609334685756> | Please connect to a voice channel to use this command.',
					);
				return interaction.editReply({ embeds: [embed1] });
			}
			const sounds = [
				'chainsaw',
				'creaky-door',
				'entrance',
				'ghost',
				'howlin-wolf',
				'thunder',
				'welcome',
				'wind',
			];
			const sound = sounds[Math.floor(Math.random() * sounds.length)];
			const player = DiscordVoice.createAudioPlayer();
			const resource = DiscordVoice.createAudioResource(
				`./assets/sounds/${sound}.wav`,
			);
			const connection = DiscordVoice.joinVoiceChannel({
				channelId: interaction.member.voice.channel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			player.play(resource);
			connection.subscribe(player);
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
					`${client.user.username}'s Spooky Sounds`,
					client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setColor('#f75f1c')
				.setDescription('You got scared by it. Weren\'t you?')
				.setFooter(
					`Requested by ${interaction.user.tag}`,
					interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.setTimestamp();

			const msg = await interaction.editReply({
				embeds: [embed1],
				components: [{ type: 1, components: [btn1, btn2] }],
			});

			player.on(DiscordVoice.AudioPlayerStatus.Idle, async () => {
				connection.destroy();
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
					embed1.setDescription('Yay! I knew it.');
					interaction.editReply({
						embeds: [embed1],
						components: [{ type: 1, components: [btn1, btn2] }],
					});
				} else {
					btn1.setStyle('SECONDARY').setDisabled(true);
					btn2.setDisabled(true);
					embed1.setDescription('Then, you wanna it try again?');
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
