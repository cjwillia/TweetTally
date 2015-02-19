var express = require('express');
var app = express();
var router = express.Router();

app.set('port', (process.env.PORT || 5000));

var static_options = {

}

app.use(express.static('public', static_options));

app.listen(app.get('port'), function() {
	console.log("Node app is running locally on port: " + app.get('port'));
});