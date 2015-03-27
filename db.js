var util = require('./util.js');

module.exports = function (mongoose) {

	var tweetInfoSchema = mongoose.Schema({
		date: Date,
		tweet_id: String,
		text: String,
		favorites: Number,
		retweets: Number
	},
	{
		toObject: { virtuals: true },
		toJSON: { virtuals: true }
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

		function decrementTweetId(id_str) {
			var result = id_str;
			var i = result.length - 1;
			while(i > -1) {
				if(result[i] === "0") {
					result = result.substring(0, i) + "9" + result.substring(i+1);
					i--;
				}
				else {
					result = result.substring(0, i) + (parseInt(result[i], 10) - 1).toString() + result.substring(i+1);
					return result;
				}
			}
			return result;
		}

		var i = 0;
		while(i < timeline.length) {
			// pull tweets until previous day is reached
			var timeline_obj = timeline[i];

			// this is hard-coded to be east coast time
			var
			var fourHours = 4 * 1000 * 60 * 60
			var d = new Date(Date.parse(timeline_obj.created_at) - (fourHours));
			var today = new Date(Date.now() - (fourHours));


			if(d.getDate() !== today.getDate() || d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear()) {
				console.log("Found tweet from different day");
				nextDayReached = true;
				this.max_id = decrementTweetId(timeline_obj.id_str);
				i += timeline.length;
			}
			else if(typeof timeline_obj.retweeted_status !== 'undefined') {
				console.log("Retweet Found");
				// anything else here is out of scope right now.
				i++;
			}
			else {
				console.log("Storing Tweet of id: " + timeline_obj.id_str);
				var t = new Tweet({});
				t.load_info(timeline_obj);
				this.children.push(t);
				if(i === timeline.length - 1) {
					// last index
					this.max_id = decrementTweetId(timeline_obj.id_str);
				}
				i++;
			}	
		}
		return nextDayReached;
	}

	userSchema.methods.removeTweets = function() {
		this.children.toObject().forEach(function(t) {
			t.remove(function(err, t) {
				if (err)
					console.log(err);
				else
					console.log("Tweet removed");
			});
		});
	}

	var Tweet = mongoose.model('Tweet', tweetInfoSchema);
	var User = mongoose.model('User', userSchema);
	var models = {
		'Tweet': Tweet,
		'User' : User
	}
	console.log('Tweets and Users are set up.');
	return models;
}