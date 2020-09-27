import Modal from '~/modal_html'
import { SSKey } from '~/types/spritesheets'

export default class FailModal extends Modal {
	constructor(phaser: Phaser.Scene) {
		super(phaser, SSKey.fail)
	}
}
