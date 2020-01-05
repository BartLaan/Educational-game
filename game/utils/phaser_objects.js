if (typeof Utils === "undefined") {
	Utils = {};
}

// Helpers for converting height/width units to pixel values
Utils.h = function(heightInUnits) { return window.gameHeight * heightInUnits }
Utils.w = function(widthInUnits) { return window.gameWidth * widthInUnits }

Utils.setGameObject = function(phaser, config, id) {
	let scaling = (config.scaling || 1) * window.gameScale;
	let objectName = id.split('-')[0];

	let gameObject = phaser.add.sprite(0, 0, config.spriteID);

	// we need to draw numbers for the amount of repeats for forX and degrees for turnDegrees
	if (objectName === 'for_x' || objectName === 'turndegrees') {
		// SO this is a bit weird, we're replacing the gameObject with a container containing the gameObject.
		// This is so that we can treat the container like an object, so it will take the number with it when dragging
		let container = phaser.add.container(0, 0, [gameObject]);
		container.setSize(gameObject.width, gameObject.height);
		container.setScale(scaling);
		gameObject = container;
	} else {
		gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling);
	}
	gameObject.setData('objectRef', id);
	gameObject.name = objectName;


	if (config.command !== undefined) {
		let commandObject = Utils.deepCopy(config.command);
		// This is a command object, we need a reference to itself for when we pass it to the stack
		commandObject.objectRef = id;
		gameObject.setData('command', commandObject);
		gameObject.setData('commandID', config.command.commandID);
	}
	if (config.offsetX !== undefined) {
		let offsetX = config.offsetX * (BASE_SIZE_X / window.gameWidth);
		let offsetY = config.offsetY * (BASE_SIZE_Y / window.gameHeight);
		gameObject.x = Utils.w(config.offsetX);
		gameObject.y = Utils.h(config.offsetY);
	}
	if (config.depth !== undefined) {
		gameObject.setDepth(config.depth);
	}
	if (config.interactive === true || config.draggable === true) {
		gameObject.setInteractive();
	}
	if (config.draggable === true) {
		phaser.input.setDraggable(gameObject);
	}

	return gameObject;
}

// This should probably be moved to somewhere else, but is common to ossieGame/interPhaser
Utils.isBracketObject = function(gameObject) {
	if (typeof gameObject !== 'string') {
		return gameObject.getData !== undefined && BRACKET_OBJECTS.indexOf(gameObject.getData('commandID')) > -1;
	}
	return BRACKET_OBJECTS.indexOf(gameObject) > -1;
}

// Render number for commands that need it (forX, turnDegrees)
Utils.renderNumber = function(phaser, object, num) {
	object.each(function(sprite) {
		if (sprite.name.indexOf('number') > -1) {
			object.remove(sprite, true, true);
		}
	})
	let config = OBJECT_CONF[object.name];
	let numX = Utils.w(config.numOffsetX);
	let numY = Utils.h(config.numOffsetY);
	let numSpacing = Utils.w(NUM_SPACING);
	// get array of decreasing order of magnitude (-123 > ['3','2','1','-'])
	let numParts = num.toString().split('').reverse();
	for (let numI in numParts) {
		let numberObj = phaser.add.sprite(numX - (numSpacing * numI), numY, numParts[numI]).setScale(NUM_SCALING);
		numberObj.name = 'number' + numI;
		object.add(numberObj);
	}
}

Utils.animateMovement = function(object, newCoords, duration) {
	let existingAnimation = object.getData('animatedMovement');
	if (existingAnimation !== undefined) {
		clearInterval(existingAnimation);
	}

	let frameDuration = 1000 / ANIMATION_FPS;
	let frameAmount = Math.ceil(duration / frameDuration);

	let stepX = (newCoords.x - object.x) / frameAmount;
	let stepY = (newCoords.y - object.y) / frameAmount;
	let moveRight = object.x < newCoords.x;
	let moveDown = object.y < newCoords.y;
	let origPosX = object.x;

	let interval = setInterval(function() {
		let potentialNewX = object.x + stepX;
		let overShootX = moveRight
			? potentialNewX > newCoords.x
			: potentialNewX < newCoords.x;

		let potentialNewY = object.y + stepY;
		let overShootY = moveDown
			? potentialNewY > newCoords.y
			: potentialNewY < newCoords.y;

		if (overShootX || overShootY) {
			object.x = newCoords.x;
			object.y = newCoords.y;
			clearInterval(interval);
			return;
		}
		object.x = potentialNewX;
		object.y = potentialNewY;

	}, frameDuration);
	object.setData('animatedMovement', interval);
}
