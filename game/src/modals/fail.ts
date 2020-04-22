import Modal from '~/modal'
import { SSKey } from '~/types/spritesheets'

export default class FailModal extends Modal {
	constructor(phaser: Phaser.Scene) {
		super(phaser, SSKey.fail)
	}
}
