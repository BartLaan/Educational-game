import { modalConfig } from './constants/modals'
import { OBJECT_CONFIG } from './constants/sizes'
import { SSKey } from './types/spritesheets'
import { setGameObject } from './utils/phaser_objects'

window.modalVisible = null
declare global {
	interface Window {
		modalVisible: Modal | null
	}
}
enum ModalMode {
	html = 'html',
}
export default class Modal {
	afterHide?: () => void
	afterRender?: () => void
	dismissCallback?: () => void
	key: SSKey
	isVisible = false
	modalEl: HTMLElement | null = null
	modalParts: any[] = []
	mode = ModalMode.html
	phaser: Phaser.Scene

	constructor(phaser: Phaser.Scene, key: SSKey, dismissCallback?: () => void) {
		this.phaser = phaser
		this.key = key
		if (modalConfig[key] !== undefined) {
			this.mode = modalConfig[key].mode
		}
		this.dismissCallback = dismissCallback
	}

	render() {
		if (this.isVisible) { return }

		if (window.modalVisible !== null) {
			console.log(`Warning: trying to open a new popup "${this.key}"
				when popup "' + window.modalVisible + '" is still open!`)
			window.modalVisible.hide()
		}

		window.modalVisible = this
		this.isVisible = true

		this.renderBackground()
		this.renderButtons()

		if (this.afterRender) { this.afterRender() }
	}

	renderBackground() {
		if (this.mode === ModalMode.html) {
			const modalElId = this.key + '_modal'
			this.modalEl = document.getElementById(modalElId)
			if (this.modalEl === null) { return console.error('cant find', modalElId) }

			const newClass = this.modalEl.className + ' active'
			this.modalEl.className = newClass
			return
		}
		const spritesheetId = this.key + '_ss'
		const animId = this.key + '_anim'

		this.phaser.anims.create({
			key: animId,
			frames: this.phaser.anims.generateFrameNames(spritesheetId),
			frameRate: modalConfig[this.key].frameRate,
		})
		const background = this.phaser.add.sprite(0, 0, spritesheetId, 1)
		background.setDepth(10)
		background.setOrigin(0, 0)
		background.setInteractive()
		background.setDisplaySize(window.gameWidth, window.gameHeight)
		background.play(animId)
		this.modalParts.push(background)
	}

	renderButtons() {
		if (this.mode === ModalMode.html) {
			const buttonName = modalConfig[this.key].buttons[0]
			if (this.modalEl === null) { return }

			const htmlDismissBtn = this.modalEl.querySelector('.' + buttonName)
			if (htmlDismissBtn === null) { return }

			htmlDismissBtn.addEventListener(
				'click',
				this.dismissHandler.bind(this),
				{ once: true },
			)
			return
		}
		const dismissBtn = setGameObject(this.phaser, OBJECT_CONFIG.okButton, 'okButton')
		dismissBtn.on('pointerdown', this.dismissHandler.bind(this))
		this.modalParts.push(dismissBtn)
	}

	dismissHandler() {
		this.hide()
		if (this.dismissCallback) {
			this.dismissCallback()
		}
	}

	hide() {
		console.log(this)
		window.modalVisible = null
		if (!this || !this.isVisible) { return }

		for (const object of this.modalParts) {
			object.destroy()
		}
		if (this.mode === 'html' && this.modalEl) {
			const newClass = this.modalEl.className.replace('active', '')
			this.modalEl.className = newClass
		}
		this.isVisible = false

		if (this.afterHide) { this.afterHide() }
	}
}
