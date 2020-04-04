import { modalConfig } from './constants/modals'
import { setGameObject } from './utils/phaser_objects'
import { OBJECT_CONFIG, VICTORY_TIMEOUT } from './constants/sizes'
import { ModalKey } from './types/modals'
import { LEVELS } from './constants/objects'

window.modalVisible = null
declare global {
	interface Window {
		modalVisible: Modal | null
	}
}
enum ModalMode {
	html = 'html',
}
interface Modal {
	// Open for custom usage
	afterRender?(): void
	// Open for custom usage
	afterHide?(): void
	dismissHandler(e): void
	hide(): void
	isVisible: boolean
	key: ModalKey | null
	mode: ModalMode
	modalParts: object[]
	render(): void
	renderBackground(): void
	renderButtons(): void
	spawn(phaser: Phaser.Scene, key: ModalKey, dismissCallback: () => void): void

}
export const Modal: Modal = {
	spawn: function(phaser, key, dismissCallback: () => void) {
		this.phaser = phaser
		this.key = key
		if (modalConfig[key] !== undefined) {
			this.mode = modalConfig[key].mode
		}
		this.dismissCallback = dismissCallback
		this.render()
	},

	key: null,
	isVisible: false,
	modalParts: [],
	mode: ModalMode.html,

	render: function() {
		if (this.isVisible) { return }

		if (window.modalVisible !== null) {
			console.log('Warning: trying to open a new popup "' + this.key +
				'" when popup "' + window.modalVisible + '" is still open!')
			window.modalVisible.hide()
		}

		window.modalVisible = this
		this.isVisible = true

		this.renderBackground()
		this.renderButtons()

		if (this.afterRender) { this.afterRender() }
	},

	renderBackground: function() {
		if (this.mode === ModalMode.html) {
			this.modalEl = document.getElementById(this.key + "_modal")
			let newClass = this.modalEl.className + ' active'
			this.modalEl.className = newClass
			return
		}
		let spritesheetId = this.key + '_ss'
		let animId = this.key + '_anim'

		this.phaser.anims.create({
			key: animId,
			frames: this.phaser.anims.generateFrameNames(spritesheetId),
			frameRate: modalConfig[this.key].frameRate,
		})
		this.background = this.phaser.add.sprite(0, 0, spritesheetId, 1)
		this.background.setDepth(10)
		this.background.setOrigin(0, 0)
		this.background.setInteractive()
		this.background.setDisplaySize(window.gameWidth, window.gameHeight)
		this.background.play(animId)
		this.modalParts.push(this.background)
	},

	renderButtons: function() {
		if (this.mode === ModalMode.html) {
			let buttonName = modalConfig[this.key].buttons[0]
			let dismissBtn = this.modalEl.querySelector('.' + buttonName)
			dismissBtn.addEventListener(
				'click',
				this.dismissHandler.bind(this),
				{ once: true }
			)
		}
		let dismissBtn = setGameObject(this.phaser, OBJECT_CONFIG['okButton'], 'okButton')
		dismissBtn.on('pointerdown', this.dismissHandler.bind(this))
		this.modalParts.push(dismissBtn)
	},

	dismissHandler: function(e) {
		this.hide()
		if (this.dismissCallback) {
			this.dismissCallback()
		}
	},

	hide: function() {
		if (!this.isVisible) { return }

		for (let object of this.modalParts) {
			object.destroy()
		}
		if (this.mode === 'html') {
			let newClass = this.modalEl.className.replace('active', '')
			this.modalEl.className = newClass
		}
		this.isVisible = false
		window.modalVisible = null

		if (this.afterHide) { this.afterHide() }
	}
}


// Win modal
export const LevelCompleteModal = Object.create(Modal)
LevelCompleteModal.spawn = function(phaser: Phaser.Game, levelName: string, dismissCallback) {
	this.phaser = phaser
	this.levelName = levelName
	this.dismissCallback = dismissCallback
	this.render()
}
LevelCompleteModal.key = 'levelcomplete'
LevelCompleteModal.mode = modalConfig[LevelCompleteModal.key].mode
LevelCompleteModal.renderButtons = function() {
	this.timer = setTimeout(function() {
		let againQuery = '.prevButton'
		let againButton = this.modalEl.querySelector(againQuery)
		againButton.addEventListener('click', this.dismissHandler.bind(this), { once: true })

		this.nextHandler = function(e) {
			this.hide()
			window.game.scene.stop(this.levelName)
			let nextLevel = LEVELS[LEVELS.indexOf(this.levelName) + 1]
			if (nextLevel === undefined) {
				console.error("Trying to start undefined level")
			}
			window.game.scene.start(nextLevel)
		}.bind(this)

		let nextQuery = '.nextButton'
		let nextButton = this.modalEl.querySelector(nextQuery)
		nextButton.addEventListener('click', this.nextHandler, { once: true })

		againButton.className = againButton.className + ' active'
		nextButton.className = nextButton.className + ' active'
	}.bind(this), VICTORY_TIMEOUT)
}
LevelCompleteModal.afterHide = function(){
	let btns = document.querySelector('.prevButton, .nextButton')
	if (!btns) { return }
	btns.className = btns.className.replace('active', '')
}

export const FailModal = Object.create(Modal)
FailModal.key = 'fail'
FailModal.mode = modalConfig[FailModal.key].mode
FailModal.spawn = function(phaser: Phaser.Game){
	this.phaser = phaser
	this.render()
}

// Event modal
export const EventModal = Object.create(Modal)
EventModal.spawn = function(phaser: Phaser.Game, key: ModalKey, timeout: number, dismissCallback: () => void) {
	this.phaser = phaser
	this.timeout = timeout
	this.key = key
	this.mode = modalConfig[key].mode
	this.dismissCallback = dismissCallback
	this.render()
}
// Prevent interaction until timeout finishes
EventModal.renderButtons = function() {
	this.timer = setTimeout(function(e) {
		let zone = this.phaser.add.zone(0, 0, window.gameWidth, window.gameHeight)
		zone.setOrigin(0, 0)
		zone.setInteractive()
		zone.on('pointerdown', this.dismissHandler.bind(this))
		console.log(zone)
		this.modalParts.push(zone)
	}.bind(this), this.timeout)
}
