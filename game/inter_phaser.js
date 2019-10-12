function InterPhaser(phaser, levelConfig, eventHandler) {
	this.phaser = phaser;
	this.levelConfig = levelConfig;
	this.eventHandler = eventHandler;

	this.width = Math.min(window.innerWidth, window.innerHeight * WH_RATIO)
	this.height = this.width / WH_RATIO
	this.scalingFactor = this.width / SCALING_FACTOR_DIV

	this.levelConfig.objects = this.levelConfig.objects.concat(COMMON_OBJECTS);
	this.initLevel();
	this.setInteractions();
	if (!window.debug) {
		this.showIntro();
	}
};

// Every member variable should be indexed here. Can you tell I prefer typed languages?
// phsr object, indicating the command that the character is executing
InterPhaser.prototype.activeCommand = null;
// number, offsets for the playing field/space that the avatar can move in
InterPhaser.prototype.boardOffsetX = null;
InterPhaser.prototype.boardOffsetY = null;
// height to use. callculated based on width in constructor
InterPhaser.prototype.height = null;
// phsr graphics. Used for debugging purposes
InterPhaser.prototype.graphics = null;
// object containing the level configuration set for each level
InterPhaser.prototype.levelConfig = null;
// boolean, indicates whether the player has reached the maximum number of commands
InterPhaser.prototype.maxedOut = false;
// object with object names as keys, phaser objects/object lists as values
InterPhaser.prototype.objects = {};
// the phaser instance (I think it's actually a scene)
InterPhaser.prototype.phaser = null;
// boolean, indicates the gamestate, i.e. whether the character is executing the commands
InterPhaser.prototype.running = false;
// number, factor to scale all size units by
InterPhaser.prototype.scalingFactor = null;
// number, indicating the stack position that the pointer is hovering over
InterPhaser.prototype.stackIndex = null;
// list of phaser objects representing the commands in the command stack
InterPhaser.prototype.stackObjects = [];
// number, indicating the size of a grid element
InterPhaser.prototype.stepsizeX = null;
InterPhaser.prototype.stepsizeY = null;
// number, indicating the width of the canvas. Should be equal to window.innerWidth except when resizing
InterPhaser.prototype.width = null;

InterPhaser.prototype.showIntro = function() {
	let instructionName = this.levelConfig.levelName.replace('level', 'instruction');
	let instructionModal = Object.create(Modal);
	instructionModal.spawn(instructionName);
}

InterPhaser.prototype.initLevel = function() {
	this.stepsizeX = this.w(BOARD_STEPSIZE_X);
	this.stepsizeY = this.h(BOARD_STEPSIZE_Y);
	this.boardOffsetX = this.w(BOARD_OFFSET_X);
	this.boardOffsetY = this.h(BOARD_OFFSET_Y);

	// Set static objects
	let backgroundName = 'background' + this.levelConfig.levelName.replace(/[A-Za-z]/g, '');
	this.objects.background = this.phaser.add.image(0, 0, backgroundName).setOrigin(0, 0);
	this.objects.background.name = 'background';
	this.objects.background.setDisplaySize(this.width, this.height);

	let maxCommands = this.levelConfig.maxCommands;
	OBJECT_CONF.stepcount_total.spriteID = maxCommands.toString();
	this.objects.stepcount_total = this.setGameObject(OBJECT_CONF.stepcount_total, 'stepcount_total');

	this.setDynamicObjects();
}

InterPhaser.prototype.setDynamicObjects = function() {
	let objects = this.objects;

	for (let objectName of INIT_OBJECTS) {
		if (!this.hasObject(objectName)) { continue; }
		let objConfig = OBJECT_CONF[objectName];

		// normal objects
		if (OBJECTS_MULTIPLE.indexOf(objectName) === -1) {
			objects[objectName] = this.setGameObject(objConfig, objectName);
			objects[objectName].name = objectName;

		} else { // draggable commands can have multiple versions
			objects[objectName] = {};
			let objectRef = objectName + '-' + 0;
			let object = this.setGameObject(objConfig, objectRef);
			object.setData('i', 0);
			objects[objectName][0] = object;
		}
	}

	if (this.levelConfig.spaceType === TYPE_SPACE_GRID && this.hasObject('questionmark')) {
		let questionmarkCoords = Utils.strToCoord(this.levelConfig.goalPosition);
		objects.questionmark.x += this.boardOffsetX;
		objects.questionmark.y += this.boardOffsetY;
		objects.questionmark.x += this.stepsizeX * questionmarkCoords.x;
		objects.questionmark.y += this.stepsizeY * questionmarkCoords.y;
	}

	let me = this;
	objects.execute.on('pointerdown', function (pointer) {
		this.setTint(0xff0000);
		if (me.stackObjects.length === 0) return;

		let repr = me.getStackRepresentation();
		me.eventHandler(PHASER_STACK_START, { stack: repr });
		me.running = true;
	});

	objects.reset.on('pointerdown', this.resetLevel.bind(this));

	objects.backButton.on('pointerdown', this.showIntro.bind(this));

	this.updateOssiePos(this.levelConfig.initPosition);
}

