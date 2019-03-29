STACK_EXECUTE_COMMAND = 'STACK_EXECUTE_COMMAND'
STACK_OSSIEPOS_CHANGE = 'STACK_OSSIEPOS_CHANGE'
STACK_OPEN_END = 'STACK_OPEN_END'
STACK_RESET = 'STACK_RESET'
STACK_START = 'STACK_START'
STACK_WALKINTOWALL = 'STACK_WALKINTOWALL'
STACK_WIN = 'STACK_WIN'
CONDITIONAL_FORWARDFREE = 'CONDITIONAL_FORWARDFREE'
CONDITIONAL_LEFTFREE = 'CONDITIONAL_LEFTFREE'
CONDITIONAL_RIGHTFREE = 'CONDITIONAL_RIGHTFREE'


// Constructor for OssieGame instance. See OssieGame.checkLevelConfig for details on levelConfig.
// Overriding of certain prototype properties is intented.
function OssieGame(levelConfig, phaser) {
	this.checkLevelConfig(levelConfig);
	this.nodes = levelConfig.nodes;
	this.initPosition = levelConfig.initPosition;
	this.ossiePos = levelConfig.initPosition;
	this.interPhaser = new InterPhaser(phaser, levelConfig, this.phaserHandler);
};

OssieGame.prototype.checkLevelConfig = function(levelConfig) {
	let required = [
		'background', // Sprite ID of background to use
		'goalPosition', // Node reference of the goal
		'initPosition', // Object with the initial node (reference) of player and the direction they are facing
		'levelCount', // Used for sprite ID for level counter
		'levelName', // Phaser level ID for current level
		'nextLevelName', // Phaser level ID for next level
		'nodes', // Representation of the world that player can move in. See Utils to get better idea
		'objects', // list of phaser gameObjects to load. See InterPhaser.gameObjectsConfigs
		'orientationType', // 'cardinals' or 'angles'
		'spaceType', // 'grid' or 'pixels'
	];
	for (let requiredItem of required) {
		if (levelConfig[requiredItem] === undefined) {
			console.error('Missing required levelConfig item', requiredItem);
		}
	}
}

OssieGame.prototype.phaserHandler = function(eventCode, data) {
	switch (eventCode) {
		case PHASER_RESET:
			clearTimeout(this.timer);
			this.resetOssie();
			this.clearStack();
			break;
		case PHASER_STACK_START:
			this.gameStart();
			break;
		case PHASER_STACK_DELETE:
			this.stack.splice(data.stackIndex, 1);
			break;
		case PHASER_STACK_ADD:
			this.stack.splice(data.stackIndex, 0, data.stackItem);
			break;
		default:
	}
}

OssieGame.prototype.eventHandler = function(eventCode, data) {
	switch (eventCode) {
		case STACK_EXECUTE_COMMAND:
			this.interPhaser.executingCommand(data);
			break;
		case STACK_OSSIEPOS_CHANGE:
			this.interPhaser.updateOssiePos(this.getPosition());
			break;
		case STACK_START:
			this.interPhaser.disableStackInteraction();
			break;
		case STACK_WALKINTOWALL:
			break;
		case STACK_WIN:
			this.interPhaser.win();
			break;

		default:
	}
}

OssieGame.prototype.commandSpecs = {
	open: { required: [], optional: [] },
	close: { required: [], optional: [] },
	// Logic flow
	if: {
		required: [
			'condition', // Function to evaluate truthiness of
			'do', // Stack to execute if "condition" is evaluated as true
		],
		optional: [
			'else' // Function to execute if "condition" is evaluated as false
		],
	},
	for: {
		required: [
			'do' // Stack to execute repeatedly
		],
		optional: [
			'counts' // Maximum amount of iterations of "do" stack
		],
	},

	// Ossie actions
	step: { required: [], optional: [] },
	turnL: { required: [], optional: [] },
	turnR: { required: [], optional: [] },
	turnDegrees: {
		required: [
			'degrees' // Degrees to turn by, handled clockwise. E.g. turn 90 is equal to turnR
		],
		optional: []
	}
}

// FEEL FREE TO OVERRIDE
OssieGame.prototype.allowedCommands = Object.keys(OssieGame.prototype.commandSpecs);
OssieGame.prototype.timing = 300;
OssieGame.prototype.secretLimit = 20;

OssieGame.prototype.addToStack = function(stackItem) {
	this.stack.push(stackItem);
	this.debugStackItem(stackItem);
}

OssieGame.prototype.getPosition = function() {
	return this.ossiePos;
}

// not used
OssieGame.prototype.clearStack = function() {
	this.stack = [];
}
OssieGame.prototype.resetOssie = function() {
	this.ossiePos = this.initPosition;
	this.eventHandler(STACK_OSSIEPOS_CHANGE);
}

OssieGame.prototype.step = function() {
	let newNode = this.nodes[this.ossiePos.nodeLocation][this.ossiePos.orientation];
	if (newNode !== undefined) {
		this.ossiePos.nodeLocation = newNode;
		this.eventHandler(STACK_OSSIEPOS_CHANGE);
	} else {
		this.eventHandler(STACK_WALKINTOWALL);
		console.log("BONK, you walked into a wall");
	}
}

