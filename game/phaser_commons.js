function PhaserInterface(phaser, levelConfig) {
	this.phaser = phaser;
	this.levelConfig = levelConfig;

	this.setLevel();
	this.setInteractions();
	this.ossie = new Ossie(nodes, initPosition, this.ossieHandler);
};

PhaserInterface.prototype.ossieHandler = function() {

}

PhaserInterface.prototype.setLevel = function() {
	// everything is based off the window height, based on the assumpation that all screens it will be played on have width space to spare
	let height = window.innerHeight
	let width = window.innerHeight * 1.33333333333
	let scalingfactor = width / 1024
	this.height = height
	this.width = width
	this.scalingfactor = scalingfactor
	this.timedEvent;
	this.selectedObject = null

	// this was done by trial and error, sorry bout that
	this.stepsize_horizontal = window.innerHeight / 9.9
	this.stepsize_vertical = window.innerHeight / 9.9

	// ================================================================
	// PREPARING ASSETS
	// ================================================================
	let pObjects = {};

	let background = this.add.image(width/2, height/2, this.levelConfig.background);
	this.pObjects.background = background;
	background.setDisplaySize(width, height);

	// it's important to center the background first and then the rest of the assets
	Phaser.Display.Align.In.Center(background, this.add.zone(window.innerWidth / 2, window.innerHeight /2, window.innerWidth, window.innerHeight));

	for (let objectName in this.gameObjectsConfigs) {
		if (this.levelConfig.objects.indexOf(objectName) === undefined) { continue; }

		pObjects[objectName] = this.setGameObject(gameObjectsConfigs[objectName]);
	}

	let multipleButtonsStackSize = 20;
	for (let objectName in this.gameObjectsConfigsMultiple) {
		if (this.levelConfig.objects.indexOf(objectName) === undefined) { continue; }

		pObjects[objectName] = [];
		for (let i = 0; i < multipleButtonsStackSize; i++) {
			let object = this.setGameObject(linksButtonConfig);
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

PhaserInterface.prototype.setGameObject = function(config) {
	let scaling = config.scaling * this.scalingfactor;
	let gameObject = this.phaser.add.sprite(0, 0, config.spriteID);
	gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling);
	Phaser.Display.Align.In.Center(gameObject, this.pObjects.background);

	if (config.data !== undefined) {
		gameObject.data = data;
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

PhaserInterface.prototype.gameObjectsConfigs = {
	levelcount: {
		offsetX: -30,
		offsetY: 6.4,
		scaling: 1.1,
		spriteID: '1',
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
PhaserInterface.prototype.gameObjectsConfigsMultiple = {
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

PhaserInterface.prototype.setInteractions() {
	// ================================================================
	// PREPARING DEFAULT GAME INTERACTIONS
	// ================================================================

	var zone = this.add.zone(0, 0, width/4, height/1.3).setRectangleDropZone(width/4, height/1.3);
	Phaser.Display.Align.In.Center(zone, background);
	zone.x -= width/2.8
	zone.y -= height/35

	//  Just a visual display of the drop zone
	var graphics = this.add.graphics();
	// Phaser.Display.Align.In.Center(graphics, background);
	// graphics.lineStyle(2, 0xffff00);
	// graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);


	var commandPos = {"x":zone.x, "y": height/10}
	var commandStepDistance = height/25
	var newDrag = false

	player.x -= width/ 6.8
	player.y += height/ 17

	vraagteken.x -= width/ 6.8
	vraagteken.y += height/ 17

	vraagteken.x += stepsize_horizontal * 7
	vraagteken.y -= stepsize_vertical * 4

	// ================================================================
	// handle click events for different buttons
	// ================================================================

	this.input.on('dragstart', function (pointer, gameObject) {
		this.children.bringToTop(gameObject);
		newDrag = true
	}, this);

	this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
		gameObject.x = dragX;
		gameObject.y = dragY;
	});

	this.input.on('dragenter', function (pointer, gameObject, dropZone) {
		graphics.clear();
		// graphics.lineStyle(2, 0x00ffff);
		// graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
	});

	this.input.on('dragleave', function (pointer, gameObject, dropZone) {
		graphics.clear();
		// graphics.lineStyle(2, 0x0aaaaa);
		// graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
	});

	this.input.on('drop', function (pointer, gameObject, dropZone) {
		gameObject.x = commandPos.x;
		gameObject.y = commandPos.y;
		if(gameObject.data.command == "herhaal-x" && newDrag) {
			toggleRepeatOverlay();
			selectedObject = gameObject
		} else if(gameObject.data.command == "herhaal" && newDrag) {
			positionHerhaal(pointer, gameObject)
		} else if (newDrag) {
			gameObject.input.enabled = false;
			myself.ossie.addToStack(gameObject) // FIXME
			commandPos.y = commandPos.y + commandStepDistance
			newDrag = false // fixes the bug where this function triggers all the time
		}
	});

	this.input.on('dragend', function (pointer, gameObject, dropped) {
		if (gameObject.x > zone.x - zone.input.hitArea.width / 2 && gameObject.x < zone.x + zone.input.hitArea.width / 2 &&
			gameObject.y > zone.y - zone.input.hitArea.height / 2 && gameObject.y < zone.y + zone.input.hitArea.height / 2
			) {
			if(gameObject.data.command == "herhaal-x" && newDrag) {
				// renderRepeatPrompt("")
				toggleRepeatOverlay();
				selectedObject = gameObject
				// positionHerhaal(pointer, gameObject)
			}else if(gameObject.data.command == "herhaal" && newDrag) {
				positionHerhaal(pointer, gameObject)
			} else if (newDrag) {
				gameObject.x = commandPos.x;
				gameObject.y = commandPos.y;
				gameObject.input.enabled = false;
				myself.ossie.push(gameObject); // FIXME
				commandPos.y = commandPos.y + commandStepDistance
				newDrag = false
			}
		}
		// fix case for false negatives
		else if (!dropped)
		{
			gameObject.x = gameObject.input.dragStartX;
			gameObject.y = gameObject.input.dragStartY;
		}
		graphics.clear();
		// graphics.lineStyle(2, 0xffff00);
		// graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
	});

	uitvoeren.on('pointerdown', function (pointer) {
		this.setTint(0xff0000);
		myself.ossie.gameStart();
	});

	uitvoeren.on('pointerout', function (pointer) {
		this.clearTint();
	});

	uitvoeren.on('pointerup', function (pointer) {
		this.clearTint();
	});

	// rewrite this function using restart and this. methods
	// reloads the whole scene, should instead just reposition objects etc.
	opnieuw.on('pointerdown', function (pointer) {
		console.log("restarting level")
		game.scene.stop('level2');
		game.scene.start('level2');
	}, this);

	uitvoeren.on('pointerout', function (pointer) {
		this.clearTint();
	});

	uitvoeren.on('pointerup', function (pointer) {
		this.clearTint();
	});

	opnieuw.on('pointerover', function (event, gameObjects) {
		opnieuw.setTexture("opnieuw-hover")
	});
	opnieuw.on('pointerout', function (event, gameObjects) {
		opnieuw.setTexture("opnieuw")
	});

	uitvoeren.on('pointerover', function (event, gameObjects) {
		uitvoeren.setTexture("uitvoeren-hover")
	});
	uitvoeren.on('pointerout', function (event, gameObjects) {
		uitvoeren.setTexture("uitvoeren")
	});

	/**
	* process the commandList, calls processSingle using timed events.
	*/
	function processCommands(commandList) {
		return myself.ossie.gameStart();
		// lol
		// FIXME add event handlers for ossie events

		if(commandList.length > 0 && commandIndex == 0) {

			let extra_steps = 0 //extra steps added by repeat
			let commandNames = []
			commandList.forEach(function(commandObject) {
				commandNames.push(commandObject.data.command)
				if (commandObject.data.command == "herhaal") {
					extra_steps += commandObject.data.range
				}
				if (commandObject.data.command == "herhaal-x") {
					extra_steps += commandObject.data.range * commandObject.data.repeats
				}

			});
			console.log("executing the follow command chain: ", commandNames)
			console.log("lenght of command chain: ", commandList.length)
			console.log("extra steps added for repeated commands: ", extra_steps)
			// process the commands using a timed event to allow player to see what's happening
			timedEvent = myself.time.addEvent({ delay: 500, callback: processSingle, callbackScope: myself, repeat: commandList.length-1 + extra_steps});
		}
	}

	/**
	* displays a victory image on screen when victory event is fired
	*/
	this.events.on('victory', handlevictory, this);
	function handlevictory()
	{
		var victoryimage = this.add.image(0, 0, 'victory');
		Phaser.Display.Align.In.Center(victoryimage, background);
		victoryimage.setDisplaySize(width/4, height/4)
		victoryimage.setInteractive()
		victoryimage.on('pointerdown', function (pointer) {
			console.log("loading next level")
			game.scene.stop('level2');
			game.scene.start('level3');
		}, this);
	}

	// ================================================================
	// PLAYER AND COMMAND MOVEMENT INTERACTIONS
	// ================================================================

	// gameboard internal representation, board is 0-indiced, 1 means block is taken, 0 means free


	var herhaalcounter = 0 // commands left in the repeated section (moving through the section)
	var herhaalrange = 0 // range of the repeated section (next x commands to repeat)
	var herhaalx = 0 // times the section needs to be repeated

	/**
	* Processes a single command from the commandList, takes the command at the global commandIndex variable
	*/
	// FIXME this is Ossie stuff, but theres good phaser stuff in here. Event handling should happen here
	function processSingle() {
		// clear color of previous command if applicable
		if (commandIndex > 0) {
			commandList[commandIndex-1].clearTint()
		}

		// emit victory event if player is positioned at the victorypoint
		if (player.gridposition.x == victorypos.x && player.gridposition.y == victorypos.y) {
			myself.events.emit('victory');
		}

		// color the current command if it is not the repeat command
		var commandObject = commandList[commandIndex]
		command = commandObject.data.command
		if (command != "herhaal") {
			commandList[commandIndex].setTint(0xff0000)
		}

		console.log("-------------")
		console.log("commandIndex: ", commandIndex)
		console.log("processing command: ", command)
		console.log("player position on grid: ", player.gridposition)
		console.log("herhaalcounter", herhaalcounter)
		console.log("herhaalrange", herhaalrange)
		console.log("herhaalx", herhaalx)

		// process stap command based on player orientation and availability of block
		if(command == "stap") {
			if (player.data.orientation == "right" && filledblocks[player.gridposition.y][player.gridposition.x + 1] != null) {
				if(filledblocks[player.gridposition.y][player.gridposition.x + 1] == 0) {
					player.x = player.x + stepsize_horizontal
					player.gridposition.x += 1
				}
			}
			if (player.data.orientation == "up" && filledblocks[player.gridposition.y - 1][player.gridposition.x] != null) {
				if(filledblocks[player.gridposition.y - 1][player.gridposition.x] == 0) {
					player.y = player.y - stepsize_vertical
					player.gridposition.y -= 1
				}
			}
			if (player.data.orientation == "left" && filledblocks[player.gridposition.y][player.gridposition.x - 1] != null) {
				if(filledblocks[player.gridposition.y][player.gridposition.x - 1] == 0) {
					player.x = player.x + stepsize_horizontal
					player.gridposition.x -= 1
				}
			}
			if (player.data.orientation == "down" && filledblocks[player.gridposition.y + 1][player.gridposition.x] != null) {
				if(filledblocks[player.gridposition.y + 1][player.gridposition.x] == 0) {
					player.y = player.y + stepsize_vertical
					player.gridposition.y += 1
				}
			}
		}
		// FIX THE COLLISIONS WHEN USING REPEAT-X
		// process turn commands
		if(command == "draailinks") {
			turndict = {
				"right":"up",
				"left":"down",
				"up":"left",
				"down":"right",
				}
			player.data.orientation = turndict[player.data.orientation]
			player.angle = player.angle - 90
		}
		if(command == "draairechts") {
			turndict = {
				"right":"down",
				"left":"up",
				"up":"right",
				"down":"left",
				}
			player.angle = player.angle + 90
			player.data.orientation = turndict[player.data.orientation]
		}

		// check if if we are at the end of a repeated section of commands
		if(herhaalcounter > 0) {
			herhaalcounter -= 1
		}
		if (herhaalcounter == 0) {
				console.log(2)
				if (herhaalx == 0) {
					console.log(3)
					// commandIndex -= herhaalrange //
					herhaalrange = 0 // reset herhaalrange
				} else {
					console.log(4)
					herhaalx -= 1
					commandIndex -= herhaalrange
					console.log("commandindex", commandIndex)
				}
			}

		// check if the current command is herhaal/repeat
		if (command == "herhaal") {
			herhaalrange = commandObject.data.range
			herhaalcounter = herhaalrange
			herhaalx = 1
			commandList[commandIndex+1].setTint(0xff0000)

		}
		// use the sluit command for testing purposes
		if (command == "herhaal-x") {
			herhaalrange = commandObject.data.range
			herhaalcounter = herhaalrange
			herhaalx = commandObject.data.repeats
			commandList[commandIndex+1].setTint(0xff0000)
		}
		commandIndex += 1
	}


	/**
	* Position the herhaal command and the corresponding bracket in the commandzone
	*/
	function positionHerhaal(pointer, gameObject) {

			// snap to nearest step
			let herhaalheight = height/10
			let herhaalindex = 0
			while (gameObject.y > herhaalheight && herhaalheight < commandPos.y) {
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
			var bracket = myself.add.sprite(0, 0, "bracket1")
			bracket.setInteractive()
			// gameObject.data.bracket = bracket
			bracket.input.enabled = true;
			Phaser.Display.Align.In.Center(bracket, background);
			bracket.y = herhaalheight + commandStepDistance/2
			bracket.x = commandPos.x
			// position bracket underneat regular commands
			bracket.setDepth(1)
	}

	this.input.on('pointerover', function (event, gameObjectList) {
		try {
			console.log(gameObjectList[0])
			// gameObjectList[0].setTint(0xff0000)
			gameObjectList[0].setTexture(gameObjectList[0].texture.key + "-hover")
		}
		catch(err) {
			console.log(err.message);
		}
	});

	this.input.on('pointerout', function (event, gameObjectList) {
		try {
			// gameObjectList[0].clearTint();
			gameObjectList[0].setTexture(gameObjectList[0].texture.key.slice(0,-6))
		}
		catch(err) {
			console.log(err.message);
		}
	});

	window.handleRepeat = function() {
		console.log("herhalingen: ", document.repeatform.herhalingen.value)
		toggleRepeatOverlay()
		selectedObject.data.repeats = document.repeatform.herhalingen.value
		positionHerhaal(null, selectedObject)
	}

	// FUNCTIONS TO HANDLE INTERACTION WITH HTML
	renderRepeatPrompt("")
	function renderRepeatPrompt(text) {
		el = document.getElementById("repeatOverlay");
		var html = "";

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

}

PhaserUtils.loadSprites = function(phaser, spriteArray) {
	spriteArray.shift(commonSprites);
	for (let spriteID of spriteArray) {
		let spriteLocation = sprites[spriteID];
		if (spriteLocation !== undefined) {
			phaser.load.image(spriteID, spriteLocation);
		} else {
			console.error('Couldnt find sprite with ID', spriteID);
		}
	}
}
let commonSprites = [
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
let sprites = {
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
