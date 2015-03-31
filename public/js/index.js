function search() {
	var t = $('filter_term')[0].value;
	window.location = "/graph/" + t + "/stream";
}

