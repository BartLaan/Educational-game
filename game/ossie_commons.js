let exampleStack = [
	{
		func: "step",
	},
	{
		func: "if",
		condition: function(){ return !ossie.facingWall() },
		do: [
			{ func: "step" }
		],
		else: [
			{ func: "turnL" }
		],
	},
	{
		func: "for",
		limit: 3,
		do: [
			{ func: "step" },
			{ func: "step" },
			{ func: "turnR" },
		],

	}
];

let exampleNodes = [
	
]

function Ossie(nodes, allowedFuncs) {
	this.nodes = nodes;
	this.allowedFuncs = allowedFuncs !== undefined ? allowedFuncs : Object.keys(ossie.programSpecs);
	ossie.loadSprites();
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
			'limit' // Maximum amount of iterations of "do" stack
		],
	},

	// Ossie actions
	step: { required: [], optional: [] },
	turnL: { required: [], optional: [] },
	turnR: { required: [], optional: [] },
	turn: {
		required: [
			'degrees' // Degrees to turn by, handled clockwise. E.g. turn 90 is the same as turnR
		],
		optional: []
	}
}

Ossie.prototype.gameStart = function() {
	// disableInteraction();

	let timer = setInterval(function(){
		console.log(stack);

		if (stack.length === 0) { return false }

		let next = stack.shift();
		executeStack(next);

		if (ossie.betweenIters() || ossie.stack.length > 0) {
			clearInterval(timer);
		}
	}, 500);

	// enableInteraction();
}

Ossie.prototype.executeStack = function(stackItem) {
	debugStackItem(stackItem);
	if (ossie.allowedFuncs.indexOf(stackItem.func) == -1) {
		console.error('Stack contains unallowed item "' + stackItem.funct + '"');
	}

	switch (stackItem.func) {
		case "if":
			if (stackItem.condition()) {
				stackExecute(stackItem.do);
			} else if (stackItem.else !== undefined) {
				stackExecute(stackItem.else);
			}
			break;

		case "for":
			if (stackItem.limit !== undefined) {
				for (let i = 0; i < stackItem.limit; i++) {
					if (stackExecute(stackItem.do)) { return true }
				}
			} else {
				let secretLimit = 361;
				while (true) {
					stackExecute(stackItem.do);
				}
			}
			break;

		case "step":
			ossie.step();
			break;

		case "turnL":
		case "turnR":
			ossie.turnSide(stackItem.func === "turnL" ? 'left' : 'right');
			break;

		case "turn":
			ossie.turnDegrees(stackItem.degrees);

		default:
			ossie.action(stackItem.func);
			break;

	}

	return true;
}

Ossie.prototype.debugStackItem = function(stackItem) {
	if (stackItem.func === undefined) {
		console.error('Stack error: No action name');
		return false;
	}
	if (programSpecs[stackItem.func] === undefined) {
		console.error('Stack error: Unrecognized action name "' + stackItem.func + '"');
		return false;
	}
	for (requirement of programSpecs[stackItem.func]) {
		if (stackItem[requirement] === undefined) {
			console.error('Stack error: action "' + stackItem.func + '" missing required property "' + requirement + '"');
			return false;
		}
	}
}

Ossie.prototype.loadSprites = function(phaser) {
	phaser.load.image('background', 'assets/1-achtergrond.jpg');
	phaser.load.image('stap', 'assets/stap.png');
	phaser.load.image('open', 'assets/open.png');
	phaser.load.image('opnieuw', 'assets/opnieuw.png');
	phaser.load.image('sluit', 'assets/sluit.jpg');
	phaser.load.image('uitvoeren', 'assets/uitvoeren.png');
	phaser.load.image('oeps', 'assets/oeps.jpg');
	phaser.load.image('ossie', 'assets/ossie.png');
	// phaser.load.image('vraagteken', 'assets/vraagteken.png');
	phaser.load.image('victory', 'assets/placeholder_victory.png');
	phaser.load.image('victory-hover', 'assets/placeholder_victory-hover.png');

	// hover textures
	phaser.load.image('opnieuw-hover', 'assets/opnieuw-hover.png');
	phaser.load.image('open-hover', 'assets/open-hover.png');
	phaser.load.image('uitvoeren-hover', 'assets/uitvoeren-hover.png');
	phaser.load.image('stap-hover', 'assets/stap-hover.png');
	phaser.load.image('sluit-hover', 'assets/sluit-hover.png');

	phaser.load.image('0', 'assets/0.png');
	phaser.load.image('one', 'assets/1.png');
	phaser.load.image('2', 'assets/2.png');
	phaser.load.image('3', 'assets/3.png');
	phaser.load.image('4', 'assets/4.png');
	phaser.load.image('5', 'assets/5.png');
	phaser.load.image('6', 'assets/6.png');
	phaser.load.image('7', 'assets/7.png');
	phaser.load.image('8', 'assets/8.png');
	phaser.load.image('nine', 'assets/9.png');
	phaser.load.image('slash', 'assets/slash.png');
}
