// Constructor for OssieGame instance. See OssieGame.checkLevelConfig for details on levelConfig.
function OssieGame(levelConfig, phaser) {
	if (window.debug) {
		this.checkLevelConfig(levelConfig);
	}
	this.nodes = levelConfig.nodes;
	this.initPosition = levelConfig.initPosition;
	this.orientationType = levelConfig.orientationType;
	this.ossiePos = Utils.deepCopy(levelConfig.initPosition);
	this.interPhaser = new InterPhaser(phaser, levelConfig, this.phaserHandler.bind(this));
	if (window.debug) {
		console.log(this, this.interPhaser);
	}
};

OssieGame.prototype.checkLevelConfig = function(levelConfig) {
	let required = [
		'goalPosition', // Node reference of the goal
		'initPosition', // Object with the initial node (reference) of player and the direction they are facing
		'levelName', // Phaser level ID for current level
		'nodes', // Representation of the world that player can move in. See Utils to get better idea
		'objects', // list of phaser gameObjects to load. See InterPhaser.gameObjectsConfigs
		'orientationType', // cardinals or angles, see type specs in constants.js
		'spaceType', // grid or pixels, see type specs
	];
	for (let requiredItem of required) {
		if (levelConfig[requiredItem] === undefined) {
			console.error('Missing required levelConfig item', requiredItem);
		}
	}
}

OssieGame.prototype.phaserHandler = function(eventCode, data) {
	console.log('event', eventCode, 'data', data);
	switch (eventCode) {
		case PHASER_STACK_RESET:
			clearTimeout(this.timer);
			this.resetOssie();
			break;
		case PHASER_STACK_START:
			this.stack = data.stack;
			this.gameStart();
			break;
		default:
	}
}

