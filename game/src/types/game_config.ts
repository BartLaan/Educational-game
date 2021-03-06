import { OssiePos, Nodes } from './board'

export enum Orientation {
	cardinal = 'cardinal',
	degrees = 'degrees',
}
export enum Space {
	grid = 'grid',
	pixles = 'pixles',
}

type LevelConfigProto = {
	animate?: boolean,
	hideMaxCommands?: boolean
	initPosition: OssiePos,
	levelName: string,
	maxCommands: number,
	objects: string[],
	shouldFail?: boolean,
	timing?: number,
}

export type LevelConfigPixle = LevelConfigProto & {
	goalPath?: string[],
	pixleSize: number,
	spaceType: Space.pixles,
}
export type LevelConfigGrid = LevelConfigProto & {
	goalPosition: string,
	nodes: Nodes,
	spaceType: Space.grid,
}

export type LevelConfig = LevelConfigGrid | LevelConfigPixle
