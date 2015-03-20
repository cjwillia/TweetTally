module.exports = function(models, client) {
	var express = require('express');
	var router = express.Router();
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
				if(err)
					console.log(err);
				else if(tweets.length === 0) {
					res.cookie('user', user.handle);
					res.redirect('/updated.html');					
				}
				else {
					// set the since_id of the user object to the first tweet received
					user.since_id = tweets[0].id_str;
					counter += 1;
					tweetsHelper(user.addTweets(tweets));
				}
			});		
		}
		else {
			console.log('ERROR: User was not found or added to the database.');
		}
	}
	
	router.post('/', function(req, res) {
		if(typeof req.body.handle === "undefined") {
			res.send("No username received");
		}
		else {
			var obj = { screen_name:req.body.handle };
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

	router.get('/:user', function(req, res) {
		User.findOne({ handle: req.params.user }, function(err, u) {
			if(err)
				console.log(err)
			else {
				console.log(u.children[0].date.year);
				res.send({tweets: u.children});
			}
		});
	});

	return router;
}



