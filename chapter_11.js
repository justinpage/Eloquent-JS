// Browser Events

// an alternative method to binding this, more succinct
function method(object, name) {
	return function() {
		object[name].apply(object, arguments);
	};
};

// Point type --chapter 6
function forEachIn(object, action) {
	for (var property in object) {
		if (Object.prototype.hasOwnProperty.call(object, property))
			action(property, object[property]);
	}
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}
Point.prototype.add = function(other) {
	return new Point(this.x + other.x, this.y + other.y);
};

Point.prototype.toString = function() {
	return "(" + this.x + "," + this.y + ")";
};

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

function registerEventHandler(node, type, handler) {
	if (typeof addEventListener !== "undefined")
		node.addEventListener(type, handler, false);
	else if (typeof attachEvent !== "undefined")
		node.attachEvent("on" + type, handler);
	else
		node["on" + type] = handler;
}

function unregisterEventHandler(node, type, handler) {
	if (typeof removeEventListener !== "undefined")
		node.removeEventListener(type, handler, false);
	else if (typeof detachEvent !== "undefined")
		node.detachEvent("on" + type, handler);
	else
		node["on" + type] = null;
}

// var button = document.getElementById("button");
// registerEventHandler(button, "click", function(){console.log("click");});
//
// registerEventHandler(document, "click", function(event) {
// 	event = event || window.event;
// 	console.log(event.clientX, ",", event.clientY);
// });
//
// registerEventHandler(myParagraph, "mouseover", function(event) {
// 	event = event || window.event;
// 	if ((event.target || event.srcElement) === myParagraph)
// 		console.log("The mouse has entered the pararaph!");
// });
//
// registerEventHandler(document, "keypress", function(event) {
// 	event = event || window.event;
// 	var charCode = event.charCode || event.keyCode;
// 	if (charCode)
// 		console.log("Character '", String.fromCharCode(charCode), "' was typed.");
// });
//

function normalizeEvent(event) {
	if ( !event.stopPropagation) {
		event.stopPropagation = function() {this.cancelBubble = true;}
		event.preventDefault = function() {this.returnValue = false; }
	}
	if (!event.stop)
		event.stop = function() {
			this.stopPropagation();
			this.preventDefault();
		};

	if (event.srcElement && !event.target)
		event.target = event.srcElement;

	if ((event.toElement || event.fromElement) && !event.relatedTarget)
		event.relatedTarget = event.toElement || event.fromElement;

	if (event.clientX != undefined && event.pageX == undefined) {
		event.pageX = event.clientX + document.scrollLeft;
		event.pageY = event.clientY + document.scrollTop;
	}

	if (event.type == "keypress")
		event.character = String.fromCharCode(event.charCode || event.keyCode);
	return event;
}

function addHandler(node, type, handler) {
	function wrapHandler(event) {
		handler(normalizeEvent(event || window.event));
	}

	registerEventHandler(node, type, wrapHandler);
	return {node: node, type: type, handler: wrapHandler};
}

function removeHandler(object) {
	unregisterEventHandler(object.node, object.type, object.handler);
}

// var blockQ = addHandler(textfield, "keypress", function(event) {
// 	if (event.character.toLowerCase() == "q")
// 		event.stop();
// });
//
//
// addHandler(textfield, "focus", function(event) {
// 	event.target.style.backgroundColor = "yellow";
// });
//
// addHandler(textfield, "blur", function(event) {
// 	event.target.style.backgroundColor = "";
// });
//
// addHandler(textfield, "change", function(event) {
// 	console.log("Content of text field changed to '", event.target.value, "'.");
// });
//


// Implementing Sokoban
var level = {boulders: 8,
			 field: ["#####  #####",
			 		 "#   #  #   #",
			 		 "# 0 ####0  #",
			 		 "# 0 @      #",
			 		 "#  ##### 0 #",
			 		 "#### ### ###",
			 		 "     #     #",
			 		 "     # 0   #",
			 		 "    ## 0   #",
			 		 "    #*0 0  #",
			 		 "    ########"]};

