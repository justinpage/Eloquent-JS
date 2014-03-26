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

Dictionary.prototype.names = function() {
	var names = [];
	this.each(function(name, value) {names.push(name);});
	return names;
}

var thePlan =
["############################",
	"#      #    #      %      ##",
	"#                          #",
	"#          #####           #",
	"##         #   #    ##     #",
	"###           ##     #     #",
	"#           ###      #     #",
	"#   ####                   #",
	"#   ##       %             #",
	"# ~  #         ~       ### #",
	"#    #                     #",
	"############################"];

// Point type
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


/* var grid = ["0,0", "1,0", "2,0", "0,1", "1,1", "2,1"]; */

// Grid type
function Grid(width, height) {
	this.width = width;
	this.height = height;
	this.cells = new Array(width * height);
}
Grid.prototype.valueAt = function(point) {
	return this.cells[point.y * this.width + point.x];
};
Grid.prototype.setValueAt = function(point, value) {
	this.cells[point.y * this.width + point.x] = value;
};
Grid.prototype.isInside = function(point) {
	return point.x >= 0 && point.y >= 0 &&
		point.x < this.width && point.y < this.height;
};
Grid.prototype.moveValue = function(from, to) {
	this.setValueAt(to, this.valueAt(from));
	this.setValueAt(from, undefined);
};

Grid.prototype.each = function(action) {
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
			var point = new Point(x, y);
			action(point, this.valueAt(point));
		}
	}
};


// directions object
var directions = new Dictionary(
		{"n":  new Point( 0, -1),
			"ne": new Point( 1, -1),
	"e":  new Point( 1,  0),
	"se": new Point( 1,  1),
	"s":  new Point( 0,  1),
	"sw": new Point(-1,  1),
	"w":  new Point(-1,  0),
	"nw": new Point(-1, -1)});


// StupidBug
function StupidBug() {};
StupidBug.prototype.act = function(surroundings) {
	return {type: "move", direction: "s"};
};


// Terrarium
var wall = {};

var creatureTypes = new Dictionary();
creatureTypes.register = function(constructor, character) {
	constructor.prototype.character = character;
	this.store(character, constructor);
}

function elementFromCharacter(character) {
	if (character == " ")
		return undefined;
	else if (character == "#")
		return wall;
	else if (creatureTypes.contains(character))
		return new (creatureTypes.lookup(character))();
	else
		throw new Error("Unkown character: " + character);
}

function Terrarium(plan) {
	var grid = new Grid(plan[0].length, plan.length);
	for (var y = 0; y < plan.length; y++) {
		var line = plan[y];
		for (var x = 0; x < line.length; x++) {
			grid.setValueAt(new Point(x, y), elementFromCharacter(line.charAt(x)));
		}
	}
	this.grid = grid;
}

// BouncingBug
function BouncingBug() {
	this.direction = "ne";
}
BouncingBug.prototype.act = function(surroundings) {
	if(surroundings[this.direction] != " ")
		this.direction = (this.direction == "ne" ? "sw" : "ne");
	return {type: "move", direction : this.direction};
};

creatureTypes.register(BouncingBug, "%");

function DrunkBug() {};
DrunkBug.prototype.act = function(surroundings) {
	return {type: "move", direction: randomElement(directions.names())};
};

creatureTypes.register(DrunkBug, "~");

// characterFromElement
wall.character = "#";
StupidBug.prototype.character = "o";

function characterFromElement(element) {
	if (element == undefined)
		return " ";
	else
		return element.character;
}


// Terrarium.prototype.toString
Terrarium.prototype.toString = function() {
	var characters = [];
	var endOfLine = this.grid.width - 1;
	this.grid.each(function(point, value) {
		characters.push(characterFromElement(value));
		if (point.x == endOfLine)
		characters.push("\n");
	});
	return characters.join("");
};

// Terrarium.prototype.step
Terrarium.prototype.listActingCreatures = function() {
	var found = [];
	this.grid.each(function(point, value) {
		if (value != undefined && value.act)
		found.push({object: value, point: point});
	});
	return found;
};

Terrarium.prototype.listSurroundings = function(center) {
	var result = {};
	var grid = this.grid;
	directions.each(function(name, direction) {
		var place = center.add(direction);
		if (grid.isInside(place))
		result[name] = characterFromElement(grid.valueAt(place));
		else
		result[name] = "#";
	});
	return result;
};

