function InterPhaser(phaser, levelConfig, eventHandler) {
	this.phaser = phaser;
	this.levelConfig = levelConfig;
	this.eventHandler = eventHandler;

	this.levelConfig.objects = this.levelConfig.objects.concat(COMMON_OBJECTS);
	this.setLevel();
	this.setInteractions();
	if (!window.debug) {
		this.showIntro();
	}
};
InterPhaser.prototype.debug = true;

InterPhaser.prototype.showIntro = function() {
	let instructionName = this.levelConfig.levelName.replace('level', 'instruction');
	let introImage = this.phaser.add.image(0, 0, instructionName);
	Phaser.Display.Align.In.Center(introImage, this.objects.background);
	introImage.setDepth(3);
	let okButton = this.setGameObject(OBJECT_CONF['okButton'], 'okButton');

	okButton.on('pointerdown', function() {
		introImage.destroy();
	});
}

InterPhaser.prototype.setLevel = function() {
	let phsr = this.phaser
	// let height = window.innerHeight
	// let width = window.innerHeight * WH_RATIO
	let height = 786
	let width = 1024
	let scalingfactor = width / SCALING_FACTOR_DIV
	this.height = height
	this.width = width
	this.scalingfactor = scalingfactor

	this.stepsize_horizontal = height * BOARD_STEPSIZE_RELATIVE_TO_HEIGHT
	this.stepsize_vertical = height * BOARD_STEPSIZE_RELATIVE_TO_HEIGHT
	this.boardOffsetX = width * BOARD_OFFSET_X
	this.boardOffsetY = height * BOARD_OFFSET_Y

	// ================================================================
	// PREPARING ASSETS
	// ================================================================

	// Set static objects
	this.objects = {};
	let objects = this.objects;
	this.stackObjects = [];

	let backgroundName = 'background' + this.levelConfig.levelName.replace(/[A-Za-z]/g, '');
	this.objects.background = phsr.add.image(0, 0, backgroundName).setOrigin(0, 0);
	this.objects.background.name = 'background';
	this.objects.background.setDisplaySize(width, height);

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

	if (this.levelConfig.spaceType === TYPE_SPACE_GRID) {
		if (this.hasObject('questionmark')) {
			let questionmarkCoords = Utils.strToCoord(this.levelConfig.goalPosition);
			objects.questionmark.x += this.boardOffsetX;
			objects.questionmark.y += this.boardOffsetY;
			objects.questionmark.x += this.stepsize_horizontal * questionmarkCoords.x;
			objects.questionmark.y += this.stepsize_vertical * questionmarkCoords.y;
		}
	// ELSE ??
	}

	let me = this;
	objects.execute.on('pointerdown', function (pointer) {
		this.setTint(0xff0000);
		if (me.stackObjects === undefined || me.stackObjects.length === 0) return;

		let repr = me.getStackRepresentation();
		me.eventHandler(PHASER_STACK_START, { stack: repr });
		me.running = true;
	});

	objects.execute.on('pointerout', function (pointer) {
		this.clearTint();
	});

	objects.execute.on('pointerup', function (pointer) {
		this.clearTint();
	});

	objects.reset.on('pointerdown', this.resetLevel.bind(this));

	objects.player.setOrigin(0.5);
	this.updateOssiePos(this.levelConfig.initPosition);
}

InterPhaser.prototype.setGameObject = function(config, id) {
	let scaling = (config.scaling || 1) * this.scalingfactor;
	let gameObject = this.phaser.add.sprite(0, 0, config.spriteID).setOrigin(0, 0);
	gameObject.setData('objectRef', id);
	gameObject.name = id.split('-')[0];

	gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling);

	if (config.command !== undefined) {
		let commandObject = Utils.deepCopy(config.command);
		// This is a command object, we need a reference to itself for when we pass it to the stack
		commandObject.objectRef = id;
		gameObject.setData('command', commandObject);
		gameObject.setData('commandID', config.command.commandID);
	}
	if (config.offsetX !== undefined) {
		gameObject.x = config.offsetX * this.width;
		gameObject.y = config.offsetY * this.height;
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
	console.log("restarting level")
	this.eventHandler(PHASER_STACK_RESET);
	this.activeCommand = undefined;
	this.stackIndex = undefined;
	this.running = false;
	this.maxedOut = false;

	// Lots of prior knowledge here: we are
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
	// window.game.scene.stop(this.levelConfig.levelName);
	// window.game.scene.start(this.levelConfig.levelName);
}