function Square( character, img ) {
	this.img = img;
	var content = {"@" : "player", "#" : "wall", "*" : "exit",
				   " " : "empty", "0" : "boulder"}[character];
	if (content == null)
		throw new Error("Unrecognized character: '" + character + "'");
	this.setContent(content);
}

Square.prototype.setContent = function( content ) {
	this.content = content;
	this.img.src = "img/" + content + ".png";
}

function SokobanField( level ) {
	this.fieldDiv = dom("DIV");
	this.squares = [];
	this.bouldersToGo = level.boulders;

	for (var y = 0; y < level.field.length; y++) {
		var line = level.field[y], squareRow = [];
		for (var x = 0; x < line.length; x++) {
			var img = dom("IMG");
			this.fieldDiv.appendChild(img);
			squareRow.push(new Square(line.charAt(x), img));
			if (line.charAt(x) == "@")
				this.playerPos = new Point(x, y);
		}
		this.fieldDiv.appendChild(dom("BR"));
		this.squares.push(squareRow);
	}
}

SokobanField.prototype.status = function() {
	return this.bouldersToGo + " boulder" + (this.bouldersToGo == 1 ? "" : "s") + " to go.";
};

SokobanField.prototype.won = function() {
	return this.bouldersToGo <= 0;
};

SokobanField.prototype.place = function(where) {
	where.appendChild(this.fieldDiv);
};

SokobanField.prototype.remove = function() {
	this.fieldDiv.parentNode.removeChild(this.fieldDiv);
};

SokobanField.prototype.move = function(direction) {
	var playerSquare = this.squares[this.playerPos.y][this.playerPos.x],
		targetPos = this.playerPos.add(direction),
		targetSquare = this.squares[targetPos.y][targetPos.x];

	// First, see if the player can push a boulder
	if (targetSquare.content == "boulder") {
		var pushPos = targetPos.add(direction),
			pushSquare = this.squares[pushPos.y][pushPos.x];
		if (pushSquare.content == "empty") {
			targetSquare.setContent("empty");
			pushSquare.setContent("boulder");
		}
		else if (pushSquare.content == "exit") {
			targetSquare.setContent("empty");
			this.bouldersToGo--;
		}
	}

	// Then, try to move...
	if (targetSquare.content == "empty") {
		playerSquare.setContent("empty");
		targetSquare.setContent("player");
		this.playerPos = targetPos;
	}
}

/* (new SokobanField(level)).place(document.body); */

function SokobanGame( level, place ) {
	this.levels = level;
	var newGame = dom("BUTTON", null, "New Game");

	addHandler(newGame, "click", method(this, "newGame"));
	var reset = dom("BUTTON", null, "Reset Level");
	addHandler(reset, "click", method(this, "resetLevel"));
	this.status = dom("DIV");
	this.container = dom("DIV", null, dom("H1", null, "Sokoban"),
			dom("DIV", null, newGame, " ", reset), this.status);
	place.appendChild(this.container);
	addHandler(document, "keydown", method(this, "keyDown"));
	this.newGame();
}

SokobanGame.prototype.newGame = function() {
	this.level = 0;
	this.resetLevel();
};

SokobanGame.prototype.resetLevel = function() {
	if(this.field)
		this.field.remove();
	this.field = new SokobanField(this.levels);
	this.field.place(this.container);
	this.updateStatus();
};

SokobanGame.prototype.updateStatus = function() {
	this.status.innerHTML = "Level " + (1 + this.level) + ": " + this.field.status();
};

var arrowKeyCodes = {
	37: new Point(-1, 0), // left
	38: new Point(0, -1), //up
	39: new Point(1, 0), //right
	40: new Point(0, 1)
};

SokobanGame.prototype.keyDown = function(event) {
	if (arrowKeyCodes.hasOwnProperty(event.keyCode)) {
		event.stop();
		this.field.move(arrowKeyCodes[event.keyCode]);
		this.updateStatus();
		if (this.field.won()) {
			if (this.level < this.levels.length - 1) {
				console.log("Excellent! Going to the next level.");
				this.level++;
				this.resetLevel();
			}
			else {
			alert("You Win! Game Over.");
			this.newGame();
			}
		}
	}
};

document.body.innerHTML = "";
var game = new SokobanGame(level, document.body);
