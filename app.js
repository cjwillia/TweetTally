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

var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
	consumerKey: process.env.TWITTER_CONSUMER_KEY,
	consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
	callback: 'https://floating-sierra-5718.herokuapp.com/extra.html'
});

app.get('/reqToken', function(req, res) {
	twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
		if(error) {
			console.log("Error getting OAuth Request Token: " + error);
		}
		else {
			req.session.requestToken = requestToken;
			req.session.requestTokenSecret = requestTokenSecret;
			res.redirect(twitter.getAuthUrl(req.session.requestToken));
		}
	});
});

app.get('/extra', function(req, res) {
	twitter.getAccessToken(req.requestToken, req.session.requestTokenSecret, req.query.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
		if(error) {
			console.log(error);
		}
		else {
			req.session.accessToken = accessToken;
			req.session.accessTokenSecret = accessTokenSecret;
		}
	});
});

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});