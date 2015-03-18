var express = require('express');
var router = express.Router();

function setupDatabase(mongoose) {

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

router.use(function(req, res, next) {
	
});