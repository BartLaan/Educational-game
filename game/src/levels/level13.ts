import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { preloadLevel } from '~/utils/level_setup'

const LEVELNAME = 'level13'
export default class Level13 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super(LEVELNAME)
	}

	levelName = LEVELNAME

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
		const goalPath = ['170,77', '187,118', '170,158', '139,174', '96,164', '72,118', '89,77', '130,60']
		const levelConfig: LevelConfigPixle = {
			goalPath,
			initPosition: {
				orientation: 90,
				nodeLocation: '220,200',
			},
			maxCommands: 6,
			levelName: this.levelName,
			objects: this.objects,
			pixleSize: 0.135,
			spaceType: Space.pixles,
		}

		window.ossieGame = new OssieGame(levelConfig, this)
	}
}
