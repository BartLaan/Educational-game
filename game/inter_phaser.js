function InterPhaser(phaser, levelConfig, eventHandler) {
	this.phaser = phaser;
	this.levelConfig = levelConfig;
	this.eventHandler = eventHandler;

	this.levelConfig.objects = this.levelConfig.objects.concat(COMMON_OBJECTS);
	this.setLevel();
	this.setInteractions();
};

InterPhaser.prototype.setLevel = function() {
	let phsr = this.phaser
	// everything is based off the window height, based on the assumpation that all screens it will be played on have width space to spare
	// let height = window.innerHeight
	// let width = window.innerHeight * WH_RATIO
	let height = 786
	let width = 1024
	let scalingfactor = width / SCALING_FACTOR_DIV
	this.height = height
	this.width = width
	this.scalingfactor = scalingfactor

	// this was done by trial and error, sorry bout that
	this.stepsize_horizontal = height * BOARD_STEPSIZE_RELATIVE_TO_HEIGHT
	this.stepsize_vertical = height * BOARD_STEPSIZE_RELATIVE_TO_HEIGHT
	this.boardOffsetX = width * BOARD_OFFSET_X
	this.boardOffsetY = height * BOARD_OFFSET_Y

	// ================================================================
	// PREPARING ASSETS
	// ================================================================
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

	// Initialize all game objects
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
			object.data.i = 0;
			pObjects[objectName][0] = object;
		}
	}
	console.log(pObjects);

	pObjects.player.setOrigin(0.5);
	this.updateOssiePos(this.levelConfig.initPosition);
}

