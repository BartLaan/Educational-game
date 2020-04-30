import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { preloadLevel } from '~/utils/level_setup'

const LEVELNAME = 'level15'
export default class Level15 extends Phaser.Scene implements PhaserLevel {
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
		const levelConfig: LevelConfigPixle = {
			animate: false,
			goalPath,
			initPosition: {
				orientation: 90,
				nodeLocation: '220,200',
			},
			maxCommands: 7,
			levelName: this.levelName,
			objects: this.objects,
			pixleSize: 0.135,
			spaceType: Space.pixles,
			timing: 5,
		}
		window.ossieGame = new OssieGame(levelConfig, this)
	}
}

const goalPath = [
	'278,256',
	'222,315',
	'163,259',
	'219,200',
	'242,277',
	'164,300',
	'141,223',
	'219,200',
	'201,278',
	'122,259',
	'141,180',
	'219,199',
	'164,258',
	'105,202',
	'161,143',
	'220,199',
	'143,222',
	'120,144',
	'197,121',
	'220,199',
	'142,181',
	'161,102',
	'240,121',
	'221,199',
	'162,144',
	'218,85',
	'277,141',
	'221,200',
	'198,123',
	'276,100',
	'299,177',
	'221,200',
	'239,122',
	'318,141',
	'299,220',
	'221,201',
	'276,142',
	'335,198',
	'279,257',
	'220,201',
	'297,178',
	'320,256',
	'243,279',
	'220,201',
	'298,219',
	'279,298',
	'200,279',
	'219,201',
	'220,200',
]
