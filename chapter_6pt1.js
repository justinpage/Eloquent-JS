var rabbit = {};

rabbit.speak = function(line) {
	console.log("The rabbit says '" + line + "'");
};

rabbit.speak("I'm alive.");

function speak(line) {
	console.log("The " + this.adjective + " rabbit says '" + line + "'");
};

var whiteRabbit = {adjective: "white", speak: speak};
var fatRabbit = {adjective: "fat", speak: speak};

whiteRabbit.speak("Oh my ears and whiskers, how late it is getting!");
fatRabbit.speak("I could sure use a carrot right now.");

speak.apply(fatRabbit, ["Yum."]);
speak.call(fatRabbit, "Burp.");

function run(from, to) {
	console.log("The " + this.adjective + " rabbit runs from " + from  + " to " + to + ".");
};


run.apply(whiteRabbit, ["A", "B"]);
run.call(fatRabbit, "the cupboard", "the fridge");

// function Rabbit(adjective) {
// 	this.adjective = adjective;
// 	this.speak = function(line) {
// 		console.log("The ", this.adjective, " rabbit says '", line, "'");
// 	};
// }
// prototype alternative
function Rabbit(adjective) {
	this.adjective = adjective;
}
Rabbit.prototype.speak = function(line) {
	console.log("The ", this.adjective, " rabbit says '", line, "'");
}

var killerRabbit = new Rabbit("killer");
killerRabbit.speak("Graaaaaaaaah!");

Rabbit.prototype.teeth = "small";
killerRabbit.teeth = "long, sharp, and bloody";

Rabbit.prototype.dance = function() {
	console.log("The ", this.adjective, " rabbit dances a jig.");
};

Object.prototype.properties = function() {
	var result = [];
	for (var property in this) {
		if (this.hasOwnProperty(property))
			result.push(property);
	}
	return result;
}

var test = {"Fat Igor": true, "Fireball": true};

function forEachIn(object, action) {
	for (var property in object) {
		if (Object.prototype.hasOwnProperty.call(object, property))
			action(property, object[property]);
	}
}

// objects as Dictionaries
function Dictionary(startValues) {
	this.values = startValues || {};
};

Dictionary.prototype.store = function(name, value) {
	this.values[name] = value;
};

Dictionary.prototype.lookup = function(name) {
	return this.values[name];
};

Dictionary.prototype.contains = function(name) {
	return Object.prototype.propertyIsEnumerable.call(this.values, name);
};

Dictionary.prototype.each = function(action) {
	forEachIn(this.values, action);
};

var colors = new Dictionary({Grover: "blue", Elmo: "red", Bert: "yellow"});
colors.store("Ernie", "orange");

colors.each(function(name, color) {
	console.log(name, " is ", color);
});