InterPhaser.prototype.setGameObject = function(config, id) {
	let scaling = (config.scaling || 1) * this.scalingFactor;
	let objectName = id.split('-')[0];

	let gameObject = this.phaser.add.sprite(0, 0, config.spriteID);
	gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling);

	// we need to draw numbers for the amount of repeats for forX and degrees for turnDegrees
	if (objectName === 'for_x' || objectName === 'turndegrees') {
		// SO this is a bit weird, we're replacing the gameObject with a container containing the gameObject.
		// This is so that we can treat the container like an object, so it will take the number with it when dragging
		let container = this.phaser.add.container(0, 0, [gameObject]);
		container.setSize(gameObject.displayWidth, gameObject.displayHeight);
		gameObject = container;
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
		let offsetX = config.offsetX * (BASE_SIZE_X / this.displayWidth);
		let offsetY = config.offsetY * (BASE_SIZE_Y / this.displayHeight);
		gameObject.x = this.w(config.offsetX);
		gameObject.y = this.h(config.offsetY);
	}
	if (config.depth !== undefined) {
		gameObject.setDepth(config.depth);
	}
	if (config.interactive === true || config.draggable === true) {
		gameObject.setInteractive();
	}
	if (config.draggable === true) {
		this.phaser.input.setDraggable(gameObject);
	}

	return gameObject;
}

InterPhaser.prototype.resetLevel = function() {
	if (window.modalVisible) { return }

	console.log("restarting level")
	this.eventHandler(PHASER_STACK_RESET);
	this.activeCommand = null;
	this.stackIndex = null;
	this.running = false;
	this.maxedOut = false;

	// Lots of prior knowledge here, not really nice. Maybe move to a config, i.e. resettableObjects = []
	for (let objectName of INIT_OBJECTS) {
		if (this.objects[objectName] === undefined) { continue }
		console.log('resetting object', objectName);
		if (OBJECTS_MULTIPLE.indexOf(objectName) === -1) {
			let object = this.objects[objectName];
			if (object !== undefined) {
				if (Utils.isBracketObject(object) && this.stackObjects.indexOf(object) > -1) {
					this.clearBracketObject(object);
				}
				object.destroy();
			}
		} else {
			for (let objectKey in this.objects[objectName]) {
				let object = this.objects[objectName][objectKey];
				if (object === undefined || object.scene === undefined) { continue; }

				if (Utils.isBracketObject(object) && this.stackObjects.indexOf(object) > -1) {
					this.clearBracketObject(object);
				}

				object.destroy();
			}
		}
		this.objects[objectName] = undefined;
	}
	delete this.stackObjects;
	this.stackObjects = [];

	// Cleaned up old data, now we need to reinitialize. That's easy:
	this.setDynamicObjects();
	// this.setInteractions();
}

