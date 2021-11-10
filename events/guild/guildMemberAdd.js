const axios = require('axios');
const Discord = require('discord.js');
const GuildDatabase = require('../../models/guild');
const Event = require('../../structures/EventClass');

module.exports = class InteractionCreate extends Event {
	constructor(client) {
		super(client, {
			name: 'guildMemberAdd',
		});
	}
	async run(member) {
		await member.guild.members.fetch();
		const guild = await GuildDatabase.findOne({ _id: member.guild.id });
		if (!guild) return;
		if (guild.welcomeChannel) {
			const channel = member.guild.channels.cache.get(guild.welcomeChannel);
			if (!channel) return;
			const data = await axios({
				method: 'get',
				url: `https://api.sujalgoel.engineer/card/welcome?image=${member.user.displayAvatarURL(
					{ format: 'png', size: 2048 },
				)}&memberCount=${member.guild.memberCount}&username=${
					member.user.username
				}&id=${member.user.id}&guildName=${member.guild.name}`,
				headers: {
					Authorization: `Sujal ${process.env.API_KEY}`,
				},
				responseType: 'json',
			});
			const attachment = new Discord.MessageAttachment(
				Buffer.from(data.data.data.image.split(',')[1], 'base64'),
				'welcome-card.png',
			);
			const embed = new Discord.MessageEmbed()
				.setAuthor(
					`Welcome ${member.user.username}`,
					member.user.displayAvatarURL({ dynamic: true, size: 2048 }),
				)
				.setColor('#f75f1c')
				.setDescription(
					guild.welcomeMessage
						.replace(/{user}/g, member.user.tag)
						.replace(/{guild}/g, member.guild.name)
						.replace(/{username}/g, member.user.username)
						.replace(/{mention}/g, member.user.toString()),
				)
				.setThumbnail('https://i.imgur.com/rZiJJwZ.gif')
				.setImage('attachment://welcome-card.png')
				.setFooter(
					`${this.client.user.username} welcomes ${member.user.username}`,
					this.client.user.displayAvatarURL({ format: 'png', size: 2048 }),
				)
				.setTimestamp();
			channel.send({ embeds: [embed], files: [attachment] });
		}
	}
};
