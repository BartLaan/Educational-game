if (typeof Utils === "undefined") {
	Utils = {};
}

// Convert the InterPhaser stacklist to a representation that the ossiegame stack can work with nicely.
// startindex is optional.
Utils.getStackRepresentation = function(stack) {
	// Recursive inner function
	let stackRepresentationInner = function(startIndex) {
		let result = [];
		let ifObject = undefined;

		for (let i = startIndex; i < stack.length; i++) {
			let object = stack[i];
			let stackItem = object.getData('command');
			if (stackItem) {
				stackItem.stackIndex = i;
			}
			let commandID = object.getData('commandID');

			switch (commandID) {
				case undefined:
					// Bracketside/brackettop
					break;

				case 'blockend':
					// End of this part of the stack, return the results
					return [result, i];

				case 'if':
					ifObject = stackItem.stackIndex;
				case 'else':
					stackItem.blockRef = commandID === 'else' ? ifObject : undefined; // fallthrough of if case
				case 'for':
					let [newStack, newI] = stackRepresentationInner(i + 1); // RECURSION
					stackItem.do = newStack;
					i = newI;

				default:
					result.push(stackItem);
			}
		}

		return result;
	}
	// Init with 0 to start at the top of command stack
	return stackRepresentationInner(0);
}
