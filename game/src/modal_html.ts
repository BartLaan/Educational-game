import { modalConfig } from './constants/modals'
import { GIF_PATHS } from './constants/paths'
import ModalPhaser from './modal_phaser'
import { SSKey } from './types/spritesheets'

window.modalVisible = null
declare global {
	interface Window {
		modalVisible: ModalHtml | ModalPhaser | null
	}
}
export default class ModalHtml {
	afterHide?: () => void
	afterRender?: () => void
	dismissCallback?: () => void
	key: SSKey
	isVisible = false
	modalEl: HTMLElement | null = null
	modalParts: any[] = []
	phaser: Phaser.Scene

	constructor(phaser: Phaser.Scene, key: SSKey, dismissCallback?: () => void) {
		this.phaser = phaser
		this.key = key
		this.dismissCallback = dismissCallback
	}

	render() {
		if (this.isVisible) { return }

		if (window.modalVisible !== null) {
			console.log(`Warning: trying to open a new popup "${this.key}"
				when popup "${window.modalVisible.key}" is still open!`)
			window.modalVisible.hide()
		}

		window.modalVisible = this
		this.isVisible = true

		this.renderBackground()
		this.renderButtons()

		if (this.afterRender) { this.afterRender() }
	}

	renderBackground() {
		const modalElId = this.key + '_modal'
		this.modalEl = document.getElementById(modalElId)
		if (this.modalEl === null) { return console.error('cant find', modalElId) }

		const newClass = this.modalEl.className + ' active'
		this.modalEl.className = newClass

		const backgroundEl = document.querySelector(`#${modalElId} .fullscreenGif`) as HTMLImageElement | null
		if (!backgroundEl) { return console.error('cant find fullscreenGif for', modalElId) }
		const imgSrc = backgroundEl.src
		backgroundEl.src = ''
		backgroundEl.src = imgSrc
		return
	}

	renderButtons() {
		if (this.modalEl === null) { return }

		const buttonName = modalConfig[this.key].buttons[0]
		const htmlDismissBtn = this.modalEl.querySelector('.' + buttonName)
		if (htmlDismissBtn === null) { return }

		htmlDismissBtn.addEventListener(
			'click',
			this.dismissHandler.bind(this),
			{ once: true },
		)
		return
	}

	dismissHandler() {
		this.hide()
		if (this.dismissCallback) {
			this.dismissCallback()
		}
	}

	hide() {
		if (!this.isVisible) { return }

		this.isVisible = false
		window.modalVisible = null

		if (this.modalEl) {
			const newClass = this.modalEl.className.replace('active', '')
			this.modalEl.className = newClass
		}

		for (const modalPart of this.modalParts) {
			modalPart.destroy?.()
		}

		if (this.afterHide) { this.afterHide() }
	}
}

// Preload modal gifs to work around loading times
export function loadHTMLModal(modalKey: string) {
	const modalContainer = document.getElementById('modalContainer')
	const modalElId = modalKey + '_modal'
	if (document.getElementById(modalElId) !== null || modalContainer === null) { return }

	const modalEl = document.createElement('div')
	modalEl.id = modalElId
	modalEl.className = 'modal'

	const modalBg = document.createElement('img')
	modalBg.src = GIF_PATHS[modalKey]
	modalBg.className = 'fullscreenGif'
	modalEl.appendChild(modalBg)
	for (const buttonName of modalConfig[modalKey].buttons) {
		const buttonEl = document.createElement('div')
		buttonEl.className = 'modalButton ' + buttonName
		modalEl.appendChild(buttonEl)
	}

	modalContainer.appendChild(modalEl)
}
