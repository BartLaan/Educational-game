EVENT_OSSIEPOS_CHANGE = 'EVENT_OSSIEPOS_CHANGE'
EVENT_RESET = 'EVENT_RESET'
EVENT_START = 'EVENT_START'
EVENT_WALKINTOWALL = 'EVENT_WALKINTOWALL'
EVENT_WIN = 'EVENT_WIN'

// Constructor for Ossie game instance
//	nodes should be an object with nodes (documentated more detailed in utils.js)
//	initPosition should be an object containing the index of the node ossie starts on, and the direction he is facing
//	config should be an object specifying config values to be overriden. Possible values are:
//		allowedFuncs: array of functions that the player is allowed to use. Default is every entry in programSpecs
//		timing: time in ms to wait before executing next programming block
//		secretLimit: limit for unlimited while loops before game automatically stops
function Ossie(nodes, initPosition, onEvent, config) {
	this.nodes = nodes;
	this.initPosition = initPosition;
	this.ossiePos = initPosition;
	this.onEvent onEvent;

	if (config !== undefined) {
		for (key in config) {
			this[key] = config[key];
		}
	}

	// this.loadSprites();
};

Ossie.prototype.programSpecs = {
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

Ossie.prototype.allowedFuncs = Object.keys(Ossie.prototype.programSpecs);
Ossie.prototype.timing = 300;
Ossie.prototype.secretLimit = 20;

Ossie.prototype.addToStack = function(stackItem) {
	this.stack.push(stackItem);
	this.debugStackItem(stackItem);
}

Ossie.prototype.getPosition = function() {
	return this.ossiePos;
}

Ossie.prototype.reset = function() {
	this.stack = [];
	this.ossiePos = this.initPosition;
	this.onEvent(EVENT_RESET);
}

Ossie.prototype.step = function() {
	let newNode = this.nodes[this.ossiePos.nodeLocation][this.ossiePos.orientation];
	if (newNode !== undefined) {
		this.ossiePos.nodeLocation = newNode;
		this.onEvent(EVENT_OSSIEPOS_CHANGE);
	} else {
		this.onEvent(EVENT_WALKINTOWALL);
		console.log("BONK, you walked into a wall");
	}
}

Ossie.prototype.facingWall = function() {
	let node = this.nodes[this.ossiePos.nodeLocation];
	return node[this.ossiePos.orientation] === undefined;
}

Ossie.prototype.pathExistsTo = function(direction) {
	let node = this.nodes[this.ossiePos.nodeLocation];
	return node[direction] !== undefined;
}

Ossie.prototype.turnClock = function(clockWise) {
	let cardinals = ['north', 'east', 'south', 'west'];
	let shift = clockWise ? cardinals.length - 1 : 1; // 3 = -1 when doing modulo operation

	let orientationIdx = cardinals.indexOf(this.ossiePos.orientation);
	let newOrientationIdx = (orientationIdx + shift) % (cardinals.length - 1);

	this.ossiePos.orientation = cardinals[newOrientationIdx];
	this.onEvent(EVENT_OSSIEPOS_CHANGE);
}
Ossie.prototype.turnL = function() { this.turnClock(false); }
Ossie.prototype.turnR = function() { this.turnClock(true); }

Ossie.prototype.turnDegrees = function(degrees) {
	if (typeof degrees != 'number') { return console.error('I want a number here, not a string or degrees') }
	this.ossiePos.orientation = this.ossiePos.orientation + degrees;
}

Ossie.prototype.gameStart = function() {
	this.onEvent(EVENT_START);
	this.stackExecute(this.stack, []);
}

Ossie.prototype.gameEnd = function() {
	if (this.nodes[this.ossiePos.nodeLocation].goal){
		this.onEvent(EVENT_WIN);
		console.log('won');
		return;
	}
	// this.reset();
}

//
Ossie.prototype.stackExecute = function(stack, callbackStacks) {
	// console.log('Stack execute:', stack.length, callbackStacks.length);
	let newStack = stack.length > 0 ? stack : callbackStacks.shift();

	if (newStack === undefined || newStack.length == 0) {
		return this.gameEnd();
	}

	let me = this;
	setTimeout(function(){
		me.executeStackItem(newStack, callbackStacks);
		console.log(JSON.stringify(me.ossiePos));
		// console.log(d, JSON.stringify(stacks.stack));
	}, this.timing)
}

// Execute a stack item. Returns true if player enters win condition
Ossie.prototype.executeStackItem = function(stack, callbackStacks) {
	let stackItem = stack[0];
	this.debugStackItem(stackItem);

	if (stackItem.func !== "for") {
		stack.shift();
	}

	switch (stackItem.func) {
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
	}

	return this.stackExecute(stack, callbackStacks);
}

Ossie.prototype.debugStackItem = function(stackItem) {
	console.log('Executing stack item: ', stackItem.func);
	if (stackItem.func === undefined) {
		console.error('Stack error: No action name');
		return false;
	}
	if (this.programSpecs[stackItem.func] === undefined) {
		console.error('Stack error: Unrecognized action name "' + stackItem.func + '"');
		return false;
	}
	for (let requirement of this.programSpecs[stackItem.func].required) {
		if (stackItem[requirement] === undefined) {
			console.error('Stack error: action "' + stackItem.func + '" missing required property "' + requirement + '"');
			return false;
		}
	}
	if (this.allowedFuncs.indexOf(stackItem.func) == -1) {
		console.error('Stack contains unallowed item "' + stackItem.funct + '"');
	}
}
