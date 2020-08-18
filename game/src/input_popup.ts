import { SPRITE_PATHS } from './constants/paths'

export enum InputType {
	counts = 'counts',
	degrees = 'degrees',
	pixles = 'pixles',
}

const backgroundKeyMap: { [key in InputType]: string } = {
	counts: 'popup-for-x',
	pixles: 'popup-pixles',
	degrees: 'popup-degrees',
}

const submitOnEnter = (e) => {
	if (!e.which) { return }
	// enter
	if (e.which === 13) {
		document.getElementById('inputPopupOkButton')?.click()
		return
	}
	// esc
	if (e.which === 27) {
		document.getElementById('inputPopupCancelButton')?.click()
	}
}

type InputCallback = (input?: number) => void

export default class InputPopup {
	backgroundEl: HTMLDivElement | null
	inputCallback: InputCallback
	inputEl: HTMLInputElement | null
	cancelButton: HTMLButtonElement | null
	okButton: HTMLButtonElement | null
	inputType: InputType
	modalEl: HTMLDivElement | null

	constructor(inputType: InputType, inputCallback: InputCallback) {
		this.inputType = inputType
		this.inputCallback = inputCallback

		this.backgroundEl = document.getElementById('inputPopupWrapper') as HTMLDivElement | null
		this.cancelButton = document.getElementById('inputPopupCancelButton') as HTMLButtonElement | null
		this.modalEl = document.getElementById('inputPopup') as HTMLDivElement | null
		this.okButton = document.getElementById('inputPopupOkButton') as HTMLButtonElement | null
		this.inputEl = document.getElementById('inputPopupTextInput') as HTMLInputElement | null
		if (this.backgroundEl === null) { console.error('cannot find #inputPopupBackground')}
		if (this.cancelButton === null) { console.error('cannot find #inputPopupCancelButton')}
		if (this.modalEl === null) { console.error('cannot find #inputPopup')}
		if (this.okButton === null) { console.error('cannot find #inputPopupOkButton')}
		if (this.inputEl === null) { console.error('cannot find #inputPopupTextInput')}
	}

	hide() {
		if (!this.modalEl || !this.inputEl) { return }
		this.modalEl.className = this.modalEl.className.replace('visible', '')
		this.inputEl.value = ''
		this.inputEl.removeEventListener('keyup', submitOnEnter)

		const canvas = document.getElementsByTagName('canvas')[0]
		if (canvas) {
			canvas.style.pointerEvents = 'unset'
		}
	}

	render() {
		if (!this.backgroundEl || !this.modalEl || !this.okButton || !this.cancelButton || !this.inputEl) { return }
		this.backgroundEl.style.backgroundImage = `url(${SPRITE_PATHS[backgroundKeyMap[this.inputType]]})`
		this.modalEl.className = this.modalEl.className.replace('visible', '') + ' visible'
		this.cancelButton.onclick = this.onCancel.bind(this)
		this.okButton.onclick = this.onConfirm.bind(this)
		this.inputEl.addEventListener('keyup', submitOnEnter)
		this.inputEl.focus()
		const canvas = document.getElementsByTagName('canvas')[0]
		if (canvas) {
			canvas.style.pointerEvents = 'none'
		}
	}

	onCancel() {
		this.hide()
		this.inputCallback(undefined)
	}

	onConfirm() {
		if (!this.inputEl) { return }
		const stringValue = this.inputEl.value

		const numValue = parseInt(stringValue, 10)
		const minRange = this.inputType === InputType.degrees ? -1000 : 0
		if (!isNaN(numValue) && numValue < 1000 && numValue > minRange && Math.round(numValue) === numValue) {
			this.hide()
			return this.inputCallback(numValue)
		}

		if (!this.backgroundEl) { return }
		this.backgroundEl.style.backgroundImage = `url(${SPRITE_PATHS[backgroundKeyMap[this.inputType] + '-error']})`
	}
}
