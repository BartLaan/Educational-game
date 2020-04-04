import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import { EventModal } from '~/modals'
import OssieGame from '~/ossie_game'
import { LevelConfigPixle, Space } from '~/types/game_config'
import { SSKey } from '~/types/spritesheets'
import { initializeLevel, loadSpritesheet, preloadLevel } from '~/utils/level_setup'

export default class Level11 extends Phaser.Scene {
	constructor(){
		super('level11')
	}

	levelName = 'level11'

	objects = COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixles',
	])
	modals = COMMON_MODALS.concat([
		'beforelvl11',
	])

	initialize() { initializeLevel.bind(this)() }

	preload() {
		preloadLevel(this)
		loadSpritesheet(this, SSKey.background11)
	}

	create() {
		let loadLevel = function(){
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
			let interPhaser = window.ossieGame.interPhaser

			let newBackground = interPhaser.phaser.add.sprite(0, 0, 'background11_ss', 0)
			interPhaser.objects.background.destroy()
			interPhaser.objects.background = newBackground
			newBackground.setOrigin(0, 0)
			newBackground.name = 'background'
			newBackground.setDisplaySize(interPhaser.width, interPhaser.height)

			this.anims.create({
				key: 'background11_anim',
				frames: this.anims.generateFrameNames("background11_ss"),
				frameRate: 2,
			})

			interPhaser.afterIntro = function() {
				newBackground.play('background11_anim')
			}
		}
		let modal = Object.create(EventModal)
		let timeout = true ? 5 : 5000
		modal.spawn(this, 'beforelvl11', timeout, loadLevel.bind(this))
	}
}