OssieGame.prototype.facingWall = function() {
	let node = this.nodes[this.ossiePos.nodeLocation];
	return node[this.ossiePos.orientation] === undefined;
}

OssieGame.prototype.pathExistsTo = function(direction) {
	let node = this.nodes[this.ossiePos.nodeLocation];
	let clockWise = direction === 'right';
	let nodeDirection = Utils.turnClock(this.ossiePos.orientation, clockWise);
	return node[nodeDirection] !== undefined;
}

OssieGame.prototype.turnL = function() {
	this.ossiePos.orientation = Utils.turnClock(this.ossiePos.orientation, false);
	this.eventHandler(STACK_OSSIEPOS_CHANGE);
}
OssieGame.prototype.turnR = function() {
	this.ossiePos.orientation = Utils.turnClock(this.ossiePos.orientation, true);
	this.eventHandler(STACK_OSSIEPOS_CHANGE);
}

OssieGame.prototype.turnDegrees = function(degrees) {
	if (typeof degrees != 'number') { return console.error('I want a number here, not a string or degrees') }
	this.ossiePos.orientation = this.ossiePos.orientation + degrees;
}

OssieGame.prototype.conditional = function(conditionalCode) {
	switch (conditionalCode) {
		case CONDITIONAL_FORWARDFREE:
			return !this.facingWall();
		case CONDITIONAL_LEFTFREE:
			return this.pathExistsTo('left');
		case CONDITIONAL_RIGHTFREE:
			return this.pathExistsTo('right');
		default:
			return true;
	}
}

OssieGame.prototype.gameStart = function() {
	this.interPhaser.disableStackInteraction();

	const stackToExecute = Utils.deepCopy(this.stack);
	this.stackExecute(stackToExecute, []);
}

OssieGame.prototype.gameEnd = function(proper) {
	if (proper && this.nodes[this.ossiePos.nodeLocation].goal){
		this.eventHandler(STACK_WIN);
		console.log('won');
		return;
	}
	this.eventHandler(STACK_OPEN_END);
	// this.reset();
}

//
OssieGame.prototype.stackExecute = function(stack, callbackStacks) {
	// console.log('Stack execute:', stack.length, callbackStacks.length);
	let newStack = stack.length > 0 ? stack : callbackStacks.shift();

	if (newStack === undefined || newStack.length == 0) {
		return this.gameEnd(false);
	}

	let me = this;
	this.timer = setTimeout(function(){
		me.executeStackItem(newStack, callbackStacks);
		console.log(JSON.stringify(me.ossiePos));
		// console.log(d, JSON.stringify(stacks.stack));
	}, this.timing)
}

// Execute a stack item. Returns true if player enters win condition
OssieGame.prototype.executeStackItem = function(stack, callbackStacks) {
	let stackItem = stack[0];
	this.debugStackItem(stackItem);

	this.eventHandler(STACK_EXECUTE_COMMAND, stackItem.phaserObj);
	// For loops prepend the current stack to callbackStacks and call stackExecute with the for stack:
	// stackExecute(forStack, [currentStack, ...callbackStacks])
	// Everytime this happens, the counter of the forloop updates and when it reaches 0, we continue
	// with the currentStack
	if (stackItem.command !== "for") {
		stack.shift();
	}

	switch (stackItem.command) {
		case "if":
			callbackStacks.unshift(stack);
			if (stackItem.condition(this)) {
				return this.stackExecute(stackItem.do, callbackStacks);
			} else if (stackItem.else !== undefined) {
				return this.stackExecute(stackItem.else, callbackStacks);
			}
			break;

		case "for":
			stackItem.counts -= 1;
			if (stackItem.counts == 0) {
				stack.shift();
			}
			callbackStacks.unshift(stack);

			let forStack = Utils.deepCopy(stackItem.do);
			return this.executeStackItem(forStack, callbackStacks);

		case "step":
			this.step();
			break;

		case "turnL":
			this.turnL();
			break;
		case "turnR":
			this.turnR();
			break;

		case "turn":
			this.turnDegrees(stackItem.degrees);
			break;

		case "close":
			return this.gameEnd(true);

		default:
			console.log('this is probably open. just continue');
	}

	return this.stackExecute(stack, callbackStacks);
}

OssieGame.prototype.debugStackItem = function(stackItem) {
	console.log('Executing stack item: ', stackItem.command);
	if (stackItem.command === undefined) {
		console.error('Stack error: No action name');
		return false;
	}
	if (this.commandSpecs[stackItem.command] === undefined) {
		console.error('Stack error: Unrecognized action name "' + stackItem.command + '"');
		return false;
	}
	for (let requirement of this.commandSpecs[stackItem.command].required) {
		if (stackItem[requirement] === undefined) {
			console.error('Stack error: action "' + stackItem.command + '" missing required property "' + requirement + '"');
			return false;
		}
	}
	if (this.allowedCommands.indexOf(stackItem.command) == -1) {
		console.error('Stack contains unallowed item "' + stackItem.commandt + '"');
	}
}
