var express = require('express');
var router = express.Router();

module.exports = function(models, client) {
	var Stream = models.Stream;

	router.post('/', function(req, res) {

		function twitterStream(stream, res) {
			client.stream('statuses/filter', { track: stream.term }, function(s) {
				s.on('data', function(tweet) {
					stream.total++;
					stream.save(function(err) {
						if(err)
							console.log(err);
					});
				});

				s.on('error', function(err) {
					console.log(err);
				});
				console.log("Client is streaming tweets");
				res.send("Stream is open");
			});
		}

		Stream.count({term: req.body.term}, function(err, count) {
			if(err)
				console.log(err);
			else {
				if(count === 0) {
					var stream = new Stream({term: req.body.term.replace( /\W/g , ''), total: 0});
					stream.save(function(err) {
						if(err)
							console.log(err);
						else {
							twitterStream(stream, res);
						}
					});
				}
				else {
					Stream.findOne({ term: req.body.term.replace( /\W/g , '') }, function(err, s) {
						if(err)
							console.log(err);
						else {
							twitterStream(s, res);
						}
					});
				}
			}
		});
		
	});

	router.get('/:term', function(req, res) {
		Stream.findOne({term: req.params.term.replace( /\W/g , '')}, function(err, s) {
			if(err)
				console.log(err);
			else {
				var res_obj = {n: s.total};
				res.send(res_obj);
			}
		});
	});

	return router;
}