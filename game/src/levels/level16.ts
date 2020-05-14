import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { preloadLevel } from '~/utils/level_setup'

const LEVELNAME = 'level16'
export default class Level16 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super(LEVELNAME)
	}

	levelName = LEVELNAME

	objects = COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'skippixles',
		'steppixles',
		'steppixles_back',
	])
	modals = COMMON_MODALS

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() {
		preloadLevel(this)
	}

	create() {
		const levelConfig: LevelConfigPixle = {
			animate: false,
			goalPath: [],
			initPosition: {
				orientation: 90,
				nodeLocation: '220,200',
			},
			maxCommands: 21,
			levelName: this.levelName,
			objects: this.objects,
			pixleSize: 0.135,
			spaceType: Space.pixles,
			timing: 5,
		}
		window.ossieGame = new OssieGame(levelConfig, this)
	}
}
