import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import EventModal from '~/modals/event'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { PhaserImage } from '~/types/interphaser'
import { SSKey } from '~/types/spritesheets'
import { loadSpritesheet, preloadLevel } from '~/utils/level_setup'

export default class Level11 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super('level11')
	}

	levelName = 'level11'

	objects = COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixles',
	])
	modals = COMMON_MODALS.concat([
		SSKey.beforelvl11,
	])

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() {
		preloadLevel(this)
		loadSpritesheet(this, SSKey.background11)
	}

	create() {
		const loadLevel = () => {
			const goalPath = ['0,160', '100,160', '100,60', '0,60', '0,160']
			const levelConfig: LevelConfigPixle = {
				goalPath,
				initPosition: {
					orientation: 90,
					nodeLocation: '0,160',
				},
				maxCommands: 5,
				levelName: this.levelName,
				objects: this.objects,
				pixleSize: 0.001953,
				spaceType: Space.pixles,
			}

			window.ossieGame = new OssieGame(levelConfig, this)
			const interPhaser = window.ossieGame.interPhaser

			const newBackground = interPhaser.phaser.add.sprite(0, 0, 'background11_ss', 0)
			newBackground.name = 'background'
			newBackground.setOrigin(0, 0)
			newBackground.setDisplaySize(interPhaser.width, interPhaser.height)
			interPhaser.objects.background.destroy()
			interPhaser.objects.background = newBackground as PhaserImage

			this.anims.create({
				key: 'background11_anim',
				frames: this.anims.generateFrameNames('background11_ss'),
				frameRate: 2,
			})

			interPhaser.afterIntro = () => {
				newBackground.play('background11_anim')
			}
		}
		const timeout = true ? 5 : 5000
		const modal = new EventModal(this, SSKey.beforelvl11, timeout, loadLevel.bind(this))
		modal.render()
	}
}
