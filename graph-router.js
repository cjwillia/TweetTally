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

	return router;
}