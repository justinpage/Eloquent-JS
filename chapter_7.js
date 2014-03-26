function forEachIn(object, action) {
	for (var property in object) {
		if (Object.prototype.hasOwnProperty.call(object, property))
			action(property, object[property]);
	}
};

function provide(values) {
	forEachIn(values, function(name, value) {
		window[name] = value;
	});
};

(function() {
	var names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	provide({
		getMonthName: function(number) { return names[number];},
		getMonthNumber: function(name) {
			for (var number = 0; number < names.length; number++) {
				if (names[number] == name) return number;
			}
		}
	});
})();

var days = (function() {
	var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	return {
		getDayName: function(number) { return names[number];},
		getDayNumber: function(name) {
			for (var number = 0; number < names.length; number++) {
				if (names[number] == name) return number;
			}
		}
	};
})();

// optional arguments in args: { compare, start, end}
function positionOf(element, array, args) {
	args = args || {};
	var start = (args.start === null ? 0 : args.start),
		end = (args.end === null) ? array.length : args.end,
		compare = args.compare;

	for (; start < end; start++) {
		var current = array[start];
		if (compare ? compare(element, current) : element == current) return start;
	}
}


