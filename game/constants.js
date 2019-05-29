// Numbers
BOARD_STEPSIZE_RELATIVE_TO_HEIGHT = 0.101
BOARD_OFFSET_X = 0.3
BOARD_OFFSET_Y = 0.035
COMMAND_AREA_X = 0.39
COMMAND_AREA_Y = 0.76
SCALING_FACTOR_DIV = 1024
STACK_BRACKET_SPACING = 0.03
STACK_COMMAND_SPACING = 0.04
STACK_ZONE_POS_X = 0.035
STACK_ZONE_POS_Y = 0.042
STACK_ZONE_WIDTH = 0.25
STACK_ZONE_HEIGHT = 0.83
STEP_COUNT_DISPLAY_X = 0.02
STEP_COUNT_DISPLAY_Y = 0.934
STEP_COUNT_SPACING = 0.023;
VICTORY_TIMEOUT = 1200 // ms
WH_RATIO = 1.3333333333

// EVENTS
CONDITIONAL_FORWARDFREE = 'CONDITIONAL_FORWARDFREE'
CONDITIONAL_LEFTFREE = 'CONDITIONAL_LEFTFREE'
CONDITIONAL_RIGHTFREE = 'CONDITIONAL_RIGHTFREE'

PHASER_STACK_ADD = 'PHASER_STACK_ADD'
PHASER_STACK_DELETE = 'PHASER_STACK_DELETE'
PHASER_STACK_RESET = 'PHASER_STACK_RESET'
PHASER_STACK_START = 'PHASER_STACK_START'

STACK_EXECUTE_COMMAND = 'STACK_EXECUTE_COMMAND'
STACK_FORGOTOPEN = 'STACK_FORGOTOPEN'
STACK_FAIL = 'STACK_FAIL'
STACK_OPEN_END = 'STACK_OPEN_END'
STACK_OSSIEPOS_CHANGE = 'STACK_OSSIEPOS_CHANGE'
STACK_START = 'STACK_START'
STACK_WALKINTOWALL = 'STACK_WALKINTOWALL'
STACK_WIN = 'STACK_WIN'

// PSEUDOTYPES
TYPE_ORIENTATION_CARDINALS = 'TYPE_ORIENTATION_CARDINALS'
TYPE_SPACE_GRID = 'TYPE_SPACE_GRID'

// SPRITES
SPRITE_PATHS = {
	// common
	'0': 'assets/integers/0.png',
	'1': 'assets/integers/1.png',
	'2': 'assets/integers/2.png',
	'3': 'assets/integers/3.png',
	'4': 'assets/integers/4.png',
	'5': 'assets/integers/5.png',
	'6': 'assets/integers/6.png',
	'7': 'assets/integers/7.png',
	'8': 'assets/integers/8.png',
	'9': 'assets/integers/9.png',
	'fail': 'assets/popups/oeps.png',
	'open': 'assets/commands/open.png',
	'open-hover': 'assets/commands/open-hover.png',
	'opnieuw': 'assets/buttons/opnieuw.png',
	'opnieuw-hover': 'assets/buttons/opnieuw-hover.png',
	'ossie': 'assets/ossie.png',
	'slash': 'assets/slash.png',
	'sluit': 'assets/commands/sluit.png',
	'sluit-hover': 'assets/commands/sluit-hover.png',
	'stap': 'assets/commands/stap.png',
	'stap-crnt': 'assets/commands/stap-crnt.png',
	'stap-crnt-hover': 'assets/commands/stap-crnt-hover.png',
	'stap-hover': 'assets/commands/stap-hover.png',
	'uitvoeren': 'assets/buttons/uitvoeren.png',
	'uitvoeren-hover': 'assets/buttons/uitvoeren-hover.png',
	'victory': 'assets/popups/goed-gedaan.png',

	// level specific
	'als-padvooruit': 'assets/commands/als-pad-vooruit.png',
	'als_padlinks': 'assets/commands/als-pad-links.png',
	'als_padrechts': 'assets/commands/als-pad-rechts.png',
	'anders': 'assets/commands/anders.png',
	'background1': 'assets/backgrounds/1.jpg',
	'background2': 'assets/backgrounds/2.jpg',
	'background3': 'assets/backgrounds/3.jpg',
	'background4': 'assets/backgrounds/4.jpg',
	'background5': 'assets/backgrounds/5.jpg',
	'background6': 'assets/backgrounds/6.jpg',
	'background7': 'assets/backgrounds/7.jpg',
	'background8': 'assets/backgrounds/8.jpg',
	'background9': 'assets/backgrounds/9.jpg',
	'background10': 'assets/backgrounds/10.jpg',
	'background11': 'assets/backgrounds/11.jpg',
	'background12': 'assets/backgrounds/12.jpg',
	'background13': 'assets/backgrounds/13.jpg',
	'background14': 'assets/backgrounds/14.jpg',
	'background15': 'assets/backgrounds/15.jpg',
	'background16': 'assets/backgrounds/16.jpg',
	'bracket-bottom': 'assets/bracket-parts/nest-bottom.png',
	'bracket-middle': 'assets/bracket-parts/nest-basis.png',
	'bracket-top': 'assets/bracket-parts/nest-top.png',
	'bracket1': 'assets/brackets-complete/nest-1.png',
	'bracket2': 'assets/brackets-complete/nest-2.png',
	'bracket3': 'assets/brackets-complete/nest-3.png',
	'bracket4': 'assets/brackets-complete/nest-4.png',
	'bracket5': 'assets/brackets-complete/nest-5.png',
	'bracket6': 'assets/brackets-complete/nest-6.png',
	'draailinks': 'assets/commands/draai-links.png',
	'draailinks-crnt': 'assets/commands/draai-links-crnt.png',
	'draailinks-crnt-hover': 'assets/commands/draai-links-crnt-hover.png',
	'draailinks-hover': 'assets/commands/draai-links-hover.png',
	'draai-graden': 'assets/commands/draai-graden.png',
	'draai-graden-crnt': 'assets/commands/draai-graden-crnt.png',
	'draai-graden-crnt-hover': 'assets/commands/draai-graden-crnt.png',
	'draai-graden-hover': 'assets/commands/draai-graden-hover.png',
	'draairechts': 'assets/commands/draai-rechts.png',
	'draairechts-crnt': 'assets/commands/draai-rechts-crnt.png',
	'draairechts-crnt-hover': 'assets/commands/draai-rechts-crnt-hover.png',
	'draairechts-hover': 'assets/commands/draai-rechts-hover.png',
	'herhaal': 'assets/coinmmands/herhaal.png',
	'herhaal-hover': 'assets/commands/herhaal-hover.png',
	'herhaal-till': 'assets/commands/herhaal-tot.png',
	'herhaal-till-hover': 'assets/commands/herhaal-tot-hover.png',
	'herhaal-x': 'assets/commands/herhaal-x.png',
	'herhaal-x-hover': 'assets/commands/herhaal-x-hover.png',
	'vraagteken': 'assets/vraagteken.png',
}
COMMON_SPRITES = [
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
	'fail',
	'open',
	'open-hover',
	'opnieuw',
	'opnieuw-hover',
	'ossie',
	'slash',
	'sluit',
	'sluit-hover',
	'stap',
	'stap-crnt',
	'stap-crnt-hover',
	'stap-hover',
	'uitvoeren',
	'uitvoeren-hover',
	'victory',
];

