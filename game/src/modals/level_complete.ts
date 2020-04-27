import { LEVELS } from '~/constants/objects'
import { VICTORY_TIMEOUT } from '~/constants/sizes'
import Modal from '~/modal'
import { SSKey } from '~/types/spritesheets'

// Win modal
export default class LevelCompleteModal extends Modal {
	levelName: string

	constructor(phaser: Phaser.Scene, levelName: string, dismissCallback: () => void) {
		super(phaser, SSKey.levelcomplete, dismissCallback)
		this.levelName = levelName
	}

	timer: number
	renderButtons() {
		const nextHandler = () => {
			this.hide()
			window.game.scene.stop(this.levelName)
			const nextLevel = LEVELS[LEVELS.indexOf(this.levelName) + 1]
			if (nextLevel === undefined) {
				console.error('Trying to start undefined level')
			}
			window.game.scene.start(nextLevel)
		}

		const againQuery = '.prevButton'
		if (!this.modalEl) { return console.error }
		const againButton = this.modalEl.querySelector(againQuery)
		if (!againButton) { return console.error() }

		const nextQuery = '.nextButton'
		const nextButton = this.modalEl.querySelector(nextQuery)
		if (!nextButton) { return console.error() }

		this.timer = setTimeout(() => {
			againButton.addEventListener('click', this.dismissHandler.bind(this), { once: true })
			nextButton.addEventListener('click', nextHandler, { once: true })

			againButton.className = againButton.className + ' active'
			nextButton.className = nextButton.className + ' active'
		}, VICTORY_TIMEOUT)
	}

	afterHide = () => {
		const prevButton = document.querySelector('.prevButton')
		const nextButton = document.querySelector('.nextButton')
		if (!prevButton || !nextButton) { return console.error() }
		prevButton.className = prevButton.className.replace('active', '')
		nextButton.className = nextButton.className.replace('active', '')
	}
}
