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

////////////////////
// Routes
////////////////////

var tweets = require('./tweets-router.js')(models, client);
var graph = require('./graph-router.js')(models);
var stream = require('./stream-router.js')

app.use('/tweets', tweets);
app.use('/graph', graph);
app.use('/stream', stream);

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});