var express = require('express');
var app = express();
var router = express.Router();

app.set('port', (process.env.PORT || 5000));


var static_options = {

}

app.use(express.static('public', static_options));

var Twitter = require('twitter');

var client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_key: process.env.TWITTER_ACCESS_KEY,
	access_secret: process.env.TWITTER_ACCESS_SECRET
});

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});