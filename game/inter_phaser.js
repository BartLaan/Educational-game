PHASER_STACK_ADD = 'PHASER_STACK_ADD'
PHASER_STACK_START = 'PHASER_STACK_START'
PHASER_STACK_DELETE = 'PHASER_STACK_DELETE'
PHASER_STACK_RESET = 'PHASER_STACK_RESET'
WH_RATIO = 1.3333333333
SCALING_FACTOR_DIV = 1024
BOARD_STEPSIZE_RELATIVE_TO_HEIGHT = 9.9
BOARD_OFFSET_X = 6.8
BOARD_OFFSET_Y = -17
DROP_ZONE_POS_X = -2.8
DROP_ZONE_POS_Y = -35
DROP_ZONE_WIDTH = 4
DROP_ZONE_HEIGHT = 1.3

function InterPhaser(phaser, levelConfig, eventHandler) {
	this.phaser = phaser;
	this.levelConfig = levelConfig;
	this.eventHandler = eventHandler;

	this.levelConfig.objects = this.levelConfig.objects.concat(PhaserUtils.commonSprites);
	this.setLevel();
	this.setInteractions();
};

InterPhaser.prototype.setLevel = function() {
	let phsr = this.phaser
	// everything is based off the window height, based on the assumpation that all screens it will be played on have width space to spare
	let height = window.innerHeight
	let width = window.innerHeight * WH_RATIO
	let scalingfactor = width / SCALING_FACTOR_DIV
	this.height = height
	this.width = width
	this.scalingfactor = scalingfactor

	// this was done by trial and error, sorry bout that
	this.stepsize_horizontal = height / BOARD_STEPSIZE_RELATIVE_TO_HEIGHT
	this.stepsize_vertical = height / BOARD_STEPSIZE_RELATIVE_TO_HEIGHT
	this.boardOffsetX = width / BOARD_OFFSET_X
	this.boardOffsetY = height / BOARD_OFFSET_Y

	// ================================================================
	// PREPARING ASSETS
	// ================================================================
	this.pObjects = {};
	let pObjects = this.pObjects;

	this.pObjects.background = phsr.add.image(width/2, height/2, this.levelConfig.background);
	let background = this.pObjects.background;
	background.setDisplaySize(width, height);

	// it's important to center the background first and then the rest of the assets
	Phaser.Display.Align.In.Center(background, phsr.add.zone(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight));

	let gameObjectsConfigs = this.getGameObjectsConfigs()
	for (let objectName in gameObjectsConfigs) {
		if (!this.hasObject(objectName)) { continue; }
		pObjects[objectName] = this.setGameObject(gameObjectsConfigs[objectName]);
	}

	let multipleButtonsStackSize = 20;
	for (let objectName in this.gameObjectsConfigsMultiple) {
		if (!this.hasObject(objectName)) { continue; }

		pObjects[objectName] = [];
		for (let i = 0; i < multipleButtonsStackSize; i++) {
			let object = this.setGameObject(this.gameObjectsConfigsMultiple[objectName]);
			object.data.id = i;
			pObjects[objectName].push(object);
		}
	}

	let player = pObjects.player;
	player.angle -= 20
	// player.data = {"orientation": "right"}
	// player.gridposition = {"x":0, "y":5}
	// let victorypos = {"x":7, "y":1}

}

InterPhaser.prototype.setGameObject = function(config) {
	let scaling = config.scaling * this.scalingfactor;
	let gameObject = this.phaser.add.sprite(0, 0, config.spriteID);
	gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling);
	Phaser.Display.Align.In.Center(gameObject, this.pObjects.background);

	if (config.data !== undefined) {
		gameObject.data = config.data;
		// This is a command object, we need a reference to itself for when we pass it to the stack
		if (config.data.command !== undefined) {
			gameObject.data.phaserObj = gameObject;
		}
	}
	if (config.depth !== undefined) {
		gameObject.setDepth(config.depth);
	}
	if (config.offsetX !== undefined) {
		gameObject.x += this.width/config.offsetX;
		gameObject.y += this.width/config.offsetY;
	}
	if (config.interactive === true || config.draggable === true) {
		gameObject.setInteractive();
	}
	if (config.draggable === true) {
		gameObject.setOrigin(0);
		this.phaser.input.setDraggable(gameObject);
	}

	return gameObject;
}

