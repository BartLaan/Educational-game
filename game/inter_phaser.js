function InterPhaser(phaser, levelConfig, eventHandler) {
	this.phaser = phaser;
	this.levelConfig = levelConfig;
	this.eventHandler = eventHandler;

	this.levelConfig.objects = this.levelConfig.objects.concat(COMMON_OBJECTS);
	this.setLevel();
	this.setInteractions();
	this.showIntro();
};

InterPhaser.prototype.showIntro = function() {
	let introImage = this.phaser.add.image(0, 0, this.levelConfig.instruction);
	Phaser.Display.Align.In.Center(introImage, this.pObjects.background);
	introImage.setInteractive();
	introImage.setDepth(3);

	let me = this;
	introImage.on('pointerdown', function(pointer) {
		if (me.isOnConfirmButton(pointer)) {
			introImage.destroy();
		}
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
	this.pObjects = {};
	let pObjects = this.pObjects;
	this.stackObjects = [];

	this.pObjects.background = phsr.add.image(0, 0, this.levelConfig.background).setOrigin(0, 0);
	this.pObjects.background.name = 'background';
	this.pObjects.background.setDisplaySize(width, height);
	let background = this.pObjects.background;

	let maxCommands = this.levelConfig.maxCommands;
	let maxCommandsStr = maxCommands.toString();
	OBJECT_CONF.stepcount_total_pt1.spriteID = maxCommandsStr[0];
	this.pObjects.stepcount_total_pt1 = this.setGameObject(OBJECT_CONF.stepcount_total_pt1, 'stepcount_total_pt1');
	if (maxCommands > 9) {
		OBJECT_CONF.stepcount_total_pt2.spriteID = maxCommandsStr[1];
		this.pObjects.stepcount_total_pt2 = this.setGameObject(OBJECT_CONF.stepcount_total_pt2, 'stepcount_total_pt2');
	}

	this.setDynamicObjects();
}

InterPhaser.prototype.setDynamicObjects = function() {
	let pObjects = this.pObjects;

	for (let objectName of INIT_OBJECTS) {
		if (!this.hasObject(objectName)) { continue; }
		let objConfig = OBJECT_CONF[objectName];

		// normal objects
		if (OBJECTS_MULTIPLE.indexOf(objectName) === -1) {
			pObjects[objectName] = this.setGameObject(objConfig, objectName);
			pObjects[objectName].name = objectName;

		} else { // draggable commands can have multiple versions
			pObjects[objectName] = {};
			let objectRef = objectName + '-' + 0;
			let object = this.setGameObject(objConfig, objectRef);
			object.setData('i', 0);
			pObjects[objectName][0] = object;
		}
	}

	if (this.levelConfig.spaceType === TYPE_SPACE_GRID) {
		if (this.hasObject('vraagteken')) {
			let vraagtekenCoords = Utils.strToCoord(this.levelConfig.goalPosition);
			pObjects.vraagteken.x += this.boardOffsetX;
			pObjects.vraagteken.y += this.boardOffsetY;
			pObjects.vraagteken.x += this.stepsize_horizontal * vraagtekenCoords.x;
			pObjects.vraagteken.y += this.stepsize_vertical * vraagtekenCoords.y;
		}
	// ELSE ??
	}

	let me = this;
	pObjects.uitvoeren.on('pointerdown', function (pointer) {
		this.setTint(0xff0000);
		if (me.stackObjects === undefined || me.stackObjects.length === 0) return;

		let repr = me.getStackRepresentation();
		me.eventHandler(PHASER_STACK_START, { stack: repr });
		me.running = true;
	});

	pObjects.uitvoeren.on('pointerout', function (pointer) {
		this.clearTint();
	});

	pObjects.uitvoeren.on('pointerup', function (pointer) {
		this.clearTint();
	});

	pObjects.opnieuw.on('pointerdown', this.resetLevel.bind(this));

	pObjects.player.setOrigin(0.5);
	this.updateOssiePos(this.levelConfig.initPosition);
}

InterPhaser.prototype.setGameObject = function(config, id) {
	let scaling = config.scaling * this.scalingfactor;
	let gameObject = this.phaser.add.sprite(0, 0, config.spriteID).setOrigin(0, 0);
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

InterPhaser.prototype.loadNextLevel = function() {

}
InterPhaser.prototype.resetLevel = function() {
	console.log("restarting level")
	this.eventHandler(PHASER_STACK_RESET);
	this.activeCommand = undefined;
	this.stackIndex = undefined;
	this.stackObjects = [];

	// Lots of prior knowledge here: we are
	for (let objectName of INIT_OBJECTS) {
		if (this.pObjects[objectName] === undefined) { continue }
		console.log('resetting object', objectName);
		if (OBJECTS_MULTIPLE.indexOf(objectName) === -1) {
			if (this.pObjects[objectName] !== undefined) {
				this.pObjects[objectName].destroy();
			}
		} else {
			for (let objectKey in this.pObjects[objectName]) {
				let object = this.pObjects[objectName][objectKey];
				if (object !== undefined) {
					object.destroy();
				}
			}
		}
		this.pObjects[objectName] = undefined;
	}

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
	let pOjs = this.pObjects;

	let height = this.height;
	let width = this.width;

	// this.renderDropZone();
	this.stackPos = { x: width * STACK_ZONE_POS_X, y: height * STACK_ZONE_POS_Y };

	// ================================================================
	// handle click events for different buttons
	// ================================================================
	let newDrag = false
	this.selectedObject = null;

	let fastClick = false;
	phsr.input.on('gameobjectdown', function(pointer, gameObject) {
		if (myself.isRunning === true) { return; }
		// Only allow command objects that are not already in the queue to be added
		if (gameObject.getData('commandID') === undefined || myself.stackObjects.indexOf(gameObject) > -1) { return }

		fastClick = true;
		setTimeout(function() {
			fastClick = false;
		}, 300);
	});
	phsr.input.on('gameobjectup', function(pointer, gameObject) {
		if (fastClick) {
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

		if (!pointer.isDown && myself.inDropZone(pointer) && newDrag === true) {
			newDrag = false;
			return myself.dropObjectOnStack(gameObject);
		}
		// Dropped outside of drop zone -> delete this object
		if (OBJECTS_MULTIPLE.indexOf(gameObject.name) !== -1) {
			myself.pObjects[gameObject.name][gameObject.getData('i')] = undefined;
			gameObject.destroy();
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
	this.pObjects[gameObject.name][newObjectI] = newObject;
}

InterPhaser.prototype.setHoverTexture = function(gameObject) {
	let objConfig = OBJECT_CONF[gameObject.name];
	if (objConfig === undefined || gameObject.texture.key.indexOf('-hover') !== -1) { return }

	let hoverTexture = gameObject.texture.key + "-hover";

	if (SPRITE_PATHS[hoverTexture] === undefined) { return }

	gameObject.setTexture(hoverTexture);
}

InterPhaser.prototype.clearHoverTexture = function(gameObject) {
	let objConfig = OBJECT_CONF[gameObject.name];
	if (objConfig === undefined || objConfig.spriteID === undefined) { return }
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

	// First input the amount of repeats for herhaal-x
	if (gameObject.getData('commandID') === "for" && gameObject.getData('command').counts === null ) {
		let result = this.askCounts;
		if (result === false) { return } // user cancelled input

		gameObject.getData('command').counts = result
	}

	// Add object to internal InterPhaser stack
	if (this.stackIndex === undefined) {
		this.stackObjects.push(gameObject);
		gameObject.setData('stackIndex', this.stackObjects.length - 1);
	} else {
		this.stackObjects.splice(this.stackIndex, 0, gameObject);
		gameObject.setData('stackIndex', this.stackIndex);

	}

	let isBracketObject = BRACKET_OBJECTS.indexOf(gameObject.getData('commandID')) !== -1;
	if (isBracketObject) {
		this.insertBrackets(gameObject);
		gameObject.input.enabled = false;
		let bracketBottom = this.stackObjects[this.stackIndex + 2];
	}

	this.positionCommands();
	// this.newDrag = false // fixes the bug where this function triggers all the time
	this.updateStepcount();
}
InterPhaser.prototype.askCounts = function(wrongInput) {
	let question = wrongInput ? 'Er is iets fout gegaan. Heb je een getal ingevoerd? \n \n Hoe vaak herhalen?' : 'Hoe vaak herhalen?'
	let result = window.prompt(question, 'Voer een getal in');
	counts = parseInt(result, 10);
	if (counts > 0) {
		return counts;
	} else if (result === null) {
		return false;
	}
	this.askCounts(true)
}

InterPhaser.prototype.getStackRepresentation = function() {
	return this.stackRepresentationInner(0);
}
// Convert the InterPhaser stacklist to a representation that the ossiegame stack can work with nicely.
// startindex is optional.
InterPhaser.prototype.stackRepresentationInner = function(startIndex) {
	startIndex = startIndex === undefined ? 0 : startIndex;
	let result = [];
	let ifObject = undefined;
	let stack = this.stackObjects;

	for (let i = startIndex; i < stack.length; i++) {
		let object = stack[i];
		let stackItem = object.getData('command');
		stackItem.stackIndex = i;
		let commandID = object.getData('commandID');

		switch (commandID) {
			case undefined:
				// Bracketside/brackettop
				break;

			case 'blockend':
				// End of this part of the stack, return the results
				stackItem.blockRef = startIndex; // not needed anymore
				result.push(stackItem);
				return [result, stackItem.stackIndex + 1];

			case 'if':
				ifObject = stackItem.stackIndex;
			case 'else':
				stackItem.blockRef = commandID === 'else' ? ifObject : undefined; // fallthrough of if
			case 'for':
				let [newStack, newI] = this.stackRepresentationOf(stack, i + 1); // RECURSION
				stackItem.do = newStack;
				i = newI;

			default:
				result.push(stackItem);
		}
	}

	return result;
}

InterPhaser.prototype.positionCommands = function(pointer) {
	this.stackIndex = undefined;
	let bracketSpacing = STACK_BRACKET_SPACING * this.height;
	let commandSpacing = STACK_COMMAND_SPACING * this.height;
	let stackX = STACK_ZONE_POS_X * this.width;
	let stackY = (STACK_ZONE_POS_Y * this.height) + commandSpacing;

	for (let i in this.stackObjects) {
		let object = this.stackObjects[i];

		switch (object.name) {
			case 'bracketSide':
				object.x = stackX;
				stackX += bracketSpacing;
				break;
			case 'bracketBottom':
				stackX -= bracketSpacing
			default:
				object.x = stackX;
		}
		object.y = stackY;

		let bracketSideOrTop = object.name === 'bracketSide' || object.name === 'bracketTop'
		let tryTempSpace = this.stackIndex === undefined && pointer !== undefined && !bracketSideOrTop
		if (tryTempSpace && (pointer.y < object.y + (object.height / 2))) {
			this.stackIndex = i;
			object.y += commandSpacing;
		}

		// Bracket side doesn't take vertical space
		if (object.name !== 'bracketSide') {
			stackY = object.y + commandSpacing;
		}
	}
}

InterPhaser.prototype.removeFromStack = function(object) {
	let objectIndex = this.stackObjects.indexOf(object);
	if (objectIndex !== -1) {
		this.stackObjects.splice(objectIndex, 1);
		this.positionCommands();
		if (BRACKET_OBJECTS.indexOf(object.name) !== -1) {
			this.clearBracketObject(object);
		}
	}
	this.updateStepcount();
}

InterPhaser.prototype.updateStepcount = function() {
	let stepCounter = this.pObjects.stepcount;
	let lastStackObject = this.stackObjects.slice(-1)[0];
	let commandTotal = this.stackObjects.reduce(function(counter, stackObject) {
		return stackObject.getData('commandID') !== undefined ? counter + 1 : counter;
	}, 0)

	let newTexture = commandTotal.toString();
	stepCounter.setTexture(newTexture);
}

InterPhaser.prototype.hasObject = function(objectName) {
	return this.levelConfig.objects.indexOf(objectName) >= 0
}

InterPhaser.prototype.fail = function() {
	this.running = false;
	let loseImage = this.phaser.add.image(0, 0, 'fail');
	Phaser.Display.Align.In.Center(loseImage, this.pObjects.background);
	loseImage.setInteractive();
	loseImage.setDepth(3);

	let me = this;
	loseImage.on('pointerdown', function(pointer) {
		if (me.isOnConfirmButton(pointer)) {
			loseImage.destroy();
			if (me.activeCommand !== undefined) {
				me.activeCommand.setTexture(OBJECT_CONF[me.activeCommand.name].spriteID);
			}
		}
	});
}
/**
* displays a victory image on screen when victory event is fired
*/
InterPhaser.prototype.win = function() {
	let victoryImage = this.phaser.add.image(0, 0, 'victory');
	Phaser.Display.Align.In.Center(victoryImage, this.pObjects.background);
	victoryImage.setDepth(3);

	let me = this;
	setTimeout(function(){
		// add buttons here;
		let nextButton = me.phaser.add.image(me.width * LEVEL_NEXT_X, me.height * WINBUTTON_Y, 'nextlevel')
		nextButton.setInteractive();
		nextButton.setDepth(4);
		nextButton.on('pointerdown', function (pointer) {
			window.game.scene.stop(me.levelConfig.levelName);
			console.log('starting level:', me.levelConfig.nextLevelName, level2);
			window.game.scene.start(me.levelConfig.nextLevelName);
		}, me);

		let againButton = me.phaser.add.image(me.width * LEVEL_AGAIN_X, me.height * WINBUTTON_Y, 'playagain')
		againButton.setInteractive();
		againButton.setDepth(4);
		againButton.on('pointerdown', function () {
			victoryImage.destroy();
			nextButton.destroy();
			againButton.destroy();
			me.resetLevel();
		});
	}, VICTORY_TIMEOUT);
}

InterPhaser.prototype.updateOssiePos = function(ossiePos) {
	let player = this.pObjects.player
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
		player.angle = ossiePos.direction;
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
	let commandObject = isMultiple ? this.pObjects[commandName][commandI] : this.pObjects[commandName];
	// clear color of previous command if applicable
	if (this.activeCommand !== undefined) {
		this.activeCommand.setTexture(OBJECT_CONF[this.activeCommand.name].spriteID);
	}
	this.activeCommand = commandObject;

	// color the current command if it is not the repeat command
	if (BRACKET_OBJECTS.indexOf(commandObject.getData('commandID')) === -1) {
		let crntTexture = OBJECT_CONF[commandObject.name].spriteID + '-crnt';
		if (SPRITE_PATHS[crntTexture] !== undefined) {
			commandObject.setTexture(crntTexture);
		}
	}
}

/**
* Position the herhaal command and the corresponding bracket in the commandzone
*/
InterPhaser.prototype.insertBrackets = function(gameObject) {
	for (let objectName of ['bracketBottom', 'bracketSide', 'bracketTop']) {
		let objID = objectName + '-' + gameObject.name;
		let object = this.setGameObject(OBJECT_CONF[objectName], objectName);
		this.pObjects[objID] = object;
		this.stackObjects.splice(this.stackIndex, 0, object);

		console.log(object);
		if (objectName === 'bracketBottom') {
			object.setData('blockRef', this.stackObjects.indexOf(gameObject));
		}
	}
}

InterPhaser.prototype.clearBracketObject = function(gameObject) {
	let objectIndex = this.stackObjects.indexOf(gameObject);
	let bracketItems = ['bracketBottom', 'bracketSide', 'bracketTop'];

	for (let i=objectIndex+1; i < this.stackObjects.length; i) {
		let object = this.stackObject[object];
		if (object.getData('blockRef') === objectIndex) { break; }

		if (bracketItems.indexOf(object.name) !== -1) {
			this.pObjects[objID].destroy();
			this.pObjects[objID] = undefined;
		}
		this.stackObjects.splice(objectIndex, 1);
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
