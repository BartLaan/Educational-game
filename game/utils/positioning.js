if (typeof Utils === "undefined") {
	Utils = {};
}

Utils.cardinalToAngle = function(cardinal) {
	let cardinals = ['east', 'south', 'west', 'north'];
	let result = cardinals.indexOf(cardinal);
	if (result !== -1) {
		return result * 90;
	} else {
		console.error('Error trying to get degrees from', cardinal);
		return -1;
	}
}

// Turn the orientation clockwise if clockWise is true, otherwise counterclockwise. Should only be used with cardinals
Utils.turnClock = function(orientation, clockWise) {
	if (typeof orientation === 'number') {
		return Utils.turnDegrees(orientation, (clockWise ? 90 : -90));
	}
	let cardinals = ['north', 'east', 'south', 'west'];
	let shift = clockWise ? 1 : cardinals.length - 1; // 3 = -1 when doing modulo operation

	let orientationIdx = cardinals.indexOf(orientation);
	let newOrientationIdx = (orientationIdx + shift) % (cardinals.length);

	return cardinals[newOrientationIdx];
}

Utils.turnDegrees = function(initDegrees, addDegrees) {
	let newOrientation = (initDegrees + addDegrees) % 360;
	if (newOrientation < 0) {
		newOrientation += 360;
	}

	return newOrientation;
}