InterPhaser.prototype.setInteractions = function()
{
	// ================================================================
	// PREPARING DEFAULT GAME INTERACTIONS
	// ================================================================
	let myself = this
	let phsr = this.phaser;
	let pOjs = this.pObjects;

	let height = this.height;
	let width = this.width;
	let zone = phsr.add.zone(0, 0, width / DROP_ZONE_WIDTH, height / DROP_ZONE_HEIGHT);
	zone.setRectangleDropZone(width / DROP_ZONE_WIDTH, height / DROP_ZONE_HEIGHT);
	Phaser.Display.Align.In.Center(zone, pOjs.background);
	zone.x += width / DROP_ZONE_POS_X
	zone.y += height / DROP_ZONE_POS_Y
	pOjs.zone = zone;

	//  Just a visual display of the drop zone
	let graphics = phsr.add.graphics();
	let commandPos = {"x": zone.x, "y": height / 10}
	let commandStepDistance = height / 25

	pOjs.player.x += width / BOARD_OFFSET_X
	pOjs.player.y += height / BOARD_OFFSET_Y

	if (this.hasObject('vraagteken')) {
		let vraagtekenCoords = this.levelConfig.goalPosition.split(',');
		pOjs.vraagteken.x += width / BOARD_OFFSET_X;
		pOjs.vraagteken.y += height / BOARD_OFFSET_Y;
		pOjs.vraagteken.x += this.stepsize_horizontal * vraagtekenCoords[0];
		pOjs.vraagteken.y -= this.stepsize_vertical * vraagtekenCoords[1];
	}

	// ================================================================
	// handle click events for different buttons
	// ================================================================
	let newDrag = false
	let selectedObject = null
	this.selectedObject = selectedObject;

	phsr.input.on('dragstart', function (pointer, gameObject) {
		this.children.bringToTop(gameObject);
		newDrag = true;
	}, this);

	phsr.input.on('drag', function (pointer, gameObject, dragX, dragY) {
		gameObject.x = dragX;
		gameObject.y = dragY;
	});

	phsr.input.on('dragenter', function (pointer, gameObject, dropZone) {
		graphics.clear();
	});

	phsr.input.on('dragleave', function (pointer, gameObject, dropZone) {
		graphics.clear();
	});

	phsr.input.on('drop', function (pointer, gameObject, dropZone) {
		gameObject.x = commandPos.x;
		gameObject.y = commandPos.y;
		if(gameObject.data.command == "herhaal-x" && newDrag) {
			toggleRepeatOverlay();
			selectedObject = gameObject
		} else if(gameObject.data.command == "herhaal" && newDrag) {
			positionHerhaal(pointer, gameObject)
		} else if (newDrag) {
			gameObject.input.enabled = false;
			this.eventHandler(PHASER_STACK_ADD, gameObject);
			commandPos.y = commandPos.y + commandStepDistance
			newDrag = false // fixes the bug where this function triggers all the time
		}
	});

	// use separate function
	phsr.input.on('dragend', function (pointer, gameObject, dropped) {
		if (
			gameObject.x > (zone.x - zone.input.hitArea.width / 2)
			&& gameObject.x < (zone.x + zone.input.hitArea.width / 2)
			&& gameObject.y > (zone.y - zone.input.hitArea.height / 2)
			&& gameObject.y < (zone.y + zone.input.hitArea.height / 2)
		) {
			if (gameObject.data.command == "herhaal-x" && newDrag) {
				// renderRepeatPrompt("")
				toggleRepeatOverlay();
				selectedObject = gameObject
				// positionHerhaal(pointer, gameObject)
			}else if (gameObject.data.command == "herhaal" && newDrag) {
				positionHerhaal(pointer, gameObject)
			} else if (newDrag) {
				gameObject.x = commandPos.x;
				gameObject.y = commandPos.y;
				gameObject.input.enabled = false;
				myself.eventHandler(PHASER_STACK_ADD, { stackItem: gameObject} );
				commandPos.y = commandPos.y + commandStepDistance
				newDrag = false
			}
		} else if (!dropped) {
		// fix case for false negatives
			gameObject.x = gameObject.input.dragStartX;
			gameObject.y = gameObject.input.dragStartY;
		}
		graphics.clear();
		// graphics.lineStyle(2, 0xffff00);
		// graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
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
		phsr.game.scene.stop(myself.levelConfig.levelName);
		phsr.game.scene.start(myself.levelConfig.levelName);
	}, this);

	pOjs.uitvoeren.on('pointerout', function (pointer) {
		this.clearTint();
	});

	pOjs.uitvoeren.on('pointerup', function (pointer) {
		this.clearTint();
	});

	pOjs.opnieuw.on('pointerover', function (event, gameObjects) {
		this.setTexture("opnieuw-hover")
	});
	pOjs.opnieuw.on('pointerout', function (event, gameObjects) {
		this.setTexture("opnieuw")
	});

	pOjs.uitvoeren.on('pointerover', function (event, gameObjects) {
		this.setTexture("uitvoeren-hover")
	});
	pOjs.uitvoeren.on('pointerout', function (event, gameObjects) {
		this.setTexture("uitvoeren")
	});

	// ================================================================
	// PLAYER AND COMMAND MOVEMENT INTERACTIONS
	// ================================================================

	phsr.input.on('pointerover', function (event, gameObjectList) {
		try {
			console.log(gameObjectList[0])
			// gameObjectList[0].setTint(0xff0000)
			gameObjectList[0].setTexture(gameObjectList[0].texture.key + "-hover")
		}
		catch(err) {
			console.log(err.message);
		}
	});

	phsr.input.on('pointerout', function (event, gameObjectList) {
		try {
			// gameObjectList[0].clearTint();
			gameObjectList[0].setTexture(gameObjectList[0].texture.key.slice(0,-6))
		}
		catch(err) {
			console.log(err.message);
		}
	});
}