InterPhaser.prototype.setGameObject = function(config, id) {
	let scaling = config.scaling * this.scalingfactor;
	let gameObject = this.phaser.add.sprite(0, 0, config.spriteID).setOrigin(0, 0);
	gameObject.name = id.split('-')[0];
	gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling);

	if (config.data !== undefined) {
		gameObject.data = Utils.deepCopy(config.data);
		// This is a command object, we need a reference to itself for when we pass it to the stack
		if (config.data.command !== undefined) {
			gameObject.data.objectRef = id;
		}
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
	this.stackPos = { "x": width * STACK_ZONE_POS_X, "y": height * STACK_ZONE_POS_Y };

	if (this.levelConfig.spaceType === TYPE_SPACE_GRID) {
		if (this.hasObject('vraagteken')) {
			let vraagtekenCoords = Utils.strToCoord(this.levelConfig.goalPosition);
			pOjs.vraagteken.x += this.boardOffsetX;
			pOjs.vraagteken.y += this.boardOffsetY;
			pOjs.vraagteken.x += this.stepsize_horizontal * vraagtekenCoords.x;
			pOjs.vraagteken.y += this.stepsize_vertical * vraagtekenCoords.y;
		}
	// ELSE ??
	}

	// ================================================================
	// handle click events for different buttons
	// ================================================================
	this.newDrag = false
	this.selectedObject = null;

	phsr.input.on('dragstart', function (pointer, gameObject) {
		if (myself.running === true) { return }

		myself.selectedObject = gameObject;
		myself.newDrag = true;

		// Drag/remove command from the command queue
		if (myself.inDropZone(pointer)) {
			myself.removeFromStack(gameObject);
			return;
		}

		let canHaveMultiple = OBJECTS_MULTIPLE.indexOf(gameObject.name) !== -1;
		// Dragging from original position, so create another one under the hood
		if (canHaveMultiple && gameObject.data !== undefined && gameObject.data.stackIndex === undefined) {
			let newObjectI = gameObject.data.i + 1;
			let newObjectRef = gameObject.name + '-' + newObjectI.toString();
			let newObject = myself.setGameObject(OBJECT_CONF[gameObject.name], newObjectRef);
			newObject.data.i = newObjectI;
			myself.pObjects[gameObject.name][newObjectI] = newObject;
		}
	});

	phsr.input.on('drag', function (pointer, gameObject, dragX, dragY) {
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

		if (!pointer.isDown && myself.inDropZone(pointer)) {
			return myself.dropObjectOnStack(pointer, gameObject);
		}
		if (OBJECTS_MULTIPLE.indexOf(gameObject.name) !== -1) {
			myself.pObjects[gameObject.name][gameObject.data.i] = undefined;
			gameObject.visible = false;
		} else {
			let conf = OBJECT_CONF[gameObject.name];
			gameObject.x = myself.width * conf.offsetX;
			gameObject.y = myself.height * conf.offsetY;
		}
		myself.newDrag = false;
	});

	pOjs.uitvoeren.on('pointerdown', function (pointer) {
		this.setTint(0xff0000);
		myself.eventHandler(PHASER_STACK_START);
	});

	pOjs.uitvoeren.on('pointerout', function (pointer) {
		this.clearTint();
	});

	pOjs.uitvoeren.on('pointerup', function (pointer) {
		this.clearTint();
	});

	// rewrite this function using restart and this. methods
	// reloads the whole scene, should instead just reposition objects etc.
	pOjs.opnieuw.on('pointerdown', function (pointer) {
		console.log("restarting level")
		myself.eventHandler(PHASER_STACK_RESET);
		window.game.scene.stop(myself.levelConfig.levelName);
		window.game.scene.start(myself.levelConfig.levelName);
	}, this);

	// ================================================================
	// PLAYER AND COMMAND MOVEMENT INTERACTIONS
	// ================================================================

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

InterPhaser.prototype.dropObjectOnStack = function(pointer, gameObject, extra) {
	if (this.newDrag === false) { return; }

	console.log('Drop object', gameObject);

	// Add object to internal InterPhaser stack
	if (this.stackIndex === undefined) {
		this.stackObjects.push(gameObject);
	} else {
		this.stackObjects.splice(this.stackIndex, 0, gameObject);
	}

	// First input the amount of repeats for herhaal-x
	if (gameObject.data.command === "for" && gameObject.data.counts === null ) {
		toggleRepeatOverlay();
		this.selectedObject = gameObject;
		return;
	}

	let isBracketObject = BRACKET_OBJECTS.indexOf(gameObject.name) !== -1;
	if (isBracketObject) {
		this.insertBrackets(gameObject);
		gameObject.input.enabled = false;
		let bracketBottom = this.stackObjects[this.stackIndex + 2];
		this.eventHandler(PHASER_STACK_ADD, { stackItem: bracketBottom, stackIndex: this.stackIndex });
	}
	this.eventHandler(PHASER_STACK_ADD, { stackItem: gameObject.data, stackIndex: this.stackIndex });

	this.positionCommands();
	this.newDrag = false // fixes the bug where this function triggers all the time
	this.updateStepcount();
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

		let tryTempSpace = pointer !== undefined && (object.name !== 'bracketSide' || object.name !== 'bracketTop')
		if (this.stackIndex === undefined && tryTempSpace && (pointer.y < object.y + (object.height / 2))) {
			this.stackIndex = object.data.stackIndex;
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
		if (object.data !== undefined && ['if', 'for'].indexOf(object.data.command) !== -1) {
			this.clearBracketObject(object);
		}
		this.eventHandler(PHASER_STACK_DELETE, { stackIndex: object.data.stackIndex });
	}
	this.updateStepcount();
}

InterPhaser.prototype.updateStepcount = function() {
	let stepCounter = this.pObjects.stepcount;
	let lastStackObject = this.stackObjects.slice(-1)[0];
	let commandTotal = lastStackObject === undefined ? 0 : lastStackObject.data.stackIndex + 1;
	let newTexture = commandTotal.toString();
	stepCounter.setTexture(newTexture);
}

InterPhaser.prototype.hasObject = function(objectName) {
	return this.levelConfig.objects.indexOf(objectName) >= 0
}

InterPhaser.prototype.fail = function() {
	let loseImage = this.phaser.add.image(0, 0, 'fail');
	Phaser.Display.Align.In.Center(loseImage, this.background);
	loseImage.setInteractive();

	let me = this;
	loseImage.on('pointerdown', function (pointer) {
		window.game.scene.stop(me.levelName);
		window.game.scene.start(me.levelName);
	});
}
/**
* displays a victory image on screen when victory event is fired
*/
InterPhaser.prototype.win = function() {
	let victoryimage = this.phaser.add.image(0, 0, 'victory');
	Phaser.Display.Align.In.Center(victoryimage, this.background);
	victoryimage.setDisplaySize(this.width/4, this.height/4)

	let me = this;
	this.setTimeout(function(){
		// add buttons here;
		victoryimage.setInteractive()
		victoryimage.on('pointerdown', function (pointer) {
			console.log("loading next level");
			window.game.scene.stop(me.levelName);
			window.game.scene.start(me.nextLevelName);
		}, me);
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
	if (BRACKET_OBJECTS.indexOf(commandObject.data.command) === -1) {
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
			object.data.blockRef = gameObject.data.stackIndex
		}
	}
}

InterPhaser.prototype.clearBracketObject = function(gameObject) {
	let objectIndex = this.stackObjects.indexOf(gameObject);
	let bracketItems = ['bracketBottom', 'bracketSide', 'bracketTop'];

	for (let i=objectIndex+1; i < this.stackObjects.length; i) {
		let object = this.stackObject[object];
		if (object.data.bracketRef !== gameObject.data.stackIndex) { break; }

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
	this.selectedObject.data.repeats = document.repeatform.herhalingen.value
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
