import StackManager from './stack'
import { InterPhaserEvent } from './types/interphaser'
import { LevelConfig } from './types/game_config'
import { StackEvent } from './types/stack'
import InterPhaser from './inter_phaser'

// Constructor for OssieGame instance. See OssieGame.checkLevelConfig for details on levelConfig.
export default class OssieGame {
	constructor(levelConfig: LevelConfig, phaser: Phaser.Scene) {
		if (window.activeLevel == levelConfig.levelName) {
			return
		}
		window.activeLevel = levelConfig.levelName
		window.location.hash = levelConfig.levelName

		this.stackManager = new StackManager(levelConfig, this.stackHandler.bind(this))
		this.interPhaser = new InterPhaser(phaser, levelConfig, this.phaserHandler.bind(this))
		if (window.debug) {
			console.log(this)
		}
	}

	interPhaser: InterPhaser
	stackManager: StackManager

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
		switch (eventCode) {
			case StackEvent.executeCommand:
				this.interPhaser.onCommandExecute(data)
				break
			case StackEvent.fail:
			case StackEvent.openEnd:
				setTimeout(function(){
					this.interPhaser.fail()
					this.stackManager.resetOssie()
				}.bind(this), 800)
				break
			case StackEvent.ossieposChange:
				this.interPhaser.updateOssiePos(this.stackManager.getPosition(), true)
				break
			case StackEvent.start:
				// this.interPhaser.disableStackInteraction()
				break
			case StackEvent.walkintowall:
				console.log("BONK, you walked into a wall")
				break
			case StackEvent.win:
				this.interPhaser.win()
				break
			case StackEvent.forgotOpen:
				this.interPhaser.fail()
				break
			default:
		}
	}
}
