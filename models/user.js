const Mongoose = require('mongoose');

Mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const ChannelSchema = new Mongoose.Schema({
	_id: {
		type: String,
	},
	candy: {
		type: Number,
	},
	lastCandy: {
		type: Date,
	},
});

module.exports = Mongoose.model('Jack-o\'-lantern Users', ChannelSchema);
