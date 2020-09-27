import { modalConfig } from '~/constants/modals'
import Modal from '~/modal_html'
import { SSKey } from '~/types/spritesheets'
import LevelOverviewModal from './level_overview'

export default class InstructionModal extends Modal {

	constructor(phaser: Phaser.Scene, key: SSKey, dismissCallback?: () => void) {
		super(phaser, key, dismissCallback)
	}

	renderButtons() {
		super.renderButtons()
		if (!this.modalEl) { return }

		const overviewButton = this.modalEl.querySelector(`.${modalConfig.instruction.buttons[1]}`)

		const loadOverview = () => {
			this.dismissHandler()
			const overviewModal = new LevelOverviewModal(this.phaser, window.activeLevel)
			overviewModal.render()
		}

		overviewButton?.addEventListener('click', loadOverview, { once: true })
	}
}
