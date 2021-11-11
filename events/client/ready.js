/* eslint-disable no-unused-vars */

require('ejs');
const express = require('express');
const Database = require('../../models/user');
const Event = require('../../structures/EventClass');
const CommandHandler = require('../../handler/Command');

const app = express();

app.use(express.static('website'));

app.set('view engine', 'ejs');
app.set('views', 'website');

app.engine('ejs', require('ejs').__express);

module.exports = class ReadyEvent extends Event {
	constructor(client) {
		super(client, {
			name: 'ready',
		});
	}
	async run() {
		// this.client.guilds.cache.get('').leave();

		for (const [id, guild] of this.client.guilds.cache) {
			// console.log(guild);
			await guild.members.fetch();
		}

		await new CommandHandler(this.client)
			.build('../commands')
			.then(() => console.log('Commands are now loaded.'));

		this.client.user.setStatus('dnd');
		this.client.user.setActivity('🎃 Trick or Treat!', { type: 'PLAYING' });

		console.log(`${this.client.user.tag} is online.`);

		app.get('/', async (req, res) => {
			res.render('index');
		});

		app.get('/leaderboard', async (req, res) => {
			const lb = [];
			const data = await Database.find({});
			const leaderboard = data.sort((a, b) => b.candy - a.candy);
			for (let i = 0; i < leaderboard.length; i++) {
				const user = this.client.users.cache.get(leaderboard[i]._id)
					? this.client.users.cache.get(leaderboard[i]._id).tag
					: 'Unknown User';
				lb.push(`${user} ~ ${leaderboard[i].candy} Candies 🍬`);
			}
			res.render('leaderboard', {
				total: lb.length,
				users: lb,
			});
		});

		app.listen(process.env.PORT, () => {
			console.log('Leaderboard is active.');
		});
	}
};
