import Modal from '~/modal'
import { SSKey } from '~/types/spritesheets'

export default class InputModal extends Modal {
	timeout: number
	timer: number

	constructor(phaser: Phaser.Scene, key: SSKey, timeout: number, dismissCallback?: () => void) {
		super(phaser, key, dismissCallback)
		this.timeout = timeout
	}
}
