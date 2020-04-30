import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import EventModal from '~/modals/event'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { preloadLevel } from '~/utils/level_setup'
import { SSKey } from '~/types/spritesheets'

const LEVELNAME = 'level14'
export default class Level14 extends Phaser.Scene implements PhaserLevel {
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
		}
		window.ossieGame = new OssieGame(levelConfig, this)

		let counter = 0
		const afterFail = () => {
			if (counter < 2) {
				return counter += 1
			}
			const modal = new EventModal(this, SSKey.instruction14b, 2000)
			modal.render()
			counter = 0
		}
		window.ossieGame.interPhaser.afterFail = afterFail
	}
}

const goalPath = [
	'320,200',
	'320,300',
	'220,300',
	'220,200',
	'307,250',
	'257,337',
	'170,287',
	'220,200',
	'270,287',
	'183,337',
	'133,250',
	'220,200',
	'220,300',
	'120,300',
	'120,200',
	'220,200',
	'170,287',
	'83,237',
	'133,150',
	'220,200',
	'133,250',
	'83,163',
	'170,113',
	'220,200',
	'120,200',
	'120,100',
	'220,100',
	'220,200',
	'133,150',
	'183,63',
	'270,113',
	'220,200',
	'170,113',
	'257,63',
	'307,150',
	'220,200',
	'220,100',
	'320,100',
	'320,200',
	'220,200',
	'270,113',
	'357,163',
	'307,250',
	'220,200',
	'307,150',
	'357,237',
	'270,287',
	'220,200',
]
