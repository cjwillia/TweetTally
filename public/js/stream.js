// cookie parsing function taken from W3 Schools http://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

var term = getCookie('term');
var num_tweets = 0;
var speed = 0;
var x = 0;
var minute_tweets = 0;
var actual_tpm = 0;
var dataTable;

function formatNumSeconds(n) {
	if(n % 60 === 0)
		return n / 60 + ":00"
	else
		return Math.floor(n / 60) + ":" + (n % 60 > 9 ? n % 60 : "0" + n % 60)
}

function getNewSpeed() {
	$.getJSON('stream/' + term, function(data) {
		var tweets_since = data.n - num_tweets;
		minute_tweets += tweets_since;
		speed = (tweets_since) * 6;
		actual_tpm += tweets_since;
		num_tweets = data.n;
		addNextSpeed();
		draw();
		setTimeout(getNewSpeed, 10000);
	});
}

function addNextSpeed() {
	if(x % 60 === 0) {
		dataTable.addRow([formatNumSeconds(x), speed, minute_tweets, actual_tpm]);
		actual_tpm = 0;

	}	
	else {
		dataTable.addRow([formatNumSeconds(x), speed, minute_tweets, undefined]);
	}
	x += 10;
}

function draw() {
	var options = {
		title: "Tweets/minute over Time: '" + term + "'",
		width: 500,
		height: 400
	}
	var chart = new google.visualization.LineChart($('#chart_div')[0]);
	chart.draw(dataTable, options);
}

function updateTweets(data) {
	num_tweets = data.n;
	dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'time');
	dataTable.addColumn('number', 'TPM');
	dataTable.addColumn('number', 'actual tweets');
	dataTable.addColumn('number', 'actual tweets/minute');
	addNextSpeed();
	draw();
	setTimeout(getNewSpeed, 10000);
}

function start(msg) {
	console.log(msg);

	$.getJSON('stream/' + term, updateTweets);
}


function requestStream() {
	$.post('stream', {'term': term}, start);
}

google.setOnLoadCallback(requestStream);