InterPhaser.prototype.hasObject = function(objectName) {
	return this.levelConfig.objects.indexOf(objectName) >= 0
}

/**
* displays a victory image on screen when victory event is fired
*/
InterPhaser.prototype.win = function() {
	let victoryimage = this.phaser.add.image(0, 0, 'victory');
	Phaser.Display.Align.In.Center(victoryimage, this.background);
	victoryimage.setDisplaySize(this.width/4, this.height/4)
	victoryimage.setInteractive()
	victoryimage.on('pointerdown', function (pointer) {
		console.log("loading next level");
		this.phaser.game.scene.stop(this.levelName);
		this.phaser.game.scene.start(this.nextLevelName);
	}, this);
}

InterPhaser.prototype.updateOssiePos = function(ossiePos) {
	let player = this.player
	if (this.levelConfig.spaceType === 'grid') {
		let ossieCoords = ossiePos.nodeLocation.split(',')
		player.x = this.boardOffsetX + (this.stepsize_horizontal * ossieCoords[0])
		player.y = this.boardOffsetY + (this.stepsize_vertical * ossieCoords[1])
	} else {
		// ???
	}
	if (this.levelConfig.orientationType === 'cardinals') {
		player.angle = Utils.cardinalToAngle(ossiePos.direction);
	} else {
		player.angle = ossiePos.direction;
	}
}