InterPhaser.prototype.setInteractions = function() {
	// ================================================================
	// PREPARING DEFAULT GAME INTERACTIONS
	// ================================================================
	let myself = this
	let phsr = this.phaser;
	let pOjs = this.objects;

	// this.renderDropZone();
	this.stackPos = { x: this.w(STACK_ZONE_POS_X), y: this.h(STACK_ZONE_POS_Y) };

	// ================================================================
	// handle click events for different buttons
	// ================================================================
	let firstDrag = true;
	let newDrag = false

	let fastClickTimeout = null;
	let fastClick = false;
	phsr.input.on('gameobjectdown', function(pointer, gameObject) {
		if (myself.running === true) { return; }
		// Only allow command objects to be dragged
		if (gameObject.getData('commandID') === undefined) { return }
		fastClick = true;
		clearTimeout(fastClickTimeout);
		fastClickTimeout = setTimeout(function() {
			fastClick = false;
		}, 300);

		newDrag = true;
		firstDrag = true;
		phsr.input.setDefaultCursor('grabbing');
	});

	phsr.input.on('drag', function (pointer, gameObject, dragX, dragY) {
		if (myself.running === true) { return }
		if (firstDrag) {
			// First drag event doesn't count, as it fires on initial mouse click without any movement
			return firstDrag = false;
		}
		if (newDrag) {
			let canHaveMultiple = OBJECTS_MULTIPLE.indexOf(gameObject.name) > -1;
			// Drag/remove command from the command queue
			if (myself.inDropZone(pointer)) {
				myself.removeFromStack(gameObject);

			} else if (!myself.maxedOut && canHaveMultiple) {
				// Dragging from original position, so create another one under the hood
				myself.duplicateObject(gameObject);
			}
			newDrag = false;
			fastClick = false;
		}

		gameObject.setDepth(3);

		gameObject.x = dragX;
		gameObject.y = dragY;

		if (myself.inDropZone(pointer)) {
			myself.positionCommands(pointer);
		}
	});

	phsr.input.on('dragend', function (pointer, gameObject, dropped) {
		if (myself.running === true) { return }
		myself.clearHoverTexture(gameObject);
		gameObject.setDepth(2);
		newDrag = false;
		phsr.input.setDefaultCursor('default');

		if (fastClick) {
			return myself.fastClick(pointer, gameObject);
		}

		let shouldDrop = myself.inDropZone(pointer) && !pointer.isDown;
		if (!myself.maxedOut && shouldDrop) {
			return myself.dropObjectOnStack(gameObject);
		}
		if (myself.maxedOut) { return; }

		myself.positionCommands();
		if (OBJECTS_MULTIPLE.indexOf(gameObject.name) > -1) {
			// Dragged outside of drop zone -> delete this object
			myself.objects[gameObject.name][gameObject.getData('i')] = undefined;
			gameObject.destroy();
		} else {
			// Don't delete object if there is only one (i.e. open/close)
			let conf = OBJECT_CONF[gameObject.name];
			gameObject.x = myself.w(conf.offsetX);
			gameObject.y = myself.h(conf.offsetY);
		}
	});

	phsr.input.on('pointerover', function (event, gameObjectList) {
		let object = gameObjectList[0];
		if (object !== undefined) {
			myself.setHoverTexture(object);
		}
	});

	phsr.input.on('pointerout', function (event, gameObjectList) {
		if (gameObjectList.length > 0) {
			myself.clearHoverTexture(gameObjectList[0]);
		}
	});
}

// Helpers for converting height/width units to pixel values
InterPhaser.prototype.h = function(heightInUnits) { return this.height * heightInUnits }
InterPhaser.prototype.w = function(widthInUnits) { return this.width * widthInUnits }

// Used to make a new command in the command area to replace the one that the user is dragging
InterPhaser.prototype.duplicateObject = function(gameObject) {
	let newObjectI = gameObject.getData('i') + 1;
	let newObjectRef = gameObject.name + '-' + newObjectI.toString();
	let newObject = this.setGameObject(OBJECT_CONF[gameObject.name], newObjectRef);
	newObject.setData('i', newObjectI);
	this.objects[gameObject.name][newObjectI] = newObject;
}

InterPhaser.prototype.setHoverTexture = function(gameObject) {
	if (gameObject.scene === undefined) { return }
	let objConfig = OBJECT_CONF[gameObject.name];
	if (objConfig === undefined || gameObject.getData('hover')) { return }

	gameObject.setData('hover', true);
	this.phaser.input.setDefaultCursor('pointer');
	let hoverTexture = gameObject.texture ? gameObject.texture.key + "-hover" : '';

	if (SPRITE_PATHS[hoverTexture] === undefined) {
		let newScale = (objConfig.scaling || 1) * HOVER_SCALING * this.scalingFactor;
		gameObject.setScale(newScale);
		return;
	}

	gameObject.setTexture(hoverTexture);
}

