export type BoardContent = 0 | 1 | 2
export type Board = Array<Array<BoardContent>>
export type BoardNode = {
	goal?: boolean

}
export type Nodes = { [key: string]: BoardNode }

export type Coords = {
	x: number
	y: number
}

export type OssiePos = {
	orientation: number // degrees
	nodeLocation: string // node reference
}
