import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS, LEVELS } from '~/constants/objects'
import OssieGame from '~/ossie_game'
import { Board } from '~/types/board'
import { LevelConfigGrid, Space } from '~/types/game_config'
import { boardToNodes, initializeLevel, preloadLevel } from '~/utils/level_setup'
import { EventModal } from '~/modals'

export default class Level10 extends Phaser.Scene {
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
		'afterlvl10',
	])

	initialize() { initializeLevel.bind(this)() }

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
		let interPhaser = window.ossieGame.interPhaser
		let callback = function() {
			window.game.scene.stop(this.levelName)
			window.game.scene.start(LEVELS[LEVELS.indexOf(this.levelName) + 1])
		}.bind(this)

		let intermezzoModal = Object.create(EventModal)
		interPhaser.win = function() {
			intermezzoModal.spawn(interPhaser.phaser, 'afterlvl10', 3000, callback)
		}
	}
}
