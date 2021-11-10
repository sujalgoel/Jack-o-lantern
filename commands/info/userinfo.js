const qs = require('qs');
const axios = require('axios');
const Discord = require('discord.js');
const Command = require('../../structures/CommandClass');

module.exports = class UserInfoCmd extends Command {
	constructor(client) {
		super(client, {
			name: 'userinfo',
			type: 'CHAT_INPUT',
			options: [
				{
					name: 'user',
					description: 'The user to get information of.',
					type: 6,
				},
			],
			usage: 'userinfo',
			category: 'Info',
			description: 'Get information about a user. (spotify card supported)',
			cooldown: 3,
			defaultPermission: true,
		});
	}

	async run(client, interaction) {
		try {
			const details = [];
			const spotify = { spotify: null, active: false };
			const memberId = interaction.options.getUser('user') ? interaction.options.getUser('user').id : interaction.user.id;
			const member = interaction.guild.members.cache.get(memberId);

			let activities = member.presence.activities;

			if (activities.length > 0) {
				for (let i = 0; i < activities.length; i++) {
					if (activities[i].id === 'custom') {
						details.push(`**Custom Activity:** ${activities[i].state}`);
					} else if (activities[i].name.toLowerCase() == 'spotify') {
						spotify.spotify = activities[i];
						spotify.active = true;
						activities = activities.filter(
							(activity) => activity.name.toLowerCase() !== 'spotify',
						);
					} else {
						details.push(activities[i].details);
					}
				}
			}

			const permissions = member.permissions.toArray().map((perm) => {
				return perm
					.toLowerCase()
					.replace(/_/g, ' ')
					.replace(/\w\S*/g, (txt) => {
						return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
					});
			});

			const embed = new Discord.MessageEmbed()
				.setAuthor(
					`${member.user.username}'s Info`,
					member.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.setDescription(`<@${member.user.id}>`)
				.setThumbnail(
					member.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.addFields(
					{
						name: 'Account Info',
						value: `
			                    **❯ Bot:** ${member.user.bot ? 'Yes' : 'No'}
			                    **❯ ID:** ${member.user.id}
			                    **❯ Created:** <t:${Math.floor(
		member.user.createdTimestamp / 1000,
	)}:F>`,
						inline: false,
					},
					{
						name: 'Member Info',
						value: `
			                    **❯ Nickname:** ${member.nickname || 'None'}
								**❯ Hoist Role:** ${member.roles.hoist ? member.roles.hoist.name : 'None'}
			                    **❯ Joined Server:** <t:${Math.floor(
		member.joinedTimestamp / 1000,
	)}:F>`,
						inline: false,
					},
					{
						name: `Roles [${member.roles.cache.size - 1}]`,
						value: member.roles.cache.size
							? member.roles.cache
								.map((roles) => `**${roles}**`)
								.slice(0, -1)
								.join(' ')
							: 'None',
						inline: false,
					},
					{
						name: 'Permissions',
						value: permissions.join(', '),
						inline: false,
					},
				)
				.setTimestamp()
				.setFooter(
					`Requested by ${interaction.user.tag}`,
					member.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				);
			if (details[0]) {
				embed.addField(
					'Activity',
					`**❯** ${details
						.sort((a, b) => a.length - b.length)
						.join('\n**❯** ')}`,
					false,
				);
			}
			if (spotify.active) {
				const songName = spotify.spotify.details;
				const artistName = spotify.spotify.state;
				const endTime = spotify.spotify.timestamps.end;
				const albumName = spotify.spotify.assets.largeText;
				const startTime = spotify.spotify.timestamps.start;
				const largeImage = spotify.spotify.assets.largeImage;
				const data = await axios({
					method: 'post',
					url: 'https://api.sujalgoel.engineer/card/spotify',
					data: qs.stringify({
						largeImage: largeImage,
						songName: songName,
						artistName: artistName,
						albumName: albumName,
						startTime: startTime,
						endTime: endTime,
					}),
					headers: {
						Authorization: `Sujal ${process.env.API_KEY}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					responseType: 'json',
				});
				embed.setColor(data.data.data.color);
				embed.setImage('attachment://spotify-card.png');
				const attachment = new Discord.MessageAttachment(
					Buffer.from(data.data.data.image.split(',')[1], 'base64'),
					'spotify-card.png',
				);
				return interaction.editReply({ embeds: [embed], files: [attachment] });
			} else {
				embed.setColor('#f75f1c');
				return interaction.editReply({ embeds: [embed] });
			}
		} catch (e) {
			console.log(e);
		}
	}
};
