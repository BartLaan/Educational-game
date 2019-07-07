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

COMMON_SPRITES = [
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
	'fail',
	'nextlevel',
	'open',
	'open-hover',
	'opnieuw',
	'opnieuw-hover',
	'ossie',
	'playagain',
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
	'vraagteken',
];

BRACKET_OBJECTS = [ 'if', 'else', 'for' ];
COMMON_OBJECTS = [
	'levelcount_slash',
	'levelcount_total_pt1',
	'levelcount_total_pt2',
	'oeps',
	'open',
	'opnieuw',
	'player',
	'sluit',
	'stap',
	'stepcount',
	'stepcount_slash',
	'uitvoeren',
	'victory',
	'vraagteken',
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
];
LEVELS = [
	'level1',
	'level2',
	'level3a',
	'level3b',
	'level3c',
	'level4',
	'level5',
	'level6',
	'level7',
	'level8',
	'level9',
	'level10',
	'level12',
	'level13',
	'level14a',
	'level14b',
	'level15',
];

console.log('successfully loaded constants.js');
