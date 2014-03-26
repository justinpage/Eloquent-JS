function forEachIn(object, action) {
	for (var property in object) {
		if (Object.prototype.hasOwnProperty.call(object, property))
			action(property, object[property]);
	}
}

function extractDate(string) {
	var found = string.match(/\b(\d\d?)\/(\d\d?)\/(\d{4})\b/);
	if (found === null)
		throw new Error("No date is found in '" + string + "'.");
	return new Date(Number(found[3]), Number(found[2]) - 1, Number(found[1]));
}

var stock = "1 lemon, 2 cabbages, and 101 eggs";
function minusOne(match, amount, unit) {
	amount = Number(amount) - 1;
	if (amount == 1) // only one left, remove the s
		unit = unit.slice(0, unit.length -1);
	else if (amount === 0)
		amount = "no";
	return amount + " " + unit;
}
stock.replace(/(\d+) (\w+)/g, minusOne);

function escapeHTML(text) {
	var replacements = {"<" : "&lt", ">" : "&gt",
						"&": "&amp", "\"": "&quot"};

	return text.replace(/[<>&"]/g, function(character) {
			return replacements[character];
	});
}

var badWords = ["ape", "monkey", "simian", "gorilla", "evolution"];
var pattern = new RegExp(badWords.join("|"), "i");
function isAcceptable(text) {
	return !pattern.test(text);
}

// Parsing a .ini file
function splitLines(string) {
	return string.split(/\r?\n/);
}

function parseINI(string) {
	var lines = splitLines(string);
	var categories;

	function newCategory(name) {
		var cat = {name: name, fields: []};
		categories.push(cat);
		return cat;
	}
	var currentCategory = newCategory("TOP");

	forEachIn(lines, function(line) {
		var match;
		if (/^\s*(;.*)?$/.test(line))
			return;
		else if (match = line.match(/^\[(.*)\]$/))
			currentCategory = newCategory(match[1]);
		else if (match = line.match(/^(\w+)=(.*)$/))
			currentCategory.fields.push({name: match[1], value: match[2]});
		else
			throw new Error("Line '" + line + "' is invalid.");
	});

	return categories;

}
