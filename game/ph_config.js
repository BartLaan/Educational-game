// SIZES
BOARD_STEPSIZE_RELATIVE_TO_HEIGHT = 0.101
BOARD_OFFSET_X = 0.3
BOARD_OFFSET_Y = 0.035
CONFIRM_POS_X = 0.28
CONFIRM_POS_Y = 0.52
CONFIRM_WIDTH = 0.13
CONFIRM_HEIGHT = 0.08
COMMAND_AREA_X = 0.39
COMMAND_AREA_Y = 0.76
FAILBUTTON_X = 0.4
FAILBUTTON_Y = 0.6
LEVEL_NEXT_X = 0.74
LEVEL_AGAIN_X = 0.25
STACK_BRACKET_SPACING = 0.03
STACK_COMMAND_SPACING = 0.04
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
	als_padvooruit: {
		command: { commandID: 'if', condition: 'CONDITIONAL_FORWARDFREE' },
		draggable: true,
		spriteID: 'als-padvooruit',
	},
	als_padlinks: {
		command: { commandID: 'if', condition: 'CONDITIONAL_LEFTFREE' },
		draggable: true,
		spriteID: 'als-padlinks',
	},
	als_padrechts: {
		command: { commandID: 'if', condition: 'CONDITIONAL_RIGHTFREE' },
		draggable: true,
		spriteID: 'als-padrechts',
	},
	anders: {
		command: { commandID: 'if' },
		draggable: true,
		spriteID: 'anders',
	},
	bracketBottom: {
		command: { commandID: 'blockend' },
		depth: 1,
		scaling: 1,
		spriteID: 'bracket-bottom',
	},
	bracketSide: {
		depth: 1,
		scaling: 1,
		spriteID: 'bracket-middle',
	},
	bracketTop: {
		depth: 1,
		scaling: 1,
		spriteID: 'bracket-top',
	},
	draailinks: {
		command: { commandID: 'turnL' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.19,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'draailinks',
	},
	draairechts: {
		command: { commandID: 'turnR' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.32,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'draairechts',
	},
	herhaal: {
		command: { commandID: "for"},
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'herhaal-x',
	},
	herhaalx: {
		command: { commandID: "for", counts: null },
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'herhaal-x',
	},
	okButton: {
		depth: 4,
		interactive: true,
		offsetX: FAILBUTTON_X,
		offsetY: FAILBUTTON_Y,
		scaling: 1,
		spriteID: 'uitvoeren',
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
	opnieuw: {
		interactive: true,
		offsetX: 0.33,
		offsetY: 0.68,
		scaling: 0.95,
		spriteID: 'opnieuw',
	},
	player: {
		depth: 3,
		scaling: 0.13,
		offsetX: 0.03,
		offsetY: 0.05,
		spriteID: 'ossie',
	},
	sluit: {
		command: { commandID: 'close' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y + 0.085,
		scaling: 0.9,
		spriteID: 'sluit',
	},
	stap: {
		command: { commandID: 'step' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.13,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'stap',
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
	uitvoeren: {
		interactive: true,
		offsetX: 0.135,
		offsetY: 0.89,
		scaling: 1,
		spriteID: 'uitvoeren',
	},
	vraagteken: {
		scaling: 1.1,
		spriteID: 'vraagteken',
	},
}
console.log('successfully loaded ph_config.js');
