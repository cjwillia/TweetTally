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
			var timeline_obj = timeline[i];
			var d = new Date(timeline_obj.created_at);
			var today = new Date();

			if(d.getDays() < today.getDays()) {
				nextDayReached = true;
				this.max_id = timeline_obj.id;
			}
			else {
				// do everything else. store it
				// TODO: fix this line. add a tweetinfo object and call its load_info method
				var t = new Tweet({});
				t.load_info(timeline_obj);
				this.children.push(t);
				if(i === timeline.length - 1) {
					// last index
					if(!nextDayReached) {
						this.max_id = timeline_obj.id;
					}
				}
			}	
		}
		return nextDayReached;
	}

	Tweet = mongoose.model('Tweet', tweetInfoSchema);
	User = mongoose.model('User', userSchema);
	console.log('Tweets and Users are set up.');
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var Tweet;
var User;
db.once('open', setupDatabase);

app.get('/:user/update', function(req, res) {
	var obj = { screen_name:req.params.user };
	var done = false;
	var updating_user;
	User.count({'handle': obj.screen_name}, function(err, count) {
		if(err)
			console.log(err);
		else {
			if(count === 0) {
				updating_user = new User({handle: obj.screen_name});
			}
			else {
				User.findOne({'handle': obj.screen_name}, function(err, u) {
					if(err)
						console.log(err);
					else
						updating_user = u;
				});
			}
		}
	});
	if(typeof updating_user !== "undefined") {
		var counter = 0;
		while(!done) {
			client.get('statuses/user_timeline', obj, function(error, tweets, response) {
				if(!error) {
					counter += 1;
					done = updating_user.addTweets(tweets);
					console.log("successfully found and added tweets. times: " + counter);
				}
				else {
					res.send(error);
				}
			});		
		}
	}
	console.log("User successfully updated");
});

app.get('/:user/tweets', function(req, res) {
	User.count({'handle': req.params.user}, function(err, count) {
		if(err)
			console.log(err);
		else {
			if(count === 1) {
				User.findOne({'handle': req.params.user}, function(err, u) {
					if(err)
						console.log(err);
					else {
						res.send("I found it! it's " + u.handle);
					}
				});
			}
			else if(count === 0) {
				res.send("Hey, this user doesn't exist in the system yet. Add them with the /update URL");
			}
			else {
				console.log('something has gone wrong here');
			}
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