import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS, LEVELS } from '~/constants/objects'
import EventModal from '~/modals/event'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { Board } from '~/types/board'
import { LevelConfigGrid, Space } from '~/types/game_config'
import { SSKey } from '~/types/spritesheets'
import { boardToNodes, preloadLevel } from '~/utils/level_setup'

export default class Level10 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super('level10')
	}

	levelName = 'level10'

	objects = COMMON_OBJECTS.concat([
		'questionmark',
		'step',
		'if_padlinks',
		'if_padrechts',
		'if_padvooruit',
		'else',
		'for_till',
		'for_x',
		'turndegrees',
	])
	modals = COMMON_MODALS.concat([
		SSKey.afterlvl10,
	])

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() { preloadLevel(this) }

	create() {
		const gameboard = [
			[0,0,0,0,0,0,0,0,0],
			[0,0,1,1,1,0,1,1,1],
			[1,1,1,0,1,1,1,0,2],
			[1,0,0,0,0,0,0,0,0],
			[1,1,1,1,1,1,1,1,1],
			[0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1],
		] as Board
		const [nodes, goalPosition] = boardToNodes(gameboard)
		const levelConfig: LevelConfigGrid = {
			goalPosition: goalPosition,
			hideMaxCommands: true,
			initPosition: {
				orientation: 90,
				nodeLocation: '0,6',
			},
			maxCommands: 10,
			levelName: this.levelName,
			nodes,
			objects: this.objects,
			spaceType: Space.grid,
		}

		window.ossieGame = new OssieGame(levelConfig, this)
		const interPhaser = window.ossieGame.interPhaser
		const levelName = this.levelName
		const callback = () => {
			window.game.scene.stop(levelName)
			window.game.scene.start(LEVELS[LEVELS.indexOf(levelName) + 1])
		}

		const intermezzoModal = new EventModal(interPhaser.phaser, SSKey.afterlvl10, 3000, callback)
		interPhaser.win = () => {
			intermezzoModal.render()
		}
	}
}
