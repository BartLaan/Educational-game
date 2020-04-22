import Modal from '~/modal'
import { SSKey } from '~/types/spritesheets'

export default class EventModal extends Modal {
	timeout: number
	timer: number

	constructor(phaser: Phaser.Scene, key: SSKey, timeout: number, dismissCallback?: () => void) {
		super(phaser, key, dismissCallback)
		this.timeout = timeout
	}

	// Prevent interaction until timeout finishes
	renderButtons() {
		this.timer = setTimeout(() => {
			const zone = this.phaser.add.zone(0, 0, window.gameWidth, window.gameHeight)
			zone.setOrigin(0, 0)
			zone.setInteractive()
			zone.on('pointerdown', this.dismissHandler, this)
			console.log(zone)
			this.modalParts.push(zone)
		}, this.timeout)
	}
}