OssieGame.prototype.eventHandler = function(eventCode, data) {
	// console.log('OSSIE EVENT: eventCode=' + eventCode + '; data=', data);
	switch (eventCode) {
		case STACK_EXECUTE_COMMAND:
			this.interPhaser.onCommandExecute(data);
			break;
		case STACK_FAIL:
		case STACK_OPEN_END:
			setTimeout(function(){
				this.interPhaser.fail();
				this.resetOssie();
			}.bind(this), 800);
			break;
		case STACK_OSSIEPOS_CHANGE:
			this.interPhaser.updateOssiePos(this.getPosition());
			break;
		case STACK_START:
			// this.interPhaser.disableStackInteraction();
			break;
		case STACK_WALKINTOWALL:
			break;
		case STACK_WIN:
			this.interPhaser.win();
			break;
		case STACK_FORGOTOPEN:
			this.interPhaser.fail();
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
		opional: [],
	},
	else: {
		required: [
			'do',
			'blockref',
		],
		optional: [],
	},
	for: {
		required: [
			'do' // Stack to execute repeatedly
		],
		optional: [
			'autoStop', // Stop when goal is reached
			'counts', // Maximum amount of iterations of "do" stack
		],
	},
	blockend: {
		required: [
			'blockRef' // if/else/for that the blockend belongs to
		],
		optional: []
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

OssieGame.prototype.getStackItem = function(stackIndex, stack) {
	if (stack === undefined) {
		stack = this.stack;
	}
	for (let object of stack) {
		if (object.stackIndex === stackIndex) {
			return object;
		}

		if (object.do !== undefined) {
			let foundObject = this.getStackItem(stackIndex, object.do);
			if (foundObject !== undefined) {
				return foundObject;
			}
		}
	}

	return undefined;
}

OssieGame.prototype.getPosition = function() {
	return this.ossiePos;
}

OssieGame.prototype.resetOssie = function() {
	this.ossiePos = Utils.deepCopy(this.initPosition);
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
	if (typeof degrees != 'number') { return console.error('I want a number here, not a string') }
	this.ossiePos.orientation = Utils.turnDegrees(this.ossiePos.orientation, degrees);
	this.eventHandler(STACK_OSSIEPOS_CHANGE);
}

OssieGame.prototype.conditional = function(conditionalCode) {
	switch (conditionalCode) {
		case CONDITIONAL_FORWARDFREE:
			return !this.facingWall();
		case CONDITIONAL_LEFTFREE:
			return this.pathExistsTo('left');
		case CONDITIONAL_RIGHTFREE:
			return this.pathExistsTo('right');
		case CONDITIONAL_ONGOAL:
			return this.isOnGoal();
		default:
			return true;
	}
}

OssieGame.prototype.isOnGoal = function() {
	return this.nodes[this.ossiePos.nodeLocation].goal === true
}

OssieGame.prototype.executeFor = function(stackItem, stack, callbackStacks) {
	if (stackItem.autoStop) {
		if (this.isOnGoal()) {
			stack.shift();
			return this.stackExecute(stack, callbackStacks);
		}
	} else if (stackItem.counts !== undefined && stackItem.counts <= 0) {
		// Only take forloop serious if it has at least 1
		stack.shift();
		return this.stackExecute(stack, callbackStacks);
	} else {
		if (stackItem.counter === undefined) {
			stackItem.counter = stackItem.counts;
		}
		stackItem.counter -= 1;
		if (stackItem.counter <= 0) {
			// If counter reaches zero, remove for command from stack and do the last loop
			stack.shift();
		}
	}
	callbackStacks.unshift(stack);

	let forStack = Utils.deepCopy(stackItem.do);
	return this.stackExecute(forStack, callbackStacks);

}

OssieGame.prototype.gameStart = function() {
	let stackToExecute = Utils.deepCopy(this.stack);
	if (stackToExecute.shift().commandID !== 'open') {
		return this.eventHandler(STACK_FORGOTOPEN);
	}

	this.stackExecute(stackToExecute, []);
}

OssieGame.prototype.gameEnd = function(proper) {
	if (proper && this.isOnGoal()) {
		this.eventHandler(STACK_WIN);
		if (window.debug) {
			console.log('won');
		}
		return;
	} else if (proper) {
		this.eventHandler(STACK_FAIL);
	}
	this.eventHandler(STACK_OPEN_END);
}

OssieGame.prototype.stackExecute = function(stack, callbackStacks) {
	// No commands left
	if (stack.length === 0 && callbackStacks.length === 0) {
		return this.gameEnd(false);
	}
	// Stack exhausted, continue with callbackStacks
	if (stack.length === 0) {
		let newStack = callbackStacks.shift();
		return this.stackExecute(newStack, callbackStacks);
	}


	// Freeze game so player can see what's happening, but only for actions that change position
	let timing = Utils.isBracketObject(stack[0].commandID) ? 0 : COMMAND_TIMING;
	let me = this;
	this.timer = setTimeout(function(){
		me.executeStackItem(stack, callbackStacks);
	}, timing);
}

// Execute a stack item. Returns true if player enters win condition
OssieGame.prototype.executeStackItem = function(stack, callbackStacks) {
	let stackItem = stack[0];
	// this.debugStackItem(stackItem);
	console.log('executing command:', stackItem.commandID, this.ossiePos);

	this.eventHandler(STACK_EXECUTE_COMMAND, stackItem.objectRef);
	// For loops prepend the current stack to callbackStacks and call stackExecute with the for stack:
	// stackExecute(forStack, [currentStack, ...callbackStacks])
	// Everytime this happens, the counter of the forloop updates and when it reaches 0, we continue
	// with the currentStack
	if (stackItem.commandID !== "for") {
		stack.shift();
	}

	switch (stackItem.commandID) {
		case "if":
			if (this.conditional(stackItem.condition)) {
				console.log('conditional', stackItem.condition, true);
				callbackStacks.unshift(stack);
				return this.stackExecute(stackItem.do, callbackStacks);
			}
			break;

		case "else":
			let ifObject = this.getStackItem(stackItem.blockRef);
			console.log('found ifobject for else:', ifObject);
			if (this.conditional(ifObject.condition) === false) {
				callbackStacks.unshift(stack);
				return this.stackExecute(stackItem.do, callbackStacks);
			}
			break;

		case "for":
			return this.executeFor(stackItem, stack, callbackStacks);

		case "step":
			this.step();
			break;

		case "turnL":
			this.turnL();
			break;
		case "turnR":
			this.turnR();
			break;

		case "turnDegrees":
			this.turnDegrees(stackItem.degrees);
			break;

		case "close":
			return this.gameEnd(true);

		default:
			console.log('skip command', stackItem.commandID);
	}

	return this.stackExecute(stack, callbackStacks);
}

OssieGame.prototype.debugStackItem = function(stackItem) {
	console.log('Executing stack item: ', stackItem.commandID);
	if (stackItem.commandID === undefined) {
		console.error('Stack error: No action name');
		return false;
	}
	if (this.commandSpecs[stackItem.commandID] === undefined) {
		console.error('Stack error: Unrecognized action name "' + stackItem.commandID + '"');
		return false;
	}
	for (let requirement of this.commandSpecs[stackItem.commandID].required) {
		if (stackItem[requirement] === undefined) {
			console.error('Stack error: action "' + stackItem.commandID + '" missing required property "' + requirement + '"');
			return false;
		}
	}
}
