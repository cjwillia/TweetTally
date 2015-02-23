var express = require('express');
var app = express();
var router = express.Router();
var session = require('cookie-session');

app.set('port', (process.env.PORT || 5000));
app.use(session({
	keys: ['thisiskey1', 'thisiskey2']
}));

app.use(express.static('public', {}));

var Twitter = require('twitter');

var client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

// is this necessary now with mongoose?
var mongodb = require('mongodb');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI);

function callback() {
	//temporary function for mongo tutorial

	var kittySchema = mongoose.Schema({
		name: String
	});

	var Kitten = mongoose.model('Kitten', kittySchema);

	var silence = new Kitten({name: 'Silence'});
	console.log(silence.name);

	
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', callback);

var params = {screen_name: 'thedreadjesus'};

app.get('/reqToken', function(req, res) {
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if(!error) {
			res.send(tweets);
		}
		else {
			res.send(error);
		}
	})
});

app.get('/extra', function(req, res) {

});

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});