var tweets = {};
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

function loadTweets(data) {
    var t = data.tweets;

    t.forEach(function(tweet) {
        tweet.date = new Date(tweet.date);
        tweet.hour = tweet.date.getHours();
    });
    tweets = t;
    drawChart();
}

function getDBTweets() {
	$.getJSON('/tweets/' + getCookie('user'), loadTweets);
}
