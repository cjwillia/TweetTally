var express = require('express');
var app = express();
var router = express.Router();

var static_options = {

}

app.use(express.static('public', static_options));

app.listen(8888);

