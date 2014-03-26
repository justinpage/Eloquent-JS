function requestObject() {
	if (window.XMLHttpRequest)
		return new XMLHttpRequest();
	else if (window.ActiveXObject)
		return new ActiveXObject("Msxml2.XMLHTTP");
	else
		throw new Error("Could not create HTTP request object.");
}

request = new requestObject();
request.open("GET", "fruit.json", true);
request.onreadystatechange = function() {
	if (request.readyState == 4) {
		var data = eval("(" + request.responseText + ")");
		console.log(data);
		console.log(data["lemon"]);
	}
};
request.send(null);

var success = function(response) {
	console.log(response);
}

var failure = function(fullStatus, statusText) {
	console.log(fullStatus + " " + statusText);
}

function simpleHttpRequest(url, success, failure) {
	var request = requestObject();
	request.open("GET", url, true);
	request.onreadystatechange = function() {
		if (request.readyState === 4) {
			if (request.status == 200 || !failure)
				success(request.responseText);
			else if (failure)
				failure(request.status, request.statusText);
		}
	};
	request.send(null);
}
