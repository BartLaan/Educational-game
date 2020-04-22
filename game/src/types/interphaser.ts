import { CommandID, Conditional } from './stack'

export enum InterPhaserEvent {
	add = 'add',
	delete = 'delete',
	reset = 'reset',
	start = 'start',
}

type GameObjectExtras = { name: ObjectKey }
export type Sprite = Phaser.GameObjects.Sprite & GameObjectExtras
export type Container = Phaser.GameObjects.Container & GameObjectExtras
export type GameObject = Sprite | Container

export type Pointer = Phaser.Input.Pointer

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

export type ObjectKey =
	| 'againButton'
	| 'backButton'
	| 'bracketBottom'
	| 'bracketSide'
	| 'bracketTop'
	| 'close'
	| 'else'
	| 'execute'
	| 'for'
	| 'for_till'
	| 'for_x'
	| 'if_padlinks'
	| 'if_padrechts'
	| 'if_padvooruit'
	| 'nextButton'
	| 'okButton'
	| 'open'
	| 'player'
	| 'questionmark'
	| 'reset'
	| 'step'
	| 'stepcount'
	| 'stepcount_slash'
	| 'stepcount_total'
	| 'steppixles'
	| 'turndegrees'
	| 'turnleft'
	| 'turnright'
