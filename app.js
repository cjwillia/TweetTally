var express = require('express');
var app = express();
var router = express.Router();
var session = require('cookie-session');

app.set('port', (process.env.PORT || 5000));
app.use(session({
	keys: ['thisiskey1', 'thisiskey2']
}));

var static_options = {

}

app.use(express.static('public', static_options));

var Twitter = require('twitter');

var client= new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

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