InterPhaser.prototype.clearHoverTexture = function(gameObject) {
	let objConfig = OBJECT_CONF[gameObject.name];
	if (objConfig === undefined || !gameObject.getData('hover')) { return }

	gameObject.setData('hover', false);
	this.phaser.input.setDefaultCursor('default');

	if (!gameObject.texture || gameObject.texture.key.indexOf('hover') === -1) {
		let newScale = (objConfig.scaling || 1) * this.scalingFactor;
		gameObject.setScale(newScale);
		return;
	}
	let newTexture = gameObject.texture.key.replace('-hover', '');

	if (gameObject.scene === undefined) return; // is being deleted
	gameObject.setTexture(newTexture);

}
InterPhaser.prototype.fastClick = function(pointer, gameObject) {
	this.stackIndex = null;
	let inDropZone = this.inDropZone(pointer)

	// fastClick in DropZone to ask for new input for numbers
	if (inDropZone && OBJECTS_NUMBERCOMMAND.indexOf(gameObject.name) > -1) {
		return this.askCounts(gameObject);
	}
	if (inDropZone || this.maxedOut) { return }

	// Add command to stack
	this.dropObjectOnStack(gameObject);
	if (OBJECTS_MULTIPLE.indexOf(gameObject.name) > -1) {
		this.duplicateObject(gameObject);
	}
}
//  Just a visual display of the drop zone
InterPhaser.prototype.renderDropZone = function() {
	if (this.graphics === null) {
		this.graphics = this.phaser.add.graphics();
		this.graphics.lineStyle(2, 0xffff00);
	}
	this.graphics.strokeRect(
		this.w(BOARD_OFFSET_X),
		this.h(BOARD_OFFSET_Y),
		this.w(BOARD_STEPSIZE_X * 8),
		this.h(BOARD_STEPSIZE_Y * 5)
	);
	this.graphics.strokeRect(
		this.w(BOARD_OFFSET_X),
		this.h(BOARD_OFFSET_Y),
		this.w(BOARD_STEPSIZE_X),
		this.h(BOARD_STEPSIZE_Y)
	);
}

InterPhaser.prototype.inDropZone = function(location) {
	return (
		location.x > this.w(STACK_ZONE_POS_X)
		&& location.x < this.w(STACK_ZONE_POS_X + STACK_ZONE_WIDTH)
		&& location.y > this.h(STACK_ZONE_POS_Y)
		&& location.y < this.h(STACK_ZONE_POS_Y + STACK_ZONE_HEIGHT)
	);
}

InterPhaser.prototype.dropObjectOnStack = function(gameObject) {
	console.log('Drop object', gameObject, 'stackIndex:', this.stackIndex, 'stackObjects', this.stackObjects);

	// First input the amount for commands that require it
	let command = gameObject.getData('command');
	let askForCounts = command.counts === null || command.degrees === null;
	if (askForCounts) {
		result = this.askCounts(gameObject);
		if (result === false) {
			// user cancelled input
			delete this.objects[command.objectRef];
			gameObject.destroy();
			return this.positionCommands();
		}
	}

	// Add object to internal InterPhaser stack
	this.stackIndex = this.stackIndex !== null ? this.stackIndex : this.stackObjects.length;
	this.stackObjects.splice(this.stackIndex, 0, gameObject);

	let isBracketObject = Utils.isBracketObject(gameObject);
	if (isBracketObject) {
		this.insertBrackets(gameObject);
	}

	this.positionCommands();
	this.updateStepcount();
}

InterPhaser.prototype.askCounts = function(gameObject) {
	let command = gameObject.getData('command');
	let askForX = command.counts !== undefined;
	let msg = askForX ? 'Hoe vaak herhalen?' : 'Hoeveel graden?';

	let promptForInput = function(wrongInput) {
		let question = wrongInput ? 'Er is iets fout gegaan. Heb je een getal ingevoerd? \n \n' + msg : msg;
		let result = window.prompt(question, 'Voer een getal in');
		if (result === null) { return false; } // Cancel

		let counts = parseInt(result, 10);
		if (!isNaN(counts) && counts < 1000 && counts > -1000) {
			return counts;
		}
		return promptForInput(true);
	}

	let result = promptForInput();
	if (result === false) { return false }

	let key = askForX ? 'counts' : 'degrees';
	command[key] = result;
	this.renderNumber(gameObject, result);
	return true;
}

