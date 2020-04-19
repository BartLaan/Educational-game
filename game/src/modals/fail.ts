import Modal from '~/modal'
import { ModalKey } from '~/types/modals'

export default class FailModal extends Modal {
	constructor(phaser: Phaser.Scene) {
		super(phaser, ModalKey.fail)
	}
}
