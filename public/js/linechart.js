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

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);