import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { initializeLevel, preloadLevel } from '~/utils/level_setup'

export default class Level12 extends Phaser.Scene {
	constructor(){
		super('level12')
	}

	levelName = 'level12'

	objects = COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixles',
	])
	modals = COMMON_MODALS

	initialize() { initializeLevel.bind(this)() }

	preload() {
		preloadLevel(this)
	}

	create() {
		const goalPath = ['0,200', '100,200', '20,20', '0,20', '0,200']
		const levelConfig: LevelConfigPixle = {
			goalPath,
			initPosition: {
				orientation: 90,
				nodeLocation: '0,160',
			},
			maxCommands: 5,
			levelName: this.levelName,
			objects: this.objects,
			pixleSize: 0.002514,
			spaceType: Space.pixles,
			timing: 80,
		}

		window.ossieGame = new OssieGame(levelConfig, this)
	}
}
