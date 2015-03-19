var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var session = require('cookie-session');

app.set('port', (process.env.PORT || 5000));
app.use(session({
	keys: ['thisiskey1', 'thisiskey2']
}));

app.use(express.static('public', {}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/////////////////////////
// Twitter
/////////////////////////

var Twitter = require('twitter');

var client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

///////////////////////
// Database
///////////////////////

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var models = require('./db.js')(mongoose);

var Tweet = models.Tweet;
var User = models.User;

// helper to log errors and send info back to the client

function handleError(err, res) {
	console.log(err);
	res.send("Sorry, there was an error in the server. Try navigating to the previous page.");
}

////////////////////
// Routes
////////////////////

var tweets = require('./db-router.js')(models, client);

app.use('/tweets', tweets);

app.get('/:user/favorites', function(req, res) {
	var params = {screen_name:req.params.user};
	// get the user's day timeline (userSchema.children)
	// for each tweet with favorites, take down the time and number of favorites
	// send back an object with that information on it
});

app.get('/extra', function(req, res) {
	
});

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});