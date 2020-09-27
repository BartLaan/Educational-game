import { LEVELS } from './constants/objects'
import InterPhaser from './inter_phaser'
import StackManager from './stack'
import { LevelConfig } from './types/game_config'
import { InterPhaserEvent } from './types/interphaser'
import { StackEvent } from './types/stack'
import { setCookie } from './utils/cookies'

// Constructor for OssieGame instance. See OssieGame.checkLevelConfig for details on levelConfig.
export default class OssieGame {
	constructor(levelConfig: LevelConfig, scene: Phaser.Scene) {
		window.activeLevel = levelConfig.levelName
		window.location.hash = levelConfig.levelName
		this.levelName = levelConfig.levelName

		this.stackManager = new StackManager(levelConfig, this.stackHandler.bind(this))
		this.interPhaser = new InterPhaser(scene, levelConfig, this.phaserHandler.bind(this))
		if (window.debug) {
			console.log(this)
		}
		if (levelConfig.animate !== undefined) {
			this.animate = levelConfig.animate
		}
		if (levelConfig.shouldFail !== undefined) {
			this.shouldFail = levelConfig.shouldFail
		}
	}

	animate = true
	interPhaser: InterPhaser
	levelName: string
	stackManager: StackManager
	shouldFail = true

	phaserHandler(eventCode: InterPhaserEvent, data?: any) {
		console.log('event', eventCode, 'data', data)
		switch (eventCode) {
			case InterPhaserEvent.reset:
				clearTimeout(this.stackManager.timer)
				this.stackManager.pathTaken = []
				this.stackManager.resetOssie()
				break
			case InterPhaserEvent.start:
				this.stackManager.stack = data.stack
				this.stackManager.stackStart()
				break
			default:
		}
	}

	stackHandler(eventCode: StackEvent, data: any) {
		// console.log('OSSIE EVENT: eventCode=' + eventCode + ' data=', data)
		if (eventCode === StackEvent.fail && !this.shouldFail) { return }

		switch (eventCode) {
			case StackEvent.executeCommand:
				this.interPhaser.onCommandExecute(data)
				break
			case StackEvent.fail:
			case StackEvent.openEnd:
				setTimeout(() => {
					this.interPhaser.fail()
					this.stackManager.resetOssie()
				}, 800)
				break
			case StackEvent.ossieposChange:
				this.interPhaser.movePlayer(this.stackManager.getPosition(), { animate: this.animate, ...data })
				break
			case StackEvent.start:
				// this.interPhaser.disableStackInteraction()
				break
			case StackEvent.walkintowall:
				console.log('BONK, you walked into a wall')
				break
			case StackEvent.win:
				setCookie('level_progress', LEVELS.indexOf(this.levelName).toString())
				this.interPhaser.win()
				break
			case StackEvent.forgotOpen:
				this.interPhaser.fail()
				break
			default:
		}
	}
}
