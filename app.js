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

function setupDatabase() {

	var tweetInfoSchema = mongoose.Schema({
		date: Date,
		tweet_id: String,
		text: String,
		favorites: Number,
		retweets: Number
	});

	tweetInfoSchema.virtual('date.year').get(function() {
		return this.date.getYears();
	});

	tweetInfoSchema.virtual('date.month').get(function() {
		return this.date.getMonths();
	});

	tweetInfoSchema.virtual('date.day').get(function() {
		return this.date.getDays();
	});

	tweetInfoSchema.virtual('date.hour').get(function() {
		return this.date.getHours();
	});

	tweetInfoSchema.virtual('date.minute').get(function() {
		return this.date.getMinutes();
	});

	tweetInfoSchema.virtual('date.second').get(function() {
		return this.date.getSeconds();
	});	

	tweetInfoSchema.methods.load_info = function(tweet) {
		var d = new Date(tweet.created_at);

		this.favorites = tweet.favorite_count;
		this.retweets = tweet.retweet_count;
		this.text = tweet.text;
		this.tweet_id = tweet.id_str;
		this.date = d;
	};

	var userSchema = mongoose.Schema({
		handle: String,
		favorites_today: Number,
		retweets_today: Number,
		max_id: String,
		children: [tweetInfoSchema]
	});

	userSchema.methods.addTweets = function(timeline) {
		var nextDayReached = false;
		for(var i = 0; i < timeline.length; i++) {
			// pull tweets until previous day
			var tweet = timeline[i];
			var d = new Date(tweet.created_at);
			var today = new Date();

			if(d.getDays() < today.getDays()) {
				nextDayReached = true;
				this.max_id = tweet.id;
			}
			else {
				// do everything else. store it
				// TODO: fix this line. add a tweetinfo object and call its load_info method
				var t = new Tweet({});
				this.children.push()
				if(i === timeline.length - 1) {
					// last index
					if(nextDayReached) {
						return true;
					}
					else {
						this.max_id = tweet.id;
						return false;
					}
				}
			}

			
		}
	}

	var Tweet = mongoose.model('Tweet', tweetInfoSchema);
	var User = mongoose.model('User', userSchema);
	
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', setupDatabase);

app.get('/:user/update', function(req, res) {
	var obj = {screen_name:req.params.user};
	client.get('statuses/user_timeline', obj, function(error, tweets, response) {
		if(!error) {
			// first, check to see if the user is in the database
			// grab 100 tweets, check to see if anything low is the previous day.
			// if not, grab 100 more 

		}
		else {
			res.send(error);
		}
	});
});

app.get('/:user/tweets', function(req, res) {
	var params = {screen_name:req.params.user};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		if(!error) {
			res.send(tweets);
		}
		else {
			res.send(error);
		}
	});
});

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