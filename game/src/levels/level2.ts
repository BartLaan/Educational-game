import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { Board } from '~/types/board'
import { LevelConfigGrid, Space } from '~/types/game_config'
import { boardToNodes, preloadLevel } from '~/utils/level_setup'

class Level2 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super('level2')
	}

	levelName = 'level2'

	objects = COMMON_OBJECTS.concat([
		'questionmark',
		'step',
		'turnleft',
		'turnright',
	])
	modals = COMMON_MODALS

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() {
		preloadLevel(this)
	}

	create() {
		const gameboard = [
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,1,1],
			[0,0,0,0,0,1,2,1,0],
			[0,1,1,1,0,1,0,0,0],
			[0,1,0,1,1,1,0,0,0],
			[0,1,0,0,0,0,0,0,0],
			[1,1,0,0,0,0,0,0,0],
		] as Board
		const [nodes, goalPosition] = boardToNodes(gameboard)
		const levelConfig: LevelConfigGrid = {
			goalPosition: goalPosition,
			initPosition: {
				orientation: 90,
				nodeLocation: '0,6',
			},
			maxCommands: 20,
			levelName: this.levelName,
			nodes: nodes,
			objects: this.objects,
			spaceType: Space.grid,
		}

		window.ossieGame = new OssieGame(levelConfig, this)
	}
}

export default Level2
