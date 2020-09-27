import { modalConfig } from './constants/modals'
import { OBJECT_CONFIG } from './constants/sizes'
import { SSKey } from './types/spritesheets'
import { setGameObject } from './utils/phaser_objects'

export default class ModalPhaser {
	animate: boolean
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
		if (!this.animate) {
			const background = this.phaser.add.image(0, 0, this.key, 1)
			background.setDepth(10)
			background.setOrigin(0, 0)
			background.setDisplaySize(window.gameWidth, window.gameHeight)
			this.modalParts.push(background)
			return
		}

		const spritesheetId = this.key + '_ss'
		const animId = this.key + '_anim'

		this.phaser.anims.create({
			key: animId,
			frames: this.phaser.anims.generateFrameNames(spritesheetId),
			frameRate: modalConfig[this.key].frameRate,
		})
		const animBackground = this.phaser.add.sprite(0, 0, spritesheetId, 1)
		animBackground.setDepth(10)
		animBackground.setOrigin(0, 0)
		animBackground.setInteractive()
		animBackground.setDisplaySize(window.gameWidth, window.gameHeight)
		animBackground.play(animId)
		this.modalParts.push(animBackground)
	}

	renderButtons() {
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
		if (!this.isVisible) { return }

		this.isVisible = false
		window.modalVisible = null

		for (const object of this.modalParts) {
			object.destroy()
		}

		if (this.afterHide) { this.afterHide() }
	}
}
