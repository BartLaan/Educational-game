import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { preloadLevel } from '~/utils/level_setup'

export default class Level12 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super('level12')
	}

	levelName = 'level12'

	objects = COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixles',
	])
	modals = COMMON_MODALS

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() {
		preloadLevel(this)
	}

	create() {
		const goalPath = ['171,77', '188,118', '171,158', '130,175', '90,157', '73,117', '90,76', '130,60']
		const levelConfig: LevelConfigPixle = {
			animate: false,
			goalPath,
			initPosition: {
				orientation: 90,
				nodeLocation: '130,60',
			},
			maxCommands: 5,
			levelName: this.levelName,
			objects: this.objects,
			pixleSize: 0.2514,
			spaceType: Space.pixles,
			timing: 50,
		}

		window.ossieGame = new OssieGame(levelConfig, this)
	}
}
