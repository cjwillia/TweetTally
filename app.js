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

// helper to log errors and send info back to the client
function handleError(err, res) {
	console.log(err);
	res.send("Sorry, there was an error in the server. Try navigating to the previous page.");
}

function setupDatabase() {

	var tweetInfoSchema = mongoose.Schema({
		date: Date,
		tweet_id: String,
		text: String,
		favorites: Number,
		retweets: Number
	});

	tweetInfoSchema.virtual('date.year').get(function() {
		return this.date.getFullYear();
	});

	tweetInfoSchema.virtual('date.month').get(function() {
		return this.date.getMonth();
	});

	tweetInfoSchema.virtual('date.day').get(function() {
		return this.date.getDate();
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
		since_id: String,
		children: [tweetInfoSchema]
	});

	userSchema.methods.addTweets = function(timeline) {
		var nextDayReached = false;
		console.log('Adding tweets to user ' + this.handle);
		for(var i = 0; i < timeline.length; i++) {
			// pull tweets until previous day
			var timeline_obj = timeline[i];
			var d = new Date(timeline_obj.created_at);
			var today = new Date();

			if(d.getDate() !== today.getDate() || d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear()) {
				console.log("Found oldest tweet today");
				nextDayReached = true;
				this.max_id = timeline_obj.id;
			}
			else {
				console.log("Storing Tweet of id: " + timeline_obj.id);
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

// helper function for user updating

function getTweets(user, res) {
	if(typeof user !== "undefined") {
		console.log('Getting tweets for user ' + user.handle + "...");
		var o = { screen_name:user.handle, count: 100 };
		var counter = 0;

		if(typeof user.since_id !== "undefined")
			o.since_id = user.since_id;
		if(typeof user.max_id !== "undefined")
			o.max_id = user.max_id;

		// Because this process is recursive and requires a callback method,
		// it is impossible to do with a simple while loop. Instead, I must write
		// a recursive callback method

		function tweetsHelper(b) {
			if(b) {
				user.save(function(err) {
					if(err)
						console.log(err);
					else
						console.log('User Updated!');
				});
				return true;
			}
			else {
				o.max_id = user.max_id;
				client.get('statuses/user_timeline', o, function(e, t, r) {
					if (e)
						console.log(e);
					else {
						counter += 1;
						return tweetsHelper(user.addTweets(t));
					}
				});
			}
		}

		client.get('statuses/user_timeline', o, function(err, tweets, response) {
			console.log("Client is polling for tweets...");
			// set the since_id of the user object to the first tweet received
			user.since_id = tweets[0].id;
			if(err)
				console.log(err);
			else {
				counter += 1;
				tweetsHelper(user.addTweets(tweets));
			}
		});		
	}
	else {
		console.log('ERROR: User was not found or added to the database.');
	}
}

app.get('/:user/update', function(req, res) {
	var obj = { screen_name:req.params.user };
	console.log("Finding users...");
	User.count({'handle': obj.screen_name}, function(err, count) {
		if(err)
			handleError(err, res);
		else {
			if(count === 0) {
				console.log("Creating new user...");
				var updating_user = new User({handle: obj.screen_name});
				updating_user.save(function(error) {
					if(error)
						handleError(error, res);
					else {
						console.log("User saved to database!");
						getTweets(updating_user, res);
					}
				});
			}
			else {
				User.findOne({'handle': obj.screen_name}, function(error, u) {
					if(error)
						handleError(error, res);
					else {	
						console.log("User located in database.");
						getTweets(u, res);
					}
				});
			}
		}
	});
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