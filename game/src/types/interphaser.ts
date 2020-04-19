import { CommandID, Conditional } from './stack'

export enum InterPhaserEvent {
	add = 'add',
	delete = 'delete',
	reset = 'reset',
	start = 'start',
}

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Container

export type Command = {
	autoStop?: boolean,
	commandID: CommandID,
	counts?: number | null,
	condition?: Conditional,
	pixles?: number | null,
	degrees?: number | null,
}
export type ObjectConfig = {
	command?: Command,
	depth?: number,
	draggable?: boolean,
	interactive?: boolean,
	numOffsetX?: number
	numOffsetY?: number
	numScale?: number
	offsetX?: number,
	offsetY?: number,
	scaling?: number,
	spriteID: string,
}

export enum ObjectKey {
	againButton = 'againButton',
	backButton = 'backButton',
	bracketBottom = 'bracketBottom',
	bracketSide = 'bracketSide',
	bracketTop = 'bracketTop',
	close = 'close',
	else = 'else',
	execute = 'execute',
	for = 'for',
	for_till = 'for_till',
	for_x = 'for_x',
	if_padlinks = 'if_padlinks',
	if_padrechts = 'if_padrechts',
	if_padvooruit = 'if_padvooruit',
	nextButton = 'nextButton',
	okButton = 'okButton',
	open = 'open',
	player = 'player',
	questionmark = 'questionmark',
	reset = 'reset',
	step = 'step',
	stepcount = 'stepcount',
	stepcount_slash = 'stepcount_slash',
	stepcount_total = 'stepcount_total',
	steppixles = 'steppixles',
	turndegrees = 'turndegrees',
	turnleft = 'turnleft',
	turnright = 'turnright',
}
