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

// function for user updating

function getTweets(user, res) {
	if(typeof user !== "undefined") {
		console.log('Getting tweets for user ' + user.handle + "...");
		var o = { screen_name:user.handle, count: 100 };
		var counter = 0;

		// helper method to recurse on client calls
		function tweetsHelper(b) {
			if(b) {
				user.save(function(err) {
					if(err)
						console.log(err);
					else
						console.log('User Updated!');
				});
				res.cookie('user', user.handle);
				res.redirect('/updated.html');
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

		if(typeof user.since_id !== "undefined")
			o.since_id = user.since_id;
		if(typeof user.max_id !== "undefined")
			o.max_id = user.max_id;
		client.get('statuses/user_timeline', o, function(err, tweets, response) {
			console.log("Client is polling for tweets...");
			// set the since_id of the user object to the first tweet received
			user.since_id = tweets[0].id_str;
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

////////////////////
// Routes
////////////////////

app.post('/tweets', function(req, res) {
	if(typeof req.body.user === "undefined") {
		res.send("No username received");
	}
	else {
		var obj = { screen_name:req.body.user };
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
	}
});

app.get('/updated')

app.get('/tweets/:user', function(req, res) {
	User.findOne({'handle': req.params.user}, function(err, u) {
		if(err)
			res.send(err);
		else
			res.send({tweets: u.children});
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