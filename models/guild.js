const Mongoose = require('mongoose');

const ChannelSchema = new Mongoose.Schema({
	_id: {
		type: String,
	},
	lastRush: {
		type: Date,
	},
	lastGuess: {
		type: Date,
	},
	welcomeChannel: {
		type: String,
	},
	welcomeMessage: {
		type: String,
	},
	goodbyeChannel: {
		type: String,
	},
	goodbyeMessage: {
		type: String,
	},
});

module.exports = Mongoose.model('Jack-o\'-lantern Guilds', ChannelSchema);
