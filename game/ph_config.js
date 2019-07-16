// SIZES
BOARD_STEPSIZE_RELATIVE_TO_HEIGHT = 0.101
BOARD_OFFSET_X = 0.3
BOARD_OFFSET_Y = 0.035
CONFIRM_POS_X = 0.25
CONFIRM_POS_Y = 0.615
CONFIRM_WIDTH = 0.13
CONFIRM_HEIGHT = 0.08
COMMAND_AREA_X = 0.38
COMMAND_AREA_Y = 0.76
FAILBUTTON_X = 0.4
FAILBUTTON_Y = 0.6
HOVER_SCALING = 1.05;
STACK_AVG_CMD_SIZE = 0.04
STACK_BRACKET_INDENT = 0.02
STACK_BRACKET_OFFSET = 0.009
STACK_BRACKET_SPACING = 0.02
STACK_COMMAND_SPACING = 0.004
STACK_ZONE_POS_X = 0.035
STACK_ZONE_POS_Y = 0.042
STACK_ZONE_WIDTH = 0.25
STACK_ZONE_HEIGHT = 0.83
STEP_COUNT_DISPLAY_X = 0.024
STEP_COUNT_DISPLAY_Y = 0.929;
STEP_COUNT_SPACING = 0.016;
VICTORY_TIMEOUT = 1200 // ms
WINBUTTON_Y = 0.88

// etc
SCALING_FACTOR_DIV = 1024
WH_RATIO = 1.3333333333


// Initial configuration for objects
OBJECT_CONF = {
	againButton: {
		depth: 4,
		interactive: true,
		offsetX: 0.25,
		offsetY: WINBUTTON_Y,
		spriteID: 'playagain',
	},
	backButton: {
		depth: 2,
		interactive: true,
		offsetX: 0.95,
		offsetY: 0.735,
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
		offsetY: COMMAND_AREA_Y + 0.085,
		scaling: 0.9,
		spriteID: 'close',
	},
	else: {
		command: { commandID: 'else' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.12,
		offsetY: COMMAND_AREA_Y + 0.096,
		spriteID: 'else',
	},
	execute: {
		interactive: true,
		offsetX: 0.135,
		offsetY: 0.89,
		spriteID: 'execute',
	},
	for: {
		command: { commandID: "for"},
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
		offsetY: COMMAND_AREA_Y + 0.063,
		spriteID: 'for-till',
	},
	for_x: {
		command: { commandID: "for", counts: null },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.465,
		offsetY: COMMAND_AREA_Y - 0.01,
		spriteID: 'for-x',
	},
	if_padlinks: {
		command: { commandID: "if", condition: CONDITIONAL_LEFTFREE },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.12,
		offsetY: COMMAND_AREA_Y + 0.048,
		spriteID: 'if-padlinks',
	},
	if_padrechts: {
		command: { commandID: "if", condition: CONDITIONAL_RIGHTFREE },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.23,
		offsetY: COMMAND_AREA_Y + 0.048,
		spriteID: 'if-padrechts',
	},
	if_padvooruit: {
		command: { commandID: "if", condition: CONDITIONAL_FORWARDFREE },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.34,
		offsetY: COMMAND_AREA_Y + 0.048,
		spriteID: 'if-padvooruit',
	},
	nextButton: {
		depth: 4,
		interactive: true,
		offsetX: 0.74,
		offsetY: WINBUTTON_Y,
		spriteID: 'nextlevel',
	},
	okButton: {
		depth: 4,
		interactive: true,
		offsetX: CONFIRM_POS_X,
		offsetY: CONFIRM_POS_Y,
		spriteID: 'ok',
	},
	open: {
		command: { commandID: 'open' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y + 0.02,
		scaling: 0.9,
		spriteID: 'open',
	},
	reset: {
		interactive: true,
		offsetX: 0.33,
		offsetY: 0.68,
		scaling: 0.95,
		spriteID: 'reset',
	},
	player: {
		depth: 3,
		scaling: 0.13,
		offsetX: 0.03,
		offsetY: 0.05,
		spriteID: 'ossie',
	},
	questionmark: {
		scaling: 1.1,
		spriteID: 'questionmark',
	},
	step: {
		command: { commandID: 'step' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.12,
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
		offsetX: STEP_COUNT_DISPLAY_X + (STEP_COUNT_SPACING * 2) + 0.005,
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
		command: { commandID: 'turnDegrees' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.19,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'turndegrees',
	},
	turnleft: {
		command: { commandID: 'turnL' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.19,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'turnleft',
	},
	turnright: {
		command: { commandID: 'turnR' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.32,
		offsetY: COMMAND_AREA_Y,
		spriteID: 'turnright',
	},
}