InterPhaser.prototype.positionCommands = function(pointer) {
	this.stackIndex = null;
	let bracketIndent = this.h(STACK_BRACKET_INDENT);
	let bracketTopOffset = this.h(STACK_BRACKET_OFFSET);
	let bracketSpacing = this.h(STACK_BRACKET_SPACING);
	let commandSpacing = this.h(STACK_COMMAND_SPACING);
	let avgCommandSize = this.h(STACK_AVG_CMD_SIZE);
	let stackX = this.w(STACK_ZONE_POS_X);
	let stackY = this.h(STACK_ZONE_POS_Y) + avgCommandSize;

	for (let i in this.stackObjects) {
		let object = this.stackObjects[i];

		// Set height for the object
		object.y = object.name === 'bracketSide' ? stackY : stackY + object.displayHeight / 2;
		if (object.name === 'bracketBottom') {
			var bracketSide = this.objects['bracketSide-for:' + object.getData('blockRef')];
			let heightDiff = object.y - bracketSide.y;
			if (heightDiff < avgCommandSize) {
				object.y += avgCommandSize;
			}
		}
		if (object.name === 'bracketBottom' || object.name === 'close') {
			stackX -= bracketIndent;
		}
		object.x = stackX + (object.width / 2);

		// See if we should add temporary space around the pointer
		let bracketSideOrTop = object.name === 'bracketSide' || object.name === 'bracketTop';
		let tryTempSpace = this.stackIndex === null && pointer !== undefined && !bracketSideOrTop;
		if (tryTempSpace && pointer.y < object.y) {
			this.stackIndex = parseInt(i, 10); // WHY THE FFFFFFFF IS THIS A STRING???
			object.y += avgCommandSize;
		}

		// Determine the position for the next item
		switch (object.name) {
			case 'bracketTop':
				stackY = stackY + bracketTopOffset;
				break;
			case 'bracketSide':
				stackX += bracketIndent;
				stackY = object.y + bracketSpacing;
				break;
			case 'bracketBottom':
				// Scaling of bracket side
				heightDiff = (object.y + object.displayHeight / 2) - bracketSide.y;
				let newScale = heightDiff / bracketSide.displayHeight;
				bracketSide.scaleY = Math.max(0.2, newScale);
				bracketSide.scaleX = Math.max(0.5, Math.min(0.8, newScale));
				bracketSide.x = bracketSide.x - Math.min(10, 13 * newScale);
				bracketSide.y += heightDiff / 2;

				stackY = object.y + object.displayHeight / 2 + bracketSpacing;
				break;
			case 'for':
			case 'for_x':
			case 'for_till':
				stackY = (object.y + object.displayHeight / 2) - this.h(0.002);
				break;
			case 'open':
				stackX += bracketIndent;
			default:
				stackY = object.y + (object.displayHeight / 2) + commandSpacing;
		}
	}
}

/**
* Position the for command and the corresponding bracket in the commandzone
*/
InterPhaser.prototype.insertBrackets = function(gameObject) {
	let insertIn = this.stackIndex + 1;
	for (let objectName of ['bracketBottom', 'bracketSide', 'bracketTop']) {
		let objID = objectName + '-for:' + gameObject.getData('objectRef');
		let object = this.setGameObject(OBJECT_CONF[objectName], objID);
		this.objects[objID] = object;
		this.stackObjects.splice(insertIn, 0, object);

		if (objectName === 'bracketBottom') {
			object.setData('blockRef', gameObject.getData('objectRef'));
		}
	}
}

InterPhaser.prototype.clearBracketObject = function(bracketObject) {
	let commandRef = bracketObject.getData('objectRef');
	let deleteStart = this.stackObjects.indexOf(bracketObject) + 1;
	let bracketItems = ['bracketBottom', 'bracketSide', 'bracketTop'];
	let i;
	for (i=deleteStart; i < this.stackObjects.length; i++) {
		let object = this.stackObjects[i];
		let selfRef = object.getData('objectRef');
		let blockRef = object.getData('blockRef');

		let permDelete = bracketItems.indexOf(object.name) > -1 || OBJECTS_MULTIPLE.indexOf(object.name) > -1;
		if (object.scene !== undefined && permDelete) {
			object.destroy();
			delete this.objects[selfRef];
		}
		if (blockRef === commandRef) { break; }
	}
	this.stackObjects.splice(deleteStart, 1 + i - deleteStart);
}

InterPhaser.prototype.removeFromStack = function(object) {
	let objectIndex = this.stackObjects.indexOf(object);
	if (objectIndex !== -1) {
		if (Utils.isBracketObject(object)) {
			this.clearBracketObject(object);
		}
		this.stackObjects.splice(objectIndex, 1);
		this.positionCommands();
		this.updateStepcount();
	}
}

InterPhaser.prototype.updateStepcount = function() {
	let stepCounter = this.objects.stepcount;
	let lastStackObject = this.stackObjects.slice(-1)[0];
	let commandTotal = this.stackObjects.reduce(function(counter, stackObject) {
		let commandID = stackObject.getData('commandID');
		let isCommand = commandID !== undefined && commandID !== 'blockend';
		return isCommand ? counter + 1 : counter;
	}, 0);

	let newTexture = commandTotal.toString();
	stepCounter.setTexture(newTexture);

	this.maxedOut = commandTotal >= this.levelConfig.maxCommands;
}

