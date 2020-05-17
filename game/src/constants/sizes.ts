import { Conditional } from '~/types/stack'
import { ObjectKey, ObjectConfig } from '~/types/interphaser'

// SIZES
export const BOARD_SIZE_REL_TO_PIXLE_X = 1638.505
export const BOARD_SIZE_REL_TO_PIXLE_Y = 1280.082
export const BOARD_STEPSIZE_X = 7.76
export const BOARD_STEPSIZE_Y = 10.44
export const BOARD_OFFSET_X = 33
export const BOARD_OFFSET_Y = -2.8
export const CONFIRM_POS_X = 40
export const CONFIRM_POS_Y = 74
export const COMMAND_AREA_X = 45
export const COMMAND_AREA_Y = 78
export const FAILBUTTON_X = 40
export const FAILBUTTON_Y = 60
export const HOVER_SCALING = 1.04
export const NUM_SPACING = 1.3
export const NUM_SCALING = 0.6
export const PIXLESIZE = 0.1953
export const STACK_AVG_CMD_SIZE = 4
export const STACK_BRACKET_INDENT = 2.7
export const STACK_BRACKET_OFFSET = 1
export const STACK_BRACKET_SPACING = 2
export const STACK_COMMAND_SPACING = 0.1
export const STACK_ZONE_POS_X = 10
export const STACK_ZONE_POS_Y = 4
export const STACK_ZONE_HEIGHT = 92
export const STACK_ZONE_WIDTH = 21
export const STEP_COUNT_DISPLAY_X = 3.9
export const STEP_COUNT_DISPLAY_Y = 95.8
export const STEP_COUNT_SPACING = 1.9
export const WINBUTTON_Y = 88

export const BASE_SIZE_X = 1024
export const BASE_SIZE_Y = 768
// etc
export const ANIMATION_FPS = 30
export const PATH_COLOR = 0x000000 // pink: 0xf40977
export const PATH_DRAW_PER_SECOND = 1.5
export const PATH_THICKNESS = 3
export const VELOCITY = 500 // phaser distance unit / sec
export const COMMAND_TIMING = 400 // ms
export const SCALING_FACTOR_DIV = 1024
export const TURN_SPEED = 360 // angle / sec
export const VICTORY_TIMEOUT = 1500 // ms
export const WH_RATIO = 1.3333333333

