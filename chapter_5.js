// Functional programming
// var paragraphs = mailArchive[mail].split("\n");
// for(var i = 0; i < paragraphs.length; i++)
// 	handleParagraph(paragraphs[i]);

	// the following loop can be composed in a far less
	// set of instructions.
/* forEach(mailArchive[mail].split("\n"), handleParagraph); */

function negate(func) {
	return function() {
		return !func.apply(null, arguments);
	};
}
var isNotNan = negate(isNaN);

// the reduce Function
function reduce(combine, base, array) {
	array.forEach(function(element) {
		base = combine(base, element);
	});
	return base;
}

function countZeros(array) {
	function counter(total, element) {
		return total + (element === 0 ? 1 : 0);
	};
	return reduce(counter, 0, array);
}

function add(a, b) {
	return a + b;
}

function sum(numbers) {
	return reduce(add, 0, numbers);
}

function map(func, array) {
	var result = [];
	array.forEach(function(element) {
		result.push(func(element));
	});
	return result;
}


// processParagraph(paragraphs[0]); //{type: "h1", content: "The Book of Programming"}

// map to conviently convert all the paragraphs in the document
// map(processParagraph, RECLUSEFILE.split("\n\n"));
//[{type: "h1", content: "The Book of Programming"}, etc..]

/**********RECLUSE**********/
// var paragraph = RECLUSEFILE.split("\n\n");
// paragraph.length; // 22

function processParagraph(paragraph) {
	var header = 0;
	while (paragraph.charAt(header) == "%")
		header++;
	if(header > 0)
		return {type: "h" + header, content: splitParagraph(paragraph.slice(header + 1))};
	else
		return {type: "p", content: splitParagraph(paragraph)};
}

function splitParagraph(text) {
	function split() {
		var pos = 0, fragments = [];
		while(pos < text.length) {
			if( text.charAt(pos) == "*") {
				var end = findClosing("*", pos + 1);
				fragments.push({type: "emphasized", content: text.slice(pos + 1, end)});
				pos = end + 1;
			}
			else if (text.charAt(pos) == "{") {
				var end = findClosing("}", pos + 1);
				fragments.push({type: "footnote", content: text.slice(pos + 1, end)});
				pos = end + 1;
			}
			else {
				var end = findOpeningOrEnd(pos);
				fragments.push({type: "normal", content: text.slice(pos, end)});
				pos = end;
			}
		}

		return fragments;
	}

	function findClosing(character, from) {
		var end = text.indexOf(character, from);
		if(end == -1) throw new Error("Missing closing '" + character + "'");
		else return end;
	}

	function findOpeningOrEnd(from) {
		function indexOrEnd(character) {
			var index = text.indexOf(character, from);
			return index == -1 ? text.length : index;
		}
		return Math.min(indexOrEnd("*", indexOrEnd("{")));
	}

	return split();
}

function extractFootnotes(paragraphs) {
	var footnotes = [];
	var currentNote = 0;

	function replaceFootnote(fragment) {
		if(fragment.type == "footnote") {
			currentNote++;
			footnotes.push(fragment);
			fragment.number = currentNode;
			return {type: "reference", number: currentNote};
		}
		else {
			return fragment;
		}
	}

	paragraphs.forEach(function(paragraph) {
		paragraph.content = map(replaceFootnote, paragraph.content);
	});

	return footnotes;
}

function tag(name, content, attributes) {
	return {name: name, attributes: attributes, content: content};
}

function link(target, text) {
	return tag("a", [text], {href: target});
}

function htmlDoc(title, bodyContent) {
	return tag("html", [tag("head", [tag("title", [title])]),
			tag("body", bodyContent)]);
}

function escapeHTML(text) {
	var replacements = [[/&/g, "&amp;"], [/"/g, "&quot;"],
		[/</g, "&lt;"], [/>/g, "&gt;"]];
	replacements.forEach(function(replace) {
		text = text.replace(replace[0], replace[1]);
	});

	return text;
}

function renderAttributes(attributes) {
	if (attributes == null) return "";

	var result = [];
	for (var name in attributes)
		result.push(" " + name + "=\"" + escapeHTML(attributes[name]) + "\"");
	return result.join("");
}

function renderHTML(element) {
	var pieces = [];

	function render(element) {
		// text node
		if (typeof element == "string") {
			pieces.push(escapeHTML(element));
		}
		// empty tag
		else if (!element.content || element.content.length == 0) {
			pieces.push("<" + element.name + renderAttributes(element.attributes) + ">");
		}
		// tag with content
		else {
			pieces.push("<" + element.name + renderAttributes(element.attributes) + ">");
			element.content.forEach(render);
			pieces.push("</" + element.name + ">");
		}
	}

	render(element);
	return pieces.join("");
}

function renderFragment (fragment) {
	if (fragment.type == "reference")
		return tag("sup", [link("#footnote" + number, String(number))]);
	else if (fragment.type == "emphasised")
		return tag("em", [fragment.content]);
	else if (fragment.type == "normal")
		return fragment.content;
}

function renderParagraph (paragraph) {
	return tag(paragraph.type, map(renderFragment, paragraph.content));
}

function renderFootnote (footnote) {
	var anchor = tag("a", [], {name: "footnote" + footnote.number});
	var number = "[" + footnote.number + "] ";
	return tag("p", [tag("small", [anchor, number, footnote.content])]);
}

function renderFile(file, title) {
	var paragraphs = map(processParagraph, file.split("\n\n"));
	var footnotes = map(renderFootnote, extractFootnotes(paragraphs));
	var body = map(renderParagraph, paragraphs).concat(footnotes);
	return renderHTML(htmlDoc(title, body));
}

// other functional tricks

var op = {
	"+": function(a,b){return a+b;},
	"==": function(a,b){return a == b;},
	"===": function(a,b){return a  === b;},
	"!": function(a){return !a;},
};


function partial(func) {
	var knownArgs = arguments;
	return function() {
		var realArgs = [];
		for (var i = 1; i < knownArgs.length; i++)
			realArgs.push(knownArgs[i]);
		for(var i = 0; i < arguments.length; i++)
			realArgs.push(arguments[i]);
		return func.apply(null, realArgs);
	}
}
