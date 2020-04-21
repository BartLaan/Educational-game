import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import InterPhaser from '~/inter_phaser'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { Board } from '~/types/board'
import { LevelConfigGrid, Space } from '~/types/game_config'
import { InterPhaserEvent } from '~/types/interphaser'
import { boardToNodes, preloadLevel } from '~/utils/level_setup'

class Level3b extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super('level3b')
	}

	levelName = 'level3b'

	objects = COMMON_OBJECTS.concat([
		'questionmark',
		'step',
		'for',
		'turnleft',
		'turnright',
	])
	modals = COMMON_MODALS

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() { preloadLevel(this) }

	create() {
		const gameboard = [
			[0,0,0,0,0,1,0,0,0],
			[0,0,0,0,1,1,0,0,0],
			[0,0,0,1,2,0,0,0,0],
			[0,0,1,1,0,0,0,0,0],
			[0,1,1,0,0,0,0,0,0],
			[1,1,0,0,0,0,0,0,0],
			[1,0,0,0,0,0,0,0,0],
		] as Board
		const [nodes, goalPosition] = boardToNodes(gameboard)
		const levelConfig: LevelConfigGrid = {
			goalPosition: goalPosition,
			initPosition: {
				orientation: 90,
				nodeLocation: '0,6',
			},
			maxCommands: 7,
			levelName: this.levelName,
			nodes,
			objects: this.objects,
			spaceType: Space.grid,
		}

		window.ossieGame = new OssieGame(levelConfig, this)

		const interPhaser = window.ossieGame.interPhaser
		let forCounter = 0
		let goal = false
		// Special handling of this level so we transition upon goal condition, namely:
		// player is past question mark and had more than 7 for-loops
		interPhaser.afterCommandExecute = (objectRef) => {
			if (objectRef.indexOf('step') > -1 && window.ossieGame.stackManager.hasReachedGoal()) {
				goal = true
			}

			if (objectRef.indexOf('for') === -1) {
				return
			}
			forCounter += 1
			if (goal && forCounter <= 7) {
				return
			}

			window.ossieGame.phaserHandler(InterPhaserEvent.reset)
			window.game.scene.stop('level3b')
			window.game.scene.start('level3c')
		}
		interPhaser.fail = () => {
			InterPhaser.prototype.fail.bind(interPhaser)()
			goal = false
			forCounter = 0
		}
	}
}

export default Level3b