// Initial configuration for objects
type ObjectConfigs = {
	[key in ObjectKey]: ObjectConfig
}
export const OBJECT_CONFIG: ObjectConfigs = {
	againButton: {
		depth: 11,
		interactive: true,
		offsetX: 25,
		offsetY: WINBUTTON_Y,
		spriteID: 'playagain',
	},
	background: { // type hack
		spriteID: '',
	},
	backButton: {
		depth: 2,
		interactive: true,
		offsetX: 97,
		offsetY: 82.5,
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
		offsetY: COMMAND_AREA_Y + 7.7,
		scaling: 0.9,
		spriteID: 'close',
	},
	else: {
		command: { commandID: 'else' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 11.7,
		offsetY: COMMAND_AREA_Y + 9.6,
		spriteID: 'else',
	},
	execute: {
		interactive: true,
		offsetX: 21.3,
		offsetY: 93.7,
		spriteID: 'execute',
	},
	for: {
		command: { commandID: 'for', counts: 9999 },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 43,
		offsetY: COMMAND_AREA_Y,
		scaling: 0.9,
		spriteID: 'for',
	},
	for_till: {
		command: { commandID: 'for', autoStop: true },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 44,
		offsetY: COMMAND_AREA_Y + 8.2,
		scaling: 0.9,
		spriteID: 'for-till',
	},
	for_x: {
		command: { commandID: 'for', counts: null },
		depth: 2,
		draggable: true,
		numOffsetX: 2.8,
		numOffsetY: 2,
		offsetX: COMMAND_AREA_X + 44,
		offsetY: COMMAND_AREA_Y,
		scaling: 0.9,
		spriteID: 'for-x',
	},
	if_padlinks: {
		command: { commandID: 'if', condition: Conditional.leftfree },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 12.4,
		offsetY: COMMAND_AREA_Y + 4.8,
		scaling: 1,
		spriteID: 'if-padlinks',
	},
	if_padrechts: {
		command: { commandID: 'if', condition: Conditional.rightfree },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 23,
		offsetY: COMMAND_AREA_Y + 4.8,
		scaling: 1,
		spriteID: 'if-padrechts',
	},
	if_padvooruit: {
		command: { commandID: 'if', condition: Conditional.forwardfree },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 33.7,
		offsetY: COMMAND_AREA_Y + 4.8,
		scaling: 1,
		spriteID: 'if-padvooruit',
	},
	nextButton: {
		depth: 11,
		interactive: true,
		offsetX: 74,
		offsetY: WINBUTTON_Y,
		spriteID: 'nextlevel',
	},
	okButton: {
		depth: 11,
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
		offsetY: COMMAND_AREA_Y + 1.8,
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
		offsetX: 37.5,
		offsetY: 73.5,
		scaling: 0.9,
		spriteID: 'reset',
	},
	skippixles: {
		command: { commandID: 'skipPixles', pixles: null },
		depth: 2,
		draggable: true,
		numOffsetX: 4.5,
		numOffsetY: 0,
		numScale: 0.45,
		offsetX: COMMAND_AREA_X + 20.4,
		offsetY: COMMAND_AREA_Y + 10,
		spriteID: 'skip-pixles',
	},
	stop: {
		interactive: true,
		offsetX: 21.3,
		offsetY: 93.7,
		spriteID: 'stop',
	},
	step: {
		command: { commandID: 'step' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 10,
		offsetY: COMMAND_AREA_Y,
		scaling: 0.9,
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
		offsetX: STEP_COUNT_DISPLAY_X + (STEP_COUNT_SPACING * 2) -0.5,
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 0.9,
		spriteID: 'slash',
	},
	stepcount_total: {
		offsetX: STEP_COUNT_DISPLAY_X + (STEP_COUNT_SPACING * 3),
		offsetY: STEP_COUNT_DISPLAY_Y,
		scaling: 0.9,
		spriteID: '',
	},
	steppixles: {
		command: { commandID: 'stepPixles', pixles: null },
		depth: 2,
		draggable: true,
		numOffsetX: -1,
		numOffsetY: 0,
		numScale: 0.45,
		offsetX: COMMAND_AREA_X + 20.9,
		offsetY: COMMAND_AREA_Y + 5,
		spriteID: 'steppixles',
	},
	steppixles_back: {
		command: { commandID: 'stepPixlesBack', pixles: null },
		depth: 2,
		draggable: true,
		numOffsetX: -1.5,
		numOffsetY: 0,
		numScale: 0.45,
		offsetX: COMMAND_AREA_X + 35,
		offsetY: COMMAND_AREA_Y + 5,
		scaling: 0.95,
		spriteID: 'steppixles-back',
	},
	turndegrees: {
		command: { commandID: 'turnDegrees', degrees: null },
		depth: 2,
		draggable: true,
		numOffsetX: 4.5,
		numOffsetY: 0,
		offsetX: COMMAND_AREA_X + 20,
		offsetY: COMMAND_AREA_Y,
		scaling: 0.9,
		spriteID: 'turndegrees',
	},
	turnleft: {
		command: { commandID: 'turnL' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 19,
		offsetY: COMMAND_AREA_Y,
		scaling: 0.9,
		spriteID: 'turnleft',
	},
	turnright: {
		command: { commandID: 'turnR' },
		depth: 2,
		draggable: true,
		offsetX: COMMAND_AREA_X + 31.5,
		offsetY: COMMAND_AREA_Y,
		scaling: 0.9,
		spriteID: 'turnright',
	},
}
