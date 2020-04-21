import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { Board } from '~/types/board'
import { LevelConfigGrid, Space } from '~/types/game_config'
import { boardToNodes, preloadLevel } from '~/utils/level_setup'

export default class Level8 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super('level8')
	}

	levelName = 'level8'

	objects = COMMON_OBJECTS.concat([
		'questionmark',
		'step',
		'if_padlinks',
		'if_padrechts',
		'for_till',
		'for_x',
		'turndegrees',
	])
	modals = COMMON_MODALS

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() { preloadLevel(this) }

	create() {
		const gameboard = [
			[0,0,0,0,0,0,0,0,0],
			[1,1,1,1,1,1,1,1,1],
			[0,0,1,0,0,0,0,0,1],
			[0,0,1,0,0,0,1,0,1],
			[0,0,1,1,1,1,1,0,1],
			[0,0,0,0,0,0,0,0,1],
			[2,1,1,1,1,1,1,1,1],
		] as Board
		const [nodes, goalPosition] = boardToNodes(gameboard)
		const levelConfig: LevelConfigGrid = {
			goalPosition: goalPosition,
			initPosition: {
				orientation: 90,
				nodeLocation: '6,3',
			},
			maxCommands: 6,
			levelName: this.levelName,
			nodes,
			objects: this.objects,
			spaceType: Space.grid,
		}

		window.ossieGame = new OssieGame(levelConfig, this)
	}
}
