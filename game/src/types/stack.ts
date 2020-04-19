export enum StackEvent {
	executeCommand = 'executeCommand',
	forgotOpen = 'forgotOpen',
	fail = 'fail',
	openEnd = 'openEnd',
	ossieposChange = 'ossieposChange',
	start = 'start',
	walkintowall = 'walkintowall',
	win = 'win',
}
export enum Conditional {
	forwardfree = 'forwardfree',
	leftfree = 'leftfree',
	onGoal = 'onGoal',
	rightfree = 'rightfree',
}

export type CommandID =
	| 'blockend'
	| 'close'
	| 'else'
	| 'for'
	| 'if'
	| 'open'
	| 'step'
	| 'stepPixles'
	| 'turnDegrees'
	| 'turnL'
	| 'turnR'

type StackItemTemplate = {
	objectRef: string,
	stackIndex: number,
}
export type StackItemNest = StackItemTemplate & {
	do: StackItem[],
}
export type StackItemBasic = StackItemTemplate & {
	commandID: 'close' | 'open' | 'step' | 'turnL' | 'turnR',
}
export type StackItemFor = StackItemNest & {
	autoStop?: boolean,
	commandID: 'for',
	counts: number,
	counter?: number,
}
export type StackItemIf = StackItemNest & {
	condition: Conditional,
	commandID: 'if',
}
export type StackItemElse = StackItemNest & {
	commandID: 'else',
	blockRef: number, // stackIndex of related If
}
export type StackItemTurnDegrees = StackItemTemplate & {
	commandID: 'turnDegrees',
	degrees: number,
}
export type StackItemStepPixles = StackItemTemplate & {
	commandID: 'stepPixles',
	pixles: number,
}
export type StackItem =
	StackItemBasic | StackItemFor | StackItemIf | StackItemElse | StackItemTurnDegrees | StackItemStepPixles
export type Stack = StackItem[]
