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
	'278,257',
	'221,315',
	'163,258',
	'220,200',
	'242,278',
	'164,300',
	'142,222',
	'220,200',
	'200,278',
	'121,258',
	'142,180',
	'220,200',
	'163,258',
	'105,201',
	'162,143',
	'220,200',
	'142,222',
	'120,144',
	'198,122',
	'220,200',
	'142,180',
	'162,101',
	'240,122',
	'220,200',
	'162,143',
	'219,85',
	'277,142',
	'220,200',
	'198,122',
	'276,100',
	'298,178',
	'220,200',
	'240,122',
	'319,142',
	'298,220',
	'220,200',
	'277,142',
	'335,199',
	'278,257',
	'220,200',
	'298,178',
	'320,256',
	'242,278',
	'220,200',
	'298,220',
	'278,299',
	'200,278',
	'220,200',
]

// turn first, step second
/*
const goalPath = [
	'277,258',
	'219,315',
	'162,257',
	'220,200',
	'240,278',
	'162,299',
	'142,220',
	'220,200',
	'198,278',
	'120,256',
	'142,178',
	'220,200',
	'162,257',
	'105,199',
	'163,142',
	'220,200',
	'142,220',
	'121,142',
	'200,122',
	'220,200',
	'142,178',
	'164,100',
	'242,122',
	'220,200',
	'163,142',
	'221,85',
	'278,143',
	'220,200',
	'200,122',
	'278,101',
	'298,180',
	'220,200',
	'242,122',
	'320,144',
	'298,222',
	'220,200',
	'278,143',
	'335,201',
	'277,258',
	'220,200',
	'298,180',
	'319,258',
	'240,278',
	'220,200',
	'298,222',
	'276,300',
	'198,278',
	'220,200',
]
*/
