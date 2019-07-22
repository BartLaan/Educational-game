// SIZES
BOARD_STEPSIZE_X = 0.0776
BOARD_STEPSIZE_Y = 0.1044
BOARD_OFFSET_X = 0.33
BOARD_OFFSET_Y = 0.072
CONFIRM_POS_X = 0.4
CONFIRM_POS_Y = 0.74
COMMAND_AREA_X = 0.43
COMMAND_AREA_Y = 0.78
FAILBUTTON_X = 0.4
FAILBUTTON_Y = 0.6
HOVER_SCALING = 1.04;
NUM_SPACING = 0.015;
NUM_SCALING = 0.6;
STACK_AVG_CMD_SIZE = 0.04
STACK_BRACKET_INDENT = 0.027
STACK_BRACKET_OFFSET = 0.01
STACK_BRACKET_SPACING = 0.02
STACK_COMMAND_SPACING = 0.002
STACK_ZONE_POS_X = 0.07
STACK_ZONE_POS_Y = 0.04
STACK_ZONE_HEIGHT = 0.92
STACK_ZONE_WIDTH = 0.21
STEP_COUNT_DISPLAY_X = 0.039
STEP_COUNT_DISPLAY_Y = 0.958;
STEP_COUNT_SPACING = 0.019;
WINBUTTON_Y = 0.88

BASE_SIZE_X = 1024;
BASE_SIZE_Y = 768;
// etc
COMMAND_TIMING = 400 // ms
SCALING_FACTOR_DIV = 1024
VICTORY_TIMEOUT = 1500 // ms
WH_RATIO = 1.3333333333

// Initial configuration for objects
OBJECT_CONF = {
	// HTML now, to display gifs
	// againButton: {
	// 	depth: 4,
	// 	interactive: true,
	// 	offsetX: 0.25,
	// 	offsetY: WINBUTTON_Y,
	// 	spriteID: 'playagain',
	// },
	backButton: {
		depth: 2,
		interactive: true,
		offsetX: 0.97,
		offsetY: 0.825,
		spriteID: 'backbutton',
	},
	bracketBottom: {
		command: { commandID: 'blockend' },
		depth: 1,
		spriteID: 'bracket-bottom',
	},
	bracketSide: {
		depth: 1,
		spriteID: 'bracket-middle',
	},
	bracketTop: {
		depth: 1,
		spriteID: 'bracket-top',
	},
	close: {
		command: { commandID: 'close' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y + 0.077,
		scaling: 0.9,
		spriteID: 'close',
	},
	else: {
		command: { commandID: 'else' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.114,
		offsetY: COMMAND_AREA_Y + 0.096,
		spriteID: 'else',
	},
	execute: {
		interactive: true,
		offsetX: 0.213,
		offsetY: 0.937,
		spriteID: 'execute',
	},
	for: {
		command: { commandID: "for", counts: 9999 },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.46,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'for',
	},
	for_till: {
		command: { commandID: 'for', autoStop: true },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.465,
		offsetY: COMMAND_AREA_Y + 0.082,
		spriteID: 'for-till',
	},
	for_x: {
		command: { commandID: "for", counts: null },
		depth: 2,
		draggable: true,
		numOffsetX: 0.018,
		numOffsetY: 0.019,
		offsetX: COMMAND_AREA_X + 0.465,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'for-x',
	},
	if_padlinks: {
		command: { commandID: "if", condition: CONDITIONAL_LEFTFREE },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.124,
		offsetY: COMMAND_AREA_Y + 0.048,
		spriteID: 'if-padlinks',
	},
	if_padrechts: {
		command: { commandID: "if", condition: CONDITIONAL_RIGHTFREE },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.235,
		offsetY: COMMAND_AREA_Y + 0.048,
		spriteID: 'if-padrechts',
	},
	if_padvooruit: {
		command: { commandID: "if", condition: CONDITIONAL_FORWARDFREE },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.35,
		offsetY: COMMAND_AREA_Y + 0.048,
		spriteID: 'if-padvooruit',
	},
	// HTML now, to display gifs
	// nextButton: {
	// 	depth: 4,
	// 	interactive: true,
	// 	offsetX: 0.74,
	// 	offsetY: WINBUTTON_Y,
	// 	spriteID: 'nextlevel',
	// },
	// okButton: {
	// 	depth: 4,
	// 	interactive: true,
	// 	offsetX: CONFIRM_POS_X,
	// 	offsetY: CONFIRM_POS_Y,
	// 	spriteID: 'ok',
	// },
	open: {
		command: { commandID: 'open' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y + 0.018,
		scaling: 0.9,
		spriteID: 'open',
	},
	player: {
		depth: 3,
		scaling: 0.13,
		spriteID: 'ossie',
	},
	questionmark: {
		scaling: 1.1,
		spriteID: 'questionmark',
	},
	reset: {
		interactive: true,
		offsetX: 0.375,
		offsetY: 0.735,
		scaling: 0.95,
		spriteID: 'reset',
	},
	step: {
		command: { commandID: 'step' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.1,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'step',
	},
	stepcount: {
		interactive: true,
		offsetX: STEP_COUNT_DISPLAY_X,
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 0.9,
		spriteID: '0',
	},
	stepcount_slash: {
		offsetX: STEP_COUNT_DISPLAY_X + (STEP_COUNT_SPACING * 2) -0.005,
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 0.9,
		spriteID: 'slash',
	},
	stepcount_total: {
		offsetX: STEP_COUNT_DISPLAY_X + (STEP_COUNT_SPACING * 3),
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 0.9,
	},
	turndegrees: {
		command: { commandID: 'turnDegrees', degrees: null },
		depth: 2,
		draggable: true,
		numOffsetX: 0.04,
		numOffsetY: 0,
		offsetX: COMMAND_AREA_X + 0.21,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'turndegrees',
	},
	turnleft: {
		command: { commandID: 'turnL' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.2,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'turnleft',
	},
	turnright: {
		command: { commandID: 'turnR' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.335,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'turnright',
	},
}
