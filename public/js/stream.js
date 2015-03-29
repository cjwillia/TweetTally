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

function getNewSpeed() {
	$.getJSON('stream/' + term, function(data) {
		speed = (data.n - num_tweets) * 6 * 60;
		$('#chart_div').html(speed+"");
		num_tweets = data.n;
		setTimeout(getNewSpeed, 10000);
	});
}

function updateTweets(data) {
	num_tweets = data.n;
	setTimeout(getNewSpeed, 10000);
}

function start(msg) {
	console.log(msg);

	$.getJSON('stream/' + term, updateTweets);
}


function requestStream() {
	
	$.post('stream', {'term': term}, start);
}