Terrarium.prototype.processCreature = function(creature) {
	var action = creature.object.act(this.listSurroundings(creature.point));
	if (action.type == "move" && directions.contains(action.direction)) {
		var to = creature.point.add(directions.lookup(action.direction));
		if (this.grid.isInside(to) && this.grid.valueAt(to) == undefined)
			this.grid.moveValue(creature.point, to);
	}
	else {
		throw new Error("Unsupported action: " + action.type);
	}
};

Terrarium.prototype.step = function() {
	forEach(this.listActingCreatures(), bind(this.processCreature, this));
};

// bind and method
function bind(func, object) {
	return function(){
		return func.apply(object, arguments);
	};
}

// an alternative method to binding this, more succinct
function method(object, name) {
	return function() {
		object[name].apply(object, arguments);
	};
};

function forEach(array, action) {
	for (var i = 0; i < array.length; i++)
		action(array[i]);
};

function randomInteger(below) {
	return Math.floor(Math.random() * below);
};

function randomElement(array) {
	if (array.length == 0)
		throw new Error("The array is empty.");
	return array[Math.floor(Math.random() * array.length)];
}



/****   ANIMATION        ****/
function clone(object) {
	function OneShotConstructor(){}
	OneShotConstructor.prototype = object;
	return new OneShotConstructor();
}

function LifeLikeTerrarium(plan) {
	Terrarium.call(this, plan);
}

LifeLikeTerrarium.prototype = clone(Terrarium.prototype);
LifeLikeTerrarium.prototype.constructor = LifeLikeTerrarium;

LifeLikeTerrarium.prototype.processCreature = function(creature) {
	var energy, action, self = this;
	function dir() {
		if (!directions.contains(action.direction)) return null;
		var target = creature.point.add(directions.lookup(action.direction));
		if (!self.grid.isInside(target)) return null;
		return target;
	}

	action = creature.object.act(this.listSurroundings(creature.point));

	if (action.type == "move")
		energy = this.creatureMove(creature.object, creature.point, dir());
	else if (action.type == "eat")
		energy = this.creatureEat(creature.object, dir());
	else if (action.type == "photosynthesize")
		energy = -1;
	else if (action.type == "reproduce")
		energy = this.creatureReproduce(creature.object, dir());
	else if (action.type == "wait")
		energy = 0.2;
	else
		throw new Error("Unsupported action: " + action.type);

	creature.energy -= energy;
	if (creature.object.energy <= 0)
		this.grid.setValueAt(creature.point, undefined);
};

LifeLikeTerrarium.prototype.creatureMove = function(creature, from, to) {
	if (to != null && this.grid.valueAt(to) == undefined) {
		this.grid.moveValue(from, to);
		from.x = to.x; from.y = to.y;
	}
	return 1;
};

LifeLikeTerrarium.prototype.creatureEat = function(creature, source) {
	var energy = 1;
	if (source != null) {
		var meal = this.grid.valueAt(source);
		if (meal != undefined && meal.energy) {
			this.grid.setValueAt(source, undefined);
			energy -= meal.energy;
		}
	}
	return energy;
}

LifeLikeTerrarium.prototype.creatureReproduce = function(creature, target) {
	var energy = 1;
	if (target != null && this.grid.valueAt(target) == undefined) {
		var species = characterFromElement(creature);
		var baby = elementFromCharacter(species);
		energy = baby.energy * 2;
		if (creature.energy >= energy)
			this.grid.setValueAt(target, baby);
	}
	return energy;
};

function findDirections(surroundings, wanted) {
	var found = [];
	directions.each(function(name) {
		if (surroundings[name] == wanted)
		found.push(name);
	});
	return found;
}

function Lichen() {
	this.energy = 5;
}

Lichen.prototype.act = function(surroundings) {
	var emptySpace = findDirections(surroundings, " ");
	if (this.energy >= 13 && emptySpace.length > 0)
		return {type: "reproduce", direction: randomElement(emptySpace)};
	else if (this.energy < 20)
		return {type: "photosynthesize"};
	else
		return {type: "wait"};
};

creatureTypes.register(Lichen, "*");

// function LichenEater() {
//   this.energy = 10;
// }
// LichenEater.prototype.act = function(surroundings) {
//   var emptySpace = findDirections(surroundings, " ");
//   var lichen = findDirections(surroundings, "*");
//
//   if (this.energy >= 30 && emptySpace.length > 0)
//     return {type: "reproduce", direction: randomElement(emptySpace)};
//   else if (lichen.length >= 2)
//     return {type: "eat", direction: randomElement(lichen)};
//   else if (emptySpace.length > 0)
//     return {type: "move", direction: randomElement(emptySpace)};
//   else
//     return {type: "wait"};
// };
// creatureTypes.register(LichenEater, "c");

