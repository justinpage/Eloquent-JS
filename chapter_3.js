function catRecords(name, birthdate, mother) {
	return { name: name, birth: birthdate, mother: mother};
}

function addCats(set, names, birthdate, mother) {
	for (var i = 0; i < names.length; i++)
		set[names[i]] = catRecords(names[i], birthdate, mother);
}


function deadCats(set, names, deathdate) {
	for (var i = 0; i < names.length; i++)
		set[names[i]].death = deathdate; 
}

function startsWith(string, pattern) {
	return string.slice(0, pattern.length) == pattern;
}

function catNames(paragraph) {
	var colon = paragraph.indexOf(":");
	return paragraph.slice(colon + 2).split(", ");
}

function extractDate(paragraph) {
	function numberAt(start, length) {
		return Number(paragraph.slice(start, start + length));
	}
	return new Date(numberAt(11, 4), numberAt(8, 2) -1, numberAt(5, 2));:1

}

function extractMother(paragraph) {
	var start = paragraph.indexOf("(Mother ") + "(mother ".length;
	var end = paragraph.indexOf(")");
	return paragraph.splice(start, end);
}

function formatDate(date) {
	return date.getDate() + "/" + (date.getMonth() + 1) + "/" + 
		date.getFullYear();
}

function catInfo(date, name) {
	var cat = data[name];
	if(cat == undefined)
		return "No cat by the name of " + name + " is known.";

	var message = name + ", born " + formatDate(cat.birth) + 
		" from mother" + cat.mother;
	if("death" in cat)
		message += ", died " + formatDate(cat.death);
	return message + ".";
}

function oldestCat(data) {
	var oldest = null;
	
	for (var name in data) {
		var cat = data[name];
		if (!("death" in cat) && (oldest == null || oldest.birth > cat.birth))
			oldest = cat;
	}

	if(oldest == null)
		return null;
	else
		return oldest.name;
}

function findCats() {
	var cats = {Spot: catRecords("Spot", new Date(1997, 2, 5), "unknown")};

	function handleParagraph(paragraph) {
		if(startsWith(paragraph, "born")) 
			addCats(cats, catNames(paragraph), extractDate(paragraph), 
					extractMother(paragraph));
		else if (startsWith(paragraph, "died"))
			deadCats(cats, catNames(paragraph), extractDate(paragraph));
	}

	for (var mail = 0; mail < ARCHIVE.length; mail++) {
		var paragraphs = ARCHIVE[mail].split("\n");
		for(var i = 0; i < paragraphs.length; i++)
			handleParagraph(paragraphs[i]);
	}

	return cats;
}

var howMany = 0;
for (var cat in findLivingCats())
	howMany++;
console.log("There are currently ", howMany, " cats alive.");
