module.exports = function(models) {
	var express = require('express');
	var router = express.Router();

	router.get('/:user', function(req, res) {
		res.redirect('/graph.html');
	});

	router.get('/:user/favorites', function(req, res) {

	});

	router.get('/:user/retweets', function(req, res) {

	});

	router.get('/stream', function(req, res) {
		res.cookie('term', req.query.term);
		res.redirect('/stream.html');
	});

	return router;
}