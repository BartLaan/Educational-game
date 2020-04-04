import { modalConfig } from '~/constants/modals'
import { Orientation } from '~/types/game_config'
import { Board, BoardNode, Coords, Nodes } from '~/types/board'
import { GIF_PATHS, SPRITESHEET_PATHS, SPRITE_PATHS } from '~/constants/paths'
import { SSKey } from '~/types/spritesheets'
import { COMMON_SPRITES } from '~/constants/objects'
import { OBJECT_CONFIG } from '~/constants/sizes'
import { isBracketObject } from './phaser_objects'

// WIDTH/COLUMNS FIRST, START AT 0,0
export function coordToStr(x: number, y: number): string {
	return x.toString() + ',' + y.toString()
}

export function strToCoord(coordStr: string): Coords {
	let coords = coordStr.split(',')
	return {
		x: parseFloat(coords[0]),
		y: parseFloat(coords[1]),
	}
}

enum OrientationCode {
	n = 'n',
	ne = 'ne',
	e = 'e',
	se = 'se',
	s = 's',
	sw = 'sw',
	w = 'w',
	nw = 'nw',
}
export function cardinalName(orientationCode: OrientationCode, orientationType: Orientation) {
	let useDegrees = orientationType === Orientation.degrees
	switch (orientationCode) {
		case OrientationCode.n:
			return useDegrees ? 0 : 0
		case OrientationCode.ne:
			return 45
		case OrientationCode.e:
			return useDegrees ? 90 : 90
		case OrientationCode.se:
			return 135
		case OrientationCode.s:
			return useDegrees ? 180 : 180
		case OrientationCode.sw:
			return 225
		case OrientationCode.w:
			return useDegrees ? 270 : 270
		case OrientationCode.nw:
			return 315
	}
}

// The game uses this function to get from a human readable/customizable board
// representation to a usable internal representation
export function boardToNodes(board: Board): [Nodes, string] {
	let nodes = {}
	let goal = ''

	for (let yStr in board) {
		let y = parseInt(yStr, 10)
		for (let xStr in board[y]) {
			let x = parseInt(xStr, 10)
			if (board[y][x] == 0) {
				continue
			}
			let nodeName = coordToStr(x, y)
			let node = {} as BoardNode
			let xMin = x > 0
			let yMin = y > 0
			let xPlus = x + 1 < board[y].length
			let yPlus = y + 1 < board.length

			if (board[y][x] == 2) {
				node.goal = true
				goal = nodeName
			}
			if (yMin && board[y - 1][x] != 0) {
				node[0] = coordToStr(x, y - 1)
			}
			if (xPlus && board[y][x + 1] != 0) {
				node[90] = coordToStr(x + 1, y)
			}
			if (yPlus && board[y + 1][x] != 0) {
				node[180] = coordToStr(x, y + 1)
			}
			if (xMin && board[y][x - 1] != 0) {
				node[270] = coordToStr(x - 1, y)
			}

			if (xPlus && yMin && board[y - 1][x + 1] != 0) {
				node[45] = coordToStr(x + 1, y - 1)
			}
			if (xPlus && yPlus && board[y + 1][x + 1] != 0) {
				node[135] = coordToStr(x + 1, y + 1)
			}
			if (xMin && yPlus && board[y + 1][x - 1] != 0) {
				node[225] = coordToStr(x - 1, y + 1)
			}
			if (xMin && yMin && board[y - 1][x - 1] != 0) {
				node[315] = coordToStr(x - 1, y - 1)
			}

			nodes[nodeName] = node
		}
	}
	return [nodes, goal]
}

// Expands the board when needed
export function resizeBoard(board: Board, minSize: Coords) {

	let size = {
		x: board[0].length - 1,
		y: board.length - 1
	}

	while (minSize[1] > size.y) {
		board.push([])
		size.y = size.y + 1
		while (board[size.y].length < size.x) {
			board[size.y].push(0)
		}
	}
	while (minSize[0] > size[0]) {
		size.x = size.x + 1
		for (let row in board) {
			board[row].push(0)
		}
	}

	return board
}

