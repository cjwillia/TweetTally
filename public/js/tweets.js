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


function getDBTweets(cb) {
	$.getJSON('/tweets/' + getCookie('user'), cb);
}

function loadTweets(data) {
    var t = data.tweets;

    t.forEach(function(tweet) {
        tweet.date = new Date(tweet.date);
        tweet.hour = tweet.date.getHours();
    });
    t.dateGraphData = function() {

    }
    tweets = t;
}

function graphTweets() {

}

getDBTweets(loadTweets);

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {

    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Tweets');

    var rows = [];
    var i = 0;
    while(i < 24) {
        rows.push(["0" + i.toString() + ":00", 0]);
        i++;
    }

    tweets.forEach(function(tweet) {
        rows[tweet.hour][1]++;
    });

    data.addRows(rows);

    // Set chart options
    var options = {'title':'Tweets per Hour',
    'width':400,
    'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}