// Convert the InterPhaser stacklist to a representation that the ossiegame stack can work with nicely.
// startindex is optional.
InterPhaser.prototype.getStackRepresentation = function() {
	let stack = this.stackObjects;
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
	}.bind(this);
	// Init with 0 to start at the top of command stack
	return stackRepresentationInner(0);
}

InterPhaser.prototype.hasObject = function(objectName) {
	return this.levelConfig.objects.indexOf(objectName) >= 0
}

InterPhaser.prototype.fail = function() {
	this.running = false;
	let modal = Object.create(Modals.FailModal);
	modal.spawn();
	this.updateCurrentCommand();
}
/**
* displays a victory image on screen when victory event is fired
*/
InterPhaser.prototype.win = function() {
	let me = this;
	let callback = function () {
		me.resetLevel();
	}
	let modal = Object.create(Modals.WinModal);
	modal.spawn(this.levelConfig.levelName, callback);
}

InterPhaser.prototype.updateOssiePos = function(ossiePos) {
	let player = this.objects.player
	playerConfig = OBJECT_CONF.player

	if (this.levelConfig.spaceType === TYPE_SPACE_GRID) {
		let ossieCoords = Utils.strToCoord(ossiePos.nodeLocation);
		player.x = this.boardOffsetX + (this.stepsizeX * ossieCoords.x);
		player.y = this.boardOffsetY + (this.stepsizeY * ossieCoords.y);
	} else {
		let coordX = ossieCoords.x * this.w(BASE_SIZE_X);
		let coordY = ossieCoords.y * this.h(BASE_SIZE_Y);
		player.x = this.boardOffsetX + coordX;
		player.y = this.boardOffsetY + coordY;
	}
	if (this.levelConfig.orientationType === TYPE_ORIENTATION_CARDINALS) {
		player.angle = Utils.cardinalToAngle(ossiePos.orientation);
	} else {
		player.angle = ossiePos.orientation - 90;
	}
}

InterPhaser.prototype.onCommandExecute = function(commandReference) {
	let [commandName, commandI] = commandReference.split('-');
	let isMultiple = OBJECTS_MULTIPLE.indexOf(commandName) !== -1;
	let commandObject = isMultiple ? this.objects[commandName][commandI] : this.objects[commandName];
	if (!Utils.isBracketObject(commandObject)) {
		this.updateCurrentCommand(commandObject);
	}
}

InterPhaser.prototype.updateCurrentCommand = function(commandObject) {
	let activeCommand = this.activeCommand;
	// Reset texture of previous activeCommand
	if (activeCommand && activeCommand.scene && !Utils.isBracketObject(activeCommand)) {
		// .add exists for phaser groups, I think
		let sprite = activeCommand.add !== undefined ? activeCommand.getAt(0) : activeCommand;
		sprite.setTexture(OBJECT_CONF[activeCommand.name].spriteID);
		this.positionCommands();
	}

	this.activeCommand = commandObject;

	if (commandObject === undefined) { return }

	// Show custom "current" sprite if applicable.
	// The command is a container if it has numbers (turnDegrees), so we need to get the sprite from it
	let sprite = commandObject.add !== undefined ? commandObject.getAt(0) : commandObject;
	let crntTexture = sprite.texture.key + '-crnt';
	if (SPRITE_PATHS[crntTexture] !== undefined) {
		sprite.setTexture(crntTexture);
		this.positionCommands(); // texture has different size, so realign the stack
	}
}

// Render number for commands that need it (forX, turnDegrees)
InterPhaser.prototype.renderNumber = function(object, num) {
	object.each(function(sprite) {
		if (sprite.name.indexOf('number') > -1) {
			object.remove(sprite, true, true);
		}
	})
	let config = OBJECT_CONF[object.name];
	let numX = this.w(config.numOffsetX);
	let numY = this.h(config.numOffsetY);
	let numSpacing = this.w(NUM_SPACING);
	// get array of decreasing order of magnitude (-123 > ['3','2','1','-'])
	let numParts = num.toString().split('').reverse();
	for (let numI in numParts) {
		let numberObj = this.phaser.add.sprite(numX - (numSpacing * numI), numY, numParts[numI]).setScale(NUM_SCALING);
		numberObj.name = 'number' + numI;
		object.add(numberObj);
	}
}