InterPhaser.prototype.onCommandExecute = function(commandObject) {
	// clear color of previous command if applicable
	if (this.activeCommand !== undefined) {
		this.activeCommand.clearTint();
	}
	this.activeCommand = commandObject;

	// color the current command if it is not the repeat command
	if (commandObject.data.command != "herhaal") {
		commandObject.setTint(0xff0000)
	}
}
/**
* Position the herhaal command and the corresponding bracket in the commandzone
*/
InterPhaser.prototype.positionHerhaal = function(pointer, gameObject) {
	// AAAAAAAAAAAAAAAAAAAAAAAH
	return;
	// snap to nearest step
	let herhaalheight = this.height/10
	let herhaalindex = 0
	while (gameObject.y > herhaalheight && herhaalheight < this.commandPos.y) {
		herhaalheight += commandStepDistance
		herhaalindex += 1
	}

	// extra steps in case of another herhaal command being present
	let extra_steps = 0
	commandList.forEach(function(commandObject) {
		if (commandObject.data.command == "herhaal-x") {
			extra_steps += commandObject.data.range
		}
		if (commandObject.data.command == "herhaal") {
			extra_steps += commandObject.data.range
		}

	});
	herhaalindex += extra_steps
	herhaalheight -= commandStepDistance
	herhaalindex -= 1

	gameObject.data.startindex = herhaalindex
	gameObject.input.enabled = true
	myself.input.setDraggable(gameObject)
	gameObject.y = herhaalheight + commandStepDistance/6 //stap.height used for standard stepsize
	gameObject.x = commandPos.x - width/8
	commandList.splice(herhaalindex, 0, gameObject)

	// add a bracket to the herhaal sprite, change this to be able to find the bracket.
	let bracket = myself.add.sprite(0, 0, "bracket1")
	bracket.setInteractive()
	// gameObject.data.bracket = bracket
	bracket.input.enabled = true;
	Phaser.Display.Align.In.Center(bracket, background);
	bracket.y = herhaalheight + commandStepDistance/2
	bracket.x = commandPos.x
	// position bracket underneat regular commands
	bracket.setDepth(1)
}
window.handleRepeat = function() {
	console.log("herhalingen: ", document.repeatform.herhalingen.value)
	toggleRepeatOverlay()
	selectedObject.data.repeats = document.repeatform.herhalingen.value
	positionHerhaal(null, selectedObject)
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

// Function because the levelcount sprite object depends on the level
InterPhaser.prototype.getGameObjectsConfigs = function() {
	return {
		levelcount: {
			offsetX: -30,
			offsetY: 6.4,
			scaling: 1.1,
			spriteID: this.levelConfig.levelCount.toString(),
		},
		nine: {
			offsetX: -120,
			offsetY: 6.4,
			scaling: 1.1,
			spriteID: '9',
		},
		one: {
			offsetX: -15,
			offsetY: 6.4,
			scaling: 1.1,
			spriteID: '1',
		},
		open: {
			data: { command: 'open' },
			depth: 2,
			draggable: true,
			offsetX: 5,
			offsetY: 6.5,
			scaling: 1,
			spriteID: 'open',
		},
		opnieuw: {
			interactive: true,
			offsetX: -14,
			offsetY: 3.2,
			scaling: 0.95,
			spriteID: 'opnieuw',
		},
		player: {
			scaling: 0.15,
			spriteID: 'ossie',
		},
		slash: {
			offsetX: 20,
			offsetY: 6.4,
			scaling: 1.1,
			spriteID: 'slash',
		},
		sluit: {
			data: { command: 'sluit' },
			draggable: true,
			offsetX: 3.3,
			offsetY: 6.5,
			scaling: 1,
			spriteID: 'sluit',
		},
		uitvoeren: {
			interactive: true,
			offsetX: -7.2,
			offsetY: 6.4,
			scaling: 1,
			spriteID: 'uitvoeren',
		},
		vraagteken: {
			scaling: 1.1,
			spriteID: 'vraagteken',
		},
	}
}

InterPhaser.prototype.gameObjectsConfigsMultiple = {
	herhaal: {
		data: { command: "for", range: 1, startindex: 0, bracket: null, counts: 1},
		draggable: true,
		offsetX: 7,
		offsetY: 3,
		scaling: 1,
		spriteID: 'herhaal-x',
	},
	herhaalx: {
		data: { command: "for", range: 1, startindex: 0, bracket: null, counts: 1},
		draggable: true,
		offsetX: 4,
		offsetY: 3,
		scaling: 1,
		spriteID: 'herhaal-x',
	},
	draailinks: {
		data: { command: 'turnL' },
		depth: 2,
		draggable: true,
		offsetX: 7,
		offsetY: 3.7,
		scaling: 1,
		spriteID: 'draailinks',
	},
	draairechts: {
		data: { command: 'turnR' },
		depth: 2,
		draggable: true,
		offsetX: 3.8,
		offsetY: 3.95,
		scaling: 1,
		spriteID: 'draaiRechts',
	},
	stap: {
		data: { command: 'step' },
		depth: 2,
		draggable: true,
		offsetX: 5.2,
		offsetY: 4.5,
		scaling: 1,
		spriteID: 'stap',
	},
}

PhaserUtils = {};
PhaserUtils.loadSprites = function(phaser, spriteArray) {
	spriteArray.shift(PhaserUtils.commonSprites);
	console.log(spriteArray);
	for (let spriteID of spriteArray) {
		let spriteLocation = PhaserUtils.sprites[spriteID];
		if (spriteLocation !== undefined) {
			spriteLocation = spriteLocation;
			phaser.load.image(spriteID, spriteLocation);
		} else {
			console.error('Couldnt find sprite with ID', spriteID);
		}
	}
}
PhaserUtils.commonSprites = [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'oeps',
	'open',
	'open-hover',
	'opnieuw',
	'opnieuw-hover',
	'ossie',
	'slash',
	'sluit',
	'sluit-hover',
	'stap',
	'stap-hover',
	'uitvoeren',
	'uitvoeren-hover',
	'victory',
	'victory-hover',
];
PhaserUtils.sprites = {
	// common
	'0': 'assets/0.png',
	'1': 'assets/1.png',
	'2': 'assets/2.png',
	'3': 'assets/3.png',
	'4': 'assets/4.png',
	'5': 'assets/5.png',
	'6': 'assets/6.png',
	'7': 'assets/7.png',
	'8': 'assets/8.png',
	'9': 'assets/9.png',
	'oeps': 'assets/oeps.jpg',
	'open': 'assets/open.png',
	'open-hover': 'assets/open-hover.png',
	'opnieuw': 'assets/opnieuw.png',
	'opnieuw-hover': 'assets/opnieuw-hover.png',
	'ossie': 'assets/ossie.png',
	'slash': 'assets/slash.png',
	'sluit': 'assets/sluit.jpg',
	'sluit-hover': 'assets/sluit-hover.png',
	'stap': 'assets/stap.png',
	'stap-hover': 'assets/stap-hover.png',
	'uitvoeren': 'assets/uitvoeren.png',
	'uitvoeren-hover': 'assets/uitvoeren-hover.png',
	'victory': 'assets/placeholder_victory.png',
	'victory-hover': 'assets/placeholder_victory-hover.png',

	// level specific
	'als': 'assets/als.png',
	'anders': 'assets/anders.png',
	'background': 'assets/achtergrond.jpg',
	'background1': 'assets/1-achtergrond.jpg',
	'background2': 'assets/2-achtergrond.jpg',
	'background3': 'assets/3-achtergrond.jpg',
	'background4': 'assets/4-achtergrond.jpg',
	'background5': 'assets/5-achtergrond.jpg',
	'background6': 'assets/6-achtergrond.jpg',
	'background7': 'assets/7-achtergrond.jpg',
	'background8': 'assets/8-achtergrond.jpg',
	'background9': 'assets/9-achtergrond.jpg',
	'background10': 'assets/10-achtergrond.jpg',
	'bracket1': 'assets/nest-1.png',
	'bracket2': 'assets/nest-2.png',
	'bracket3': 'assets/nest-3.png',
	'bracket4': 'assets/nest-4.png',
	'bracket5': 'assets/nest-5.png',
	'bracket6': 'assets/nest-6.png',
	'draailinks': 'assets/draai-links.png',
	'draailinks-crnt': 'assets/draai-links-crnt.png',
	'draailinks-hover': 'assets/draai-links-hover.png',
	'draai-graden': 'assets/draai-graden.png',
	'draai-graden-hover': 'assets/draai-graden-hover.png',
	'draairechts': 'assets/draai-rechts.png',
	'draairechts-crnt': 'assets/draai-rechts-crnt.png',
	'draairechts-hover': 'assets/draai-rechts-hover.png',
	'graden': 'assets/draai-graden.png',
	'herhaal': 'assets/herhaal.png',
	'herhaal-hover': 'assets/herhaal-hover.png',
	'herhaal-x': 'assets/herhaal-x.png',
	'herhaal-x-hover': 'assets/herhaal-x-hover.png',
	'herhaal-x-1': 'assets/herhaal-x-1.png',
	'herhaal-x-2': 'assets/herhaal-x-2.png',
	'herhaal-x-3': 'assets/herhaal-x-3.png',
	'herhaal-x-4': 'assets/herhaal-x-4.png',
	'herhaal-x-5': 'assets/herhaal-x-5.png',
	'herhaal-x-6': 'assets/herhaal-x-6.png',
	'herhaal-x-7': 'assets/herhaal-x-7.png',
	'herhaal-x-8': 'assets/herhaal-x-8.png',
	'herhaal-x-9': 'assets/herhaal-x-9.png',
	'vraagteken': 'assets/vraagteken.png',
}
