import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { Board } from '~/types/board'
import { LevelConfigGrid, Space } from '~/types/game_config'
import { boardToNodes, initializeLevel, preloadLevel } from '~/utils/level_setup'

class Level3a extends Phaser.Scene {
	constructor() {
		super('level3a')
	}

	levelName = 'level3a'

	objects = COMMON_OBJECTS.concat([
		'questionmark',
		'step',
		'turnleft',
		'turnright',
	])
	modals = COMMON_MODALS

	initialize() { initializeLevel.bind(this)() }

	preload() { preloadLevel(this) }

	create() {
		const gameboard = [
			[0,0,0,0,0,1,0,0,0],
			[0,0,0,0,1,1,0,0,0],
			[0,0,0,1,2,0,0,0,0],
			[0,0,1,1,0,0,0,0,0],
			[0,1,1,0,0,0,0,0,0],
			[1,1,0,0,0,0,0,0,0],
			[1,0,0,0,0,0,0,0,0],
		] as Board
		const [nodes, goalPosition] = boardToNodes(gameboard)
		const levelConfig: LevelConfigGrid = {
			goalPosition: goalPosition,
			initPosition: {
				orientation: 90,
				nodeLocation: '0,6',
			},
			maxCommands: 18,
			levelName: this.levelName,
			nodes: nodes,
			objects: this.objects,
			spaceType: Space.grid,
		}

		window.ossieGame = new OssieGame(levelConfig, this)
	}
}

export default Level3a