// Only static objects
OBJECT_CONF = {
	als_padvooruit: {
		data: { command: 'if', condition: 'CONDITIONAL_FORWARDFREE' },
		draggable: true,
		spriteID: 'als-padvooruit',
	},
	als_padlinks: {
		data: { command: 'if', condition: 'CONDITIONAL_LEFTFREE' },
		draggable: true,
		spriteID: 'als-padlinks',
	},
	als_padrechts: {
		data: { command: 'if', condition: 'CONDITIONAL_RIGHTFREE' },
		draggable: true,
		spriteID: 'als-padrechts',
	},
	anders: {
		data: { command: 'if' },
		draggable: true,
		spriteID: 'anders',
	},
	bracketBottom: {
		data: { command: 'blockend' },
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
		data: { command: 'turnL' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.19,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'draailinks',
	},
	draairechts: {
		data: { command: 'turnR' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 0.32,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'draairechts',
	},
	failButton: {
		depth: 4,
		interactive: true,
		offsetX: FAILBUTTON_X,
		offsetY: FAILBUTTON_Y,
		scaling:  ,
		spriteID: ,
	}
	herhaal: {
		data: { command: "for"},
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'herhaal-x',
	},
	herhaalx: {
		data: { command: "for", counts: null },
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y,
		scaling: 1,
		spriteID: 'herhaal-x',
	},
	open: {
		data: { command: 'open' },
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
		data: { command: 'close' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X,
		offsetY: COMMAND_AREA_Y + 0.085,
		scaling: 0.9,
		spriteID: 'sluit',
	},
	stap: {
		data: { command: 'step' },
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
		scaling: 1.1,
		spriteID: '0',
	},
	stepcount_slash: {
		offsetX: STEP_COUNT_DISPLAY_X + STEP_COUNT_SPACING,
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 1.1,
		spriteID: 'slash',
	},
	stepcount_total_pt1: {
		offsetX: STEP_COUNT_DISPLAY_X + (STEP_COUNT_SPACING * 2),
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 1.1,
	},
	stepcount_total_pt2: {
		offsetX: STEP_COUNT_DISPLAY_X + (STEP_COUNT_SPACING * 3),
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 1.1,
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
},
BRACKET_OBJECTS = [ 'if', 'else', 'for' ];
COMMON_OBJECTS = [
	'levelcount_slash',
	'levelcount_total_pt1',
	'levelcount_total_pt2',
	'oeps',
	'open',
	'opnieuw',
	'player',
	'stepcount',
	'stepcount_slash',
	'sluit',
	'stap',
	'uitvoeren',
	'victory',
];
INIT_OBJECTS = [
	'draailinks',
	'draairechts',
	'herhaal',
	'herhaalx',
	'open',
	'opnieuw',
	'player',
	'sluit',
	'stap',
	'stepcount',
	'stepcount_slash',
	'uitvoeren',
	'vraagteken',
];
OBJECTS_MULTIPLE = [
	'als-padlinks',
	'als-padrechts',
	'als-padvooruit',
	'anders',
	'draailinks',
	'draairechts',
	'draaigraden',
	'stap',
]
