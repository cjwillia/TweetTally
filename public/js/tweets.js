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
var user = getCookie('user');

function loadTweets(data) {
    var t = data.tweets;

    t.forEach(function(tweet) {
        tweet.date = new Date(tweet.date);
        tweet.hour = tweet.date.getHours();
    });
    tweets = t;
    drawChart();
    fillTable();
}

function getDBTweets() {
	$.getJSON('/tweets/' + user, loadTweets);
}

function fillTable() {
    var table = $("#data");
    var obj = {};
    tweets.forEach(function(tweet) {
        if(obj[tweet.hour]) {
            obj[tweet.hour]++;
        }
        else {
            obj[tweet.hour] = 1;
        }
    });
    obj.forEach(function(v,k) {
        var row = $("<tr>");
        row.append($("<td>").html(k.toString() + ":00"));
        row.append($("<td>").html(v.toString()));
    });
}
