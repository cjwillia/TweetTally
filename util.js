exports.dateCompare = function(date1, date2) {
	if(date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear === date2.getFullYear())
		return 0;
	else if (date1 < date2)
		return -1;
	else
		return 1;
}

exports.dateShift = function(date, hour_offset) {
	var seconds = 1000;
	var minutes = 60 * seconds;
	var hours = 60 * minutes;
	return new Date(date + hours * hour_offset);
}

exports.handleError = function(err, res) {
	console.log(err);
	res.send("Sorry, there was an error in the server. Try navigating to the previous page.");
}