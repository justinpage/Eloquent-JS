function lastElement(array) {
	if (array.length > 0)
		return array[array.length - 1];
	else
		throw "Cannot take the last element of an empty array.";
}

function lastElementPlusTen(array) {
	return lastElement(array) + 10;
}

try {
	console.log(lastElementPlusTen([]));
} catch (error) {
	console.log("Something went wrong: ", error);
}

var InvalidInputError = new Error("Invalid numeric input");

function inputNumber() {
	var input = Number(prompt("Give me a number", ""));
	if(isNaN(input))
		throw InvalidInputError;
	return input;
}

try {
	alert (inputNumber() + 5);
} catch (e) {
	if (e != InvalidInputError)
		throw e;
	alert("You did not input a number. Try again");
}