// Reverse of boardToNodes
// I think this is not used anymore but it can be handy for debugging.
export function nodesToBoard(nodes: string[]): Board {
	let board = [[0]] as Board
	for (let node of nodes) {
		let tile = strToCoord(node)
		// Resize board if necessary
		board = resizeBoard(board, tile)
		board[tile[1]][tile[0]] = 1
	}
	return board
}

// Preloads sprites for a phaser scene
export function loadSprites(phaser) {
	let spriteArray = [] as string[]
	spriteArray = spriteArray.concat(COMMON_SPRITES)

	let levelID = phaser.levelName.replace('level', '')
	spriteArray.push('background' + levelID.replace(/a|b|c/g, ''))

	for (let objName of phaser.objects) {
		let objConfig = OBJECT_CONFIG[objName]
		if (
			objConfig !== undefined
			&& objConfig.spriteID !== undefined
			&& spriteArray.indexOf(objConfig.spriteID) === -1
		) {

			spriteArray.push(objConfig.spriteID)
			if (objConfig.interactive === true || objConfig.draggable === true) {
				spriteArray.push(objConfig.spriteID + "-hover")
			}
			if (
				objConfig.command !== undefined && objConfig.command.commandID !== undefined
				&& !isBracketObject(objConfig.command.commandID)
			) {
				spriteArray.push(objConfig.spriteID + "-crnt")
				spriteArray.push(objConfig.spriteID + "-crnt-hover")
			}

			// Brackets
			if (
				objConfig.command && isBracketObject(objConfig.command.commandID)
				&& spriteArray.indexOf('bracket-bottom') === -1
			) {
				spriteArray = spriteArray.concat('bracket-bottom', 'bracket-middle', 'bracket-top')
			}

		} else if (SPRITE_PATHS[objName] !== undefined && spriteArray.indexOf(objName) === -1) {
			spriteArray.push(objName)
		}
	}

	let missingSprites = [] as string[ ]
	for (let spriteID of spriteArray) {
		let spriteLocation = SPRITE_PATHS[spriteID]
		if (spriteLocation !== undefined) {
			phaser.load.image(spriteID, spriteLocation)
		} else if (spriteID.indexOf('hover') === -1) {
			missingSprites.push(spriteID)
		}
	}
	if (missingSprites.length) {
		console.log('Could not find sprites with the following IDs:\n ', missingSprites.join('\n  '))
	}
}

// These are here so we have to write as little boilerplate code for the level files
// as possible
export function preloadLevel(phaser) {
	console.log('loading', phaser.levelName)
	loadSprites(phaser)
	loadModals(phaser)
}
export function loadSpritesheet(phaser, ssKey: SSKey) {
	console.log(ssKey + "_ss")
	phaser.load.spritesheet(
		ssKey + '_ss',
		SPRITESHEET_PATHS[ssKey],
		{ frameHeight: 768, frameWidth: 1024 }
	)
}
export function loadModals(phaser) {
	let instructionModalKey = phaser.levelName.replace('level', 'instruction')
	phaser.modals.push(instructionModalKey)

	for (let modalKey of phaser.modals) {
		if (modalConfig[modalKey].mode === 'html') {
			loadHTMLModal(modalKey)
		} else {
			loadSpritesheet(phaser, modalKey)
		}
	}
}
// Preload modal gifs to work around loading times
export function loadHTMLModal(modalKey: string) {
	let modalContainer = document.getElementById('modalContainer')
	let modalElId = modalKey + '_modal'
	if (document.getElementById(modalElId) !== null || modalContainer === null) return

	let modalEl = document.createElement('div')
	modalEl.id = modalElId
	modalEl.className = 'modal'

	let modalBg = document.createElement('img')
	modalBg.src = GIF_PATHS[modalKey]
	modalBg.className = 'fullscreenGif'
	modalEl.appendChild(modalBg)
	for (let buttonName of modalConfig[modalKey].buttons) {
		let buttonEl = document.createElement('div')
		buttonEl.className = 'modalButton ' + buttonName
		modalEl.appendChild(buttonEl)
	}

	modalContainer.appendChild(modalEl)
}
export function initializeLevel() {
	console.log('Initializing level "' + this.levelName + '"')
	Phaser.Scene.call(this, { key: this.levelName })
}