InterPhaser.prototype.setInteractions = function() {
	// ================================================================
	// PREPARING DEFAULT GAME INTERACTIONS
	// ================================================================
	let myself = this
	let phsr = this.phaser;
	let pOjs = this.objects;

	let height = this.height;
	let width = this.width;

	// this.renderDropZone();
	this.stackPos = { x: width * STACK_ZONE_POS_X, y: height * STACK_ZONE_POS_Y };

	// ================================================================
	// handle click events for different buttons
	// ================================================================
	let newDrag = false
	this.selectedObject = null;

	let fastClickTimeout = null;
	let fastClick = false;
	phsr.input.on('gameobjectdown', function(pointer, gameObject) {
		if (myself.isRunning === true) { return; }
		// Only allow command objects that are not already in the queue to be added
		if (gameObject.getData('commandID') === undefined || myself.inDropZone(pointer)) { return }

		fastClick = true;
		clearTimeout(fastClickTimeout);
		fastClickTimeout = setTimeout(function() {
			fastClick = false;
		}, 300);
	});
	phsr.input.on('gameobjectup', function(pointer, gameObject) {
		if (fastClick && !myself.maxedOut) {
			myself.stackIndex = undefined;
			if (OBJECTS_MULTIPLE.indexOf(gameObject.name) !== -1) {
				myself.duplicateObject(gameObject);
			}
			myself.dropObjectOnStack(gameObject);
			fastClick = false;
			newDrag = false;
		}
	});

	phsr.input.on('dragstart', function (pointer, gameObject) {
		if (myself.running === true) { return }

		myself.selectedObject = gameObject;
		newDrag = true;

		// Drag/remove command from the command queue
		if (myself.inDropZone(pointer)) {
			myself.removeFromStack(gameObject);
			return;
		}

		let canHaveMultiple = OBJECTS_MULTIPLE.indexOf(gameObject.name) !== -1;
		// Dragging from original position, so create another one under the hood
		if (canHaveMultiple) {
			myself.duplicateObject(gameObject)
		}
	});

	phsr.input.on('drag', function (pointer, gameObject, dragX, dragY) {
		fastClick = false;
		if (myself.running === true) { return }

		gameObject.x = dragX;
		gameObject.y = dragY;
		if (myself.inDropZone(pointer)) {
			myself.positionCommands(pointer);
		}
	});

	phsr.input.on('dragend', function (pointer, gameObject, dropped) {
		if (myself.running === true) { return }
		myself.clearHoverTexture(gameObject);

		if (!pointer.isDown && !myself.maxedOut &&  myself.inDropZone(pointer) && newDrag === true) {
			newDrag = false;
			return myself.dropObjectOnStack(gameObject);
		}
		// Dropped outside of drop zone -> delete this object
		if (OBJECTS_MULTIPLE.indexOf(gameObject.name) !== -1) {
			myself.objects[gameObject.name][gameObject.getData('i')] = undefined;
			gameObject.destroy();
			myself.positionCommands();
		} else {
			let conf = OBJECT_CONF[gameObject.name];
			gameObject.x = myself.width * conf.offsetX;
			gameObject.y = myself.height * conf.offsetY;
		}
		newDrag = false;
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

InterPhaser.prototype.duplicateObject = function(gameObject) {
	let newObjectI = gameObject.getData('i') + 1;
	let newObjectRef = gameObject.name + '-' + newObjectI.toString();
	let newObject = this.setGameObject(OBJECT_CONF[gameObject.name], newObjectRef);
	newObject.setData('i', newObjectI);
	this.objects[gameObject.name][newObjectI] = newObject;
}

InterPhaser.prototype.setHoverTexture = function(gameObject) {
	let objConfig = OBJECT_CONF[gameObject.name];
	if (objConfig === undefined || gameObject.getData('hover')) { return }

	let hoverTexture = gameObject.texture.key + "-hover";

	gameObject.setData('hover', true);
	if (SPRITE_PATHS[hoverTexture] === undefined) {
		let newScale = objConfig.scaling ? HOVER_SCALING * objConfig.scaling : HOVER_SCALING
		gameObject.setScale(newScale);
		return;
	}

	gameObject.setTexture(hoverTexture);
}

InterPhaser.prototype.clearHoverTexture = function(gameObject) {
	let objConfig = OBJECT_CONF[gameObject.name];
	if (objConfig === undefined || !gameObject.getData('hover')) { return }

	gameObject.setData('hover', false);
	if (gameObject.texture.key.indexOf('hover') === -1) {
		let newScale = objConfig.scaling ? objConfig.scaling : (1 / HOVER_SCALING);
		gameObject.setScale(newScale);
		return;
	}
	let newTexture = gameObject.texture.key.replace('-hover', '');

	if (gameObject.scene === undefined) return; // is being deleted
	gameObject.setTexture(newTexture);

}
//  Just a visual display of the drop zone
InterPhaser.prototype.renderDropZone = function() {
	if (this.graphics === undefined) {
		this.graphics = this.phaser.add.graphics();
		this.graphics.lineStyle(2, 0xffff00);
	}
	this.graphics.strokeRect(
		this.width * STACK_ZONE_POS_X,
		this.height * STACK_ZONE_POS_Y,
		this.width * STACK_ZONE_WIDTH,
		this.height * STACK_ZONE_HEIGHT
	);
}

InterPhaser.prototype.inDropZone = function(location) {
	return (
		location.x > this.width * STACK_ZONE_POS_X
		&& location.x < this.width * (STACK_ZONE_POS_X + STACK_ZONE_WIDTH)
		&& location.y > this.height * STACK_ZONE_POS_Y
		&& location.y < this.height * (STACK_ZONE_POS_Y + STACK_ZONE_HEIGHT)
	);
}

InterPhaser.prototype.dropObjectOnStack = function(gameObject) {
	console.log('Drop object', gameObject, 'stackIndex:', this.stackIndex, 'stackObjects', this.stackObjects);

	// First input the amount for commands that require it
	let askForX = gameObject.name === "for_x";
	let askDegrees = gameObject.getData('commandID') === "turnDegrees";
	if (askForX || askDegrees) {
		let result = this.askCounts(askForX ? 'Hoe vaak herhalen?' : 'Hoeveel graden?');
		if (result === false) { return } // user cancelled input

		let key = askForX ? 'counts' : 'degrees';
		gameObject.getData('command')[key] = result;
	}

	// Add object to internal InterPhaser stack
	this.stackIndex = this.stackIndex !== undefined ? this.stackIndex : this.stackObjects.length;
	this.stackObjects.splice(this.stackIndex, 0, gameObject);

	let isBracketObject = Utils.isBracketObject(gameObject);
	if (isBracketObject) {
		this.insertBrackets(gameObject);
	}

	this.positionCommands();
	this.updateStepcount();
}

InterPhaser.prototype.askCounts = function(msg, wrongInput) {
	let question = wrongInput ? 'Er is iets fout gegaan. Heb je een getal ingevoerd? \n \n' + msg : msg;
	let result = window.prompt(question, 'Voer een getal in');
	if (result === false) { return false; }

	let counts = parseInt(result, 10);
	if (counts > 0) {
		return counts;
	} else if (result === null) {
		this.askCounts(msg, false);
	}
	this.askCounts(msg, true)
}

InterPhaser.prototype.positionCommands = function(pointer) {
	this.stackIndex = undefined;
	let bracketIndent = STACK_BRACKET_INDENT * this.height;
	let bracketTopOffset = STACK_BRACKET_OFFSET * this.height;
	let bracketSpacing = STACK_BRACKET_SPACING * this.height;
	let commandSpacing = STACK_COMMAND_SPACING * this.height;
	let avgCommandSize = STACK_AVG_CMD_SIZE * this.height;
	let stackX = STACK_ZONE_POS_X * this.width;
	let stackY = (STACK_ZONE_POS_Y * this.height) + avgCommandSize;

	for (let i in this.stackObjects) {
		let object = this.stackObjects[i];

		object.y = stackY;
		if (object.name === 'bracketBottom') {
			var bracketSide = this.objects['bracketSide-for:' + object.getData('blockRef')];
			let heightDiff = stackY - bracketSide.y;
			if (heightDiff < avgCommandSize) {
				object.y += avgCommandSize;
			}
		}
		if (object.name === 'bracketBottom' || object.name === 'close') {
			stackX -= bracketIndent;
		}
		object.x = stackX;

		let bracketSideOrTop = object.name === 'bracketSide' || object.name === 'bracketTop';
		let tryTempSpace = this.stackIndex === undefined && pointer !== undefined && !bracketSideOrTop;
		if (tryTempSpace && (pointer.y < object.y + (object.height / 2))) {
			this.stackIndex = parseInt(i, 10); // WHY THE FFFFFFFF IS THIS A STRING???
			object.y += avgCommandSize;
		}

		switch (object.name) {
			case 'bracketTop':
				stackY = object.y + bracketTopOffset;
				break;
			case 'bracketSide':
				stackX += bracketIndent;
				stackY = object.y + bracketSpacing;
				break;
			case 'bracketBottom':
				// Scaling of bracket side
				heightDiff = (object.height + object.y) - bracketSide.y;
				let newScale = 1 / (bracketSide.height / heightDiff);
				bracketSide.scaleY = Math.max(0.2, newScale);
				bracketSide.scaleX = Math.max(0.5, Math.min(newScale, 0.8));
				bracketSide.x = bracketSide.x - Math.min(10, -2 + 10 * newScale);

				stackY = object.y + bracketSpacing;
				break;
			case 'for':
			case 'for_x':
			case 'for_till':
				stackY = (object.y + object.height) - 0.002 * this.height;
				break;
			case 'open':
				stackX += bracketIndent;
			default:
				stackY = object.y + object.height + commandSpacing;
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
		return commandID !== undefined && commandID !== 'blockend' ? counter + 1 : counter;
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
		startIndex = startIndex === undefined ? 0 : startIndex;
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
	let loseImage = this.phaser.add.image(0, 0, 'fail');
	Phaser.Display.Align.In.Center(loseImage, this.objects.background);
	loseImage.setDepth(3);
	let okButton = this.setGameObject(OBJECT_CONF['okButton'], 'okButton');

	let me = this;
	okButton.on('pointerdown', function(pointer) {
		loseImage.destroy();
		okButton.destroy();
		if (me.activeCommand !== undefined) {
			me.activeCommand.setTexture(OBJECT_CONF[me.activeCommand.name].spriteID);
		}
	});
}
/**
* displays a victory image on screen when victory event is fired
*/
InterPhaser.prototype.win = function() {
	let victoryImage = this.phaser.add.image(0, 0, 'victory');
	Phaser.Display.Align.In.Center(victoryImage, this.objects.background);
	victoryImage.setDepth(3);

	let me = this;
	setTimeout(function(){
		// add buttons here;
		let nextButton = me.setGameObject(OBJECT_CONF['nextButton'], 'nextButton');
		nextButton.on('pointerdown', function (pointer) {
			window.game.scene.stop(me.levelConfig.levelName);
			let nextLevel = LEVELS[LEVELS.indexOf(me.levelConfig.levelName) + 1];
			if (nextLevel !== undefined) {
				console.log('starting level:', nextLevel);
				window.game.scene.start(nextLevel);
			}
		}, me);

		let againButton = me.setGameObject(OBJECT_CONF['againButton'], 'againButton');
		againButton.on('pointerdown', function () {
			victoryImage.destroy();
			nextButton.destroy();
			againButton.destroy();
			me.resetLevel();
		});
	}, VICTORY_TIMEOUT);
}

InterPhaser.prototype.updateOssiePos = function(ossiePos) {
	let player = this.objects.player
	playerConfig = OBJECT_CONF.player
	player.x = playerConfig.offsetX * this.width;
	player.y = playerConfig.offsetY * this.height;

	if (this.levelConfig.spaceType === TYPE_SPACE_GRID) {
		let ossieCoords = Utils.strToCoord(ossiePos.nodeLocation);
		player.x += this.boardOffsetX + (this.stepsize_horizontal * ossieCoords.x);
		player.y += this.boardOffsetY + (this.stepsize_vertical * ossieCoords.y);
	} else {
		// ???
	}
	if (this.levelConfig.orientationType === TYPE_ORIENTATION_CARDINALS) {
		player.angle = Utils.cardinalToAngle(ossiePos.orientation);
	} else {
		player.angle = ossiePos.orientation - 90;
	}
}

InterPhaser.prototype.isOnConfirmButton = function(pointer) {
	let confirmRangeMinX = this.width * CONFIRM_POS_X;
	let confirmRangeMinY = this.width * CONFIRM_POS_Y;
	return (
		pointer.x >= confirmRangeMinX
		&& pointer.x <= this.width * CONFIRM_WIDTH + confirmRangeMinX
		&& pointer.y >= confirmRangeMinY
		&& pointer.y <= this.width * CONFIRM_HEIGHT + confirmRangeMinY
	);
}
InterPhaser.prototype.onCommandExecute = function(commandID) {
	this.executingCommand = true;
	let [commandName, commandI] = commandID.split('-');
	let isMultiple = OBJECTS_MULTIPLE.indexOf(commandName) !== -1;
	let commandObject = isMultiple ? this.objects[commandName][commandI] : this.objects[commandName];
	// clear color of previous command if applicable
	if (this.activeCommand !== undefined) {
		this.activeCommand.setTexture(OBJECT_CONF[this.activeCommand.name].spriteID);
	}
	this.activeCommand = commandObject;

	// color the current command if it is not the repeat command
	if (Utils.isBracketObject(commandObject)) {
		let crntTexture = OBJECT_CONF[commandObject.name].spriteID + '-crnt';
		if (SPRITE_PATHS[crntTexture] !== undefined) {
			commandObject.setTexture(crntTexture);
		}
	}
}

window.handleRepeat = function() {
	console.log("herhalingen: ", document.repeatform.herhalingen.value)
	toggleRepeatOverlay()
	this.selectedObject.setData('repeats', document.repeatform.herhalingen.value);
	insertBrackets(null, this.selectedObject)
}
// FUNCTIONS TO HANDLE INTERACTION WITH HTML
// renderRepeatPrompt("")
function renderRepeatPrompt(text) {
	el = document.getElementById("repeatOverlay");
	let html = "";

	html += "<button class ='close' onclick='toggleRepeatOverlay()'>close window (NOT FOR FINAL GAME)</button><ul>" +
	"<p>Je hebt de <img src ='assets/herhaal-x.png'/> knop gebruikt, hoe vaak wil je dat de commando's herhaald worden?</p>" +
	"<form action='javascript:handleRepeat()' name='repeatform' class='close' accept-charset='utf-8'>" +
	"<input type='text' name='herhalingen' value=''>" +
	"<input type='submit' value='Submit'>" +
	"</form>"

	// console.log(html)
	html += "</ul>";
	el.innerHTML = html;
}