// a more intelligent carnivore
function CleverLichenEater() {
	this.energy = 10;
	this.direction = "ne";
}

CleverLichenEater.prototype.act = function(surroundings) {
	var emptySpace = findDirections(surroundings, " ");
	var lichen  = findDirections(surroundings, "*");

	if (surroundings[this.direction] != " ")
		this.direction = randomElement(emptySpace);

	if (this.energy >= 30 && emptySpace.length > 0)
		return {type: "reproduce", direction: randomElement(emptySpace)};
	else if (lichen.length >= 1)
		return {type: "eat", direction: randomElement(lichen)};
	else if (emptySpace.length > 0)
		return {type: "move", direction: randomElement(emptySpace)};
	else
		return {type: "wait"};
};

creatureTypes.register(CleverLichenEater, "c");


var moodyCave =
["############################",
	"#                     ######",
	"#    ***                **##",
	"#   *##**         **  c  *##",
	"#    ***     c    ##**    *#",
	"#       c         ##***   *#",
	"#                 ##**    *#",
	"#   c       #*            *#",
	"#*          #**       c   *#",
	"#***        ##**    c    **#",
	"#*****     ###***       *###",
	"############################"];

var terrarium = new LifeLikeTerrarium(moodyCave);
for (var i = 0; i < 110; i++) {
	for (var j = 0; j < 20; j++)
		terrarium.step();
	document.write(terrarium);
};

Object.prototype.inherit = function(baseConstructor) {
	this.prototype = clone(baseConstructor.prototype);
	this.prototype.constructor = this;
};

Object.prototype.method = function(name, func) {
	this.prototype[name] = func;
};

function StrangeArray() {}
StrangeArray.inherit(Array);
StrangeArray.method("push", function(value) {
	Array.prototype.push.call(this, value);
	Array.prototype.push.call(this, value);
});

var strange = new StrangeArray();

Object.prototype.create = function() {
	var object = clone(this);
	if (object.construct != undefined)
		object.construct.apply(object, arguments);
	return object;
};

Object.prototype.extend = function(properties) {
	var result = clone(this);
	forEachIn(properties, function(name, value) {
		result[name] = value;
	});
	return result;
}

var Item = {
	construct: function(name) {
		this.name = name;
	},
	inspect: function() {
		console.log("it is ", this.name, ".");
	},
	kick: function() {
		console.log("klunk!");
	},
	take: function() {
		console.log("it is ", this.name, ".");
	}
};

var lantern = Item.create("the brass lantern.");
lantern.kick();

var DetailedItem = Item.extend({
	construct: function(name, details) {
		Item.construct.call(this, name);
		this.details = details;
	},
	inspect: function() {
		console.log("You see ", this.name, ", " + this.details, ".");
	}
});

var giantSloth = DetailedItem.create("the giant sloth", "it is quietly hanging from a tree");
giantSloth.inspect();

var SmallItem = Item.extend({
	kick: function() {
		console.log(this.name, " flies across the room stabbing justin insanely.");
	},
	take: function() {
		// (imagine some code that moves the item to your pocket here)
		console.log("you picked up ", this.name, ".");
	}
});

var pencil = SmallItem.create("the red pencil");
pencil.take();

Object.prototype.isA = function(prototype) {
	function DummyConstructor() {}
	DummyConstructor.prototype = prototype;
	return this instanceof DummyConstructor;
};

function mixInto(object, mixIn) {
	forEachIn(mixIn, function(name, value) {
		object[name] = value;
	});
}

var SmallDetailedItem = clone(DetailedItem);
mixInto(SmallDetailedItem, SmallItem);

var deadMouse = SmallDetailedItem.create("Fred the mouse", "he is dead");
deadMouse.inspect();
deadMouse.kick();

var Monster = Item.extend({
	construct: function(name, dangerous) {
		Item.construct.call(this, name);
		this.dangerous = dangerous;
	},
	kick: function() {
		if (this.dangerous)
			console.log(this.name, "bites your head off.");
		else
			console.log(this.name, "squeaks and runs away.");
	}
});

var DetailedMonster = DetailedItem.extend({
	construct: function(name, description, dangerous) {
		DetailedItem.construct.call(this, name, description);
		Monster.construct.call(this, name, dangerous);
	},
	kick: Monster.kick
});

var giantSloth = DetailedMonster.create(
		"the giant sloth",
		"it is quietly hanging from a tree, muching leaves",
		true);
giantSloth.kick();
