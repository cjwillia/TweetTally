var express = require('express');
var app = express();
var router = express.Router();
var request = require('request');

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


app.get('/login', function(req, res) {
	client.get('favorites/list', function(error, tweets, response){
		//if(error) throw error;
		console.log(response);
		res.send("<p>Something Happened!11!</p>")
	});
});

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});