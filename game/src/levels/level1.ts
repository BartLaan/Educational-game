import Phaser from 'phaser'
import { COMMON_MODALS, COMMON_OBJECTS } from '~/constants/objects'
import EventModal from '~/modals/event'
import OssieGame from '~/ossie_game'
import { PhaserLevel } from '~/types'
import { Board } from '~/types/board'
import { LevelConfigGrid, Space } from '~/types/game_config'
import { SSKey } from '~/types/spritesheets'
import { boardToNodes, preloadLevel } from '~/utils/level_setup'

class Level1 extends Phaser.Scene implements PhaserLevel {
	constructor() {
		super('level1')
	}

	levelName = 'level1'

	objects = COMMON_OBJECTS.concat([
		'questionmark',
		'step',
	])
	modals = COMMON_MODALS.concat([
		SSKey.intro,
	])

	initialize() { Phaser.Scene.call(this, { key: this.levelName }) }

	preload() { preloadLevel(this) }

	create() {
		const startLevel1 = () => {
			const gameboard = [
				[0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,1],
				[1,1,1,1,1,1,1,2,1],
			] as Board
			const [nodes, goalPosition] = boardToNodes(gameboard)
			const levelConfig: LevelConfigGrid = {
				goalPosition: goalPosition,
				initPosition: {
					orientation: 90,
					nodeLocation: '0,6',
				},
				maxCommands: 9,
				levelName: this.levelName,
				nodes: nodes,
				objects: this.objects,
				spaceType: Space.grid,
			}

			window.ossieGame = new OssieGame(levelConfig, this)
		}
		const introModal = Object.create(EventModal)
		introModal.spawn(this, 'intro', 3000, startLevel1.bind(this))
	}
}

export default Level1
