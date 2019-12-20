if (typeof Utils === "undefined") {
	Utils = {};
}

// Makes deep copy of whatever object is inside.
// WARNING!! Does NOT check for self-references/loops or check if property is a
// prototype property
Utils.deepCopy = function(object) {
	if (object === null) { return null }

	let result = {};
	// array
	if (object.length !== undefined) {
		result = [];
		for (let item of object) {
			let newItem = (typeof item == 'object') ? Utils.deepCopy(item) : item;
			result.push(newItem)
		}
		return result;
	}

	for (let key in object) {
		let item = object[key];
		let newItem = (typeof item == 'object') ? Utils.deepCopy(item) : item;
		result[key] = newItem;
	}
	return result;
}
