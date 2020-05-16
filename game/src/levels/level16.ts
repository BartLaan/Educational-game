import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import EventModal from '~/modals/event'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { SSKey } from '~/types/spritesheets'
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

	modals = COMMON_MODALS.concat([
		SSKey.beforelvl16,
	])

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() {
		preloadLevel(this)
	}

	create() {
		const levelConfig: LevelConfigPixle = {
			animate: true,
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
			timing: 200,
		}
		const loadLevel = () => {
			const ossieGame = new OssieGame(levelConfig, this)
			window.ossieGame = ossieGame
			// there's no "limit", as this is the freestyle level.
			// well there is a limit of 21 but that's just so that the stack doesn't get too big
			ossieGame.interPhaser.objects.stepcount.setVisible(false)
			ossieGame.interPhaser.objects.stepcount_total.setVisible(false)
			ossieGame.interPhaser.objects.stepcount_slash.setVisible(false)
			ossieGame.interPhaser.fail = () => { /* no-op */ }
		}

		const timeout = true ? 5 : 5000
		const modal = new EventModal(this, SSKey.beforelvl16, timeout, loadLevel.bind(this))
		modal.render()
	}
}
