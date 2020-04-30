import { CommandID, Conditional } from './stack'

export enum InterPhaserEvent {
	add = 'add',
	delete = 'delete',
	reset = 'reset',
	start = 'start',
}

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

export type Pointer = Phaser.Input.Pointer

type GameObjectExtras = {
	name: ObjectKey,
}
export type Sprite = Phaser.GameObjects.Sprite & GameObjectExtras
export type Container = Phaser.GameObjects.Container & GameObjectExtras
export type PhaserImage = Phaser.GameObjects.Image & GameObjectExtras
export type GameObject = Sprite | Container | PhaserImage

type GameObjectMap<T> = { [k: string]: T }
export type GameObjects = {
	againButton: Sprite,
	background: PhaserImage,
	backButton: Sprite,
	bracketBottom: Sprite,
	bracketSide: Sprite,
	bracketTop: Sprite,
	close: GameObjectMap<Sprite>,
	else: GameObjectMap<Sprite>,
	execute: Sprite,
	for: GameObjectMap<Sprite>,
	for_till: GameObjectMap<Sprite>,
	for_x: GameObjectMap<Container>,
	if_padlinks: GameObjectMap<Sprite>,
	if_padrechts: GameObjectMap<Sprite>
	if_padvooruit: GameObjectMap<Sprite>,
	nextButton: Sprite,
	okButton: Sprite,
	open: GameObjectMap<Sprite>,
	path: Phaser.GameObjects.Polygon[],
	player: Sprite,
	questionmark: Sprite,
	reset: Sprite,
	step: GameObjectMap<Sprite>,
	stepcount: Sprite,
	stepcount_slash: Sprite,
	stepcount_total: Sprite,
	steppixles: GameObjectMap<Container>,
	steppixles_back: GameObjectMap<Container>,
	turndegrees: GameObjectMap<Container>,
	turnleft: GameObjectMap<Sprite>,
	turnright: GameObjectMap<Sprite>,
}
export type InterPhaserObjects =
	{ [key in InitObject]: GameObjects[key] }
	& { [key in ObjectKey]?: GameObjects[key] }

export type ObjectKey =
	| 'againButton'
	| 'background'
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
	| 'steppixles_back'
	| 'turndegrees'
	| 'turnleft'
	| 'turnright'

export type DuplicableObject =
	| 'close'
	| 'else'
	| 'for'
	| 'for_till'
	| 'for_x'
	| 'if_padlinks'
	| 'if_padrechts'
	| 'if_padvooruit'
	| 'open'
	| 'step'
	| 'steppixles'
	| 'steppixles_back'
	| 'turndegrees'
	| 'turnleft'
	| 'turnright'

export type InitObject =
	| 'backButton'
	| 'close'
	| 'else'
	| 'execute'
	| 'for'
	| 'for_till'
	| 'for_x'
	| 'if_padlinks'
	| 'if_padrechts'
	| 'if_padvooruit'
	| 'open'
	| 'player'
	| 'reset'
	| 'questionmark'
	| 'step'
	| 'steppixles'
	| 'steppixles_back'
	| 'stepcount'
	| 'stepcount_slash'
	| 'turndegrees'
	| 'turnleft'
	| 'turnright'
