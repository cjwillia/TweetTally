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

client.authorize_user = function(username, callback) {
	client.get('oauth/authorize', {screen_name: username}, callback);
}

client.authorize = function(callback) {
	client.get('oauth/authorize', callback);
}

app.get('/login', function(req, res) {
	function respond(error, response) {
		if(error) throw error;
		res.send(response);
	}
	// this would maybe be a fancier way to handle this? I might have some closure fuckups here
	// var handle = req.params.handle;
	// handle === "" ? client.authorize(respond) : client.authorize_user(handle, respond);
	/*
	client.get('oauth/authorize', function(error, response){
		if(error) throw error;
		console.log(response);
		res.send("<p>Something Happened!11!</p>")
	});
	*/
	res.send("testing just the route");
});

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});