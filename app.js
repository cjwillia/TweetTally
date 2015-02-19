var express = require('express');
var app = express();
var router = express.Router();
var port_number = 8888;

var static_options = {

}

app.use(express.static('public', static_options));

app.listen(port_number);

console.log("Application listening on port: " + port_number);