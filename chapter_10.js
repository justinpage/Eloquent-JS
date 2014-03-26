// Web Programming:  A Crash Course
function forEachIn(object, action) {
	for (var property in object) {
		if (Object.prototype.hasOwnProperty.call(object, property))
			action(property, object[property]);
	}
}

function isTextNode(node) {
	return node.nodeType == 3;
}

function isImage(node) {
	return !isTextNode(node) && node.nodeName == "IMG";
}

var newImage = document.createElement("IMG");
newImage.setAttribute("src", "wallpaper-2942186.png");
document.body.appendChild(newImage);

function dom(name, attributes) {
	var node = document.createElement(name);
	if (attributes) {
		forEachIn(attributes, function(name, value) {
			node.setAttribute(name, value);
		});
	}

	for (var i = 2; i < arguments.length; i++) {
		var child = arguments[i];
		if (typeof child == "string")
			child = document.createTextNode(child);
		node.appendChild(child);
	}

	return node;
}

document.body.appendChild(
		dom("P", null, "A paragraph with a ", 
			dom("A", {href: "http://google.com"}, "link"),
			" is inside of it."));

newImage.style.width = "960px";

newImage.style.position = "absolute";

var angle = 0;

setInterval(function() {
	angle += 0.1;
	newImage.style.left = (200 + 200 * Math.cos(angle)) + "px";
	newImage.style.top = (200 + 200 * Math.sin(angle)) + "px";
}, 100);


