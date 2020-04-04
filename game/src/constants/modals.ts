import { LEVELS } from './objects'

export const modalConfig = {
	'afterlvl10': {
		buttons: [ 'invisibleButton' ],
		mode: 'html',
	},
	'afterlvl20': {
		buttons: [ 'invisibleButton' ],
		mode: 'html',
	},
	'beforelvl11': {
		buttons: [ 'invisibleButton' ],
		mode: 'html',
	},
	'fail': {
		buttons: [ 'okButton' ],
		mode: 'html',
	},
	'intro': {
		buttons: [ 'invisibleButton' ],
		mode: 'html',
	},
	'instruction': {
		buttons: [ 'okButton' ],
		frameRate: 1,
		mode: 'html',
	},
	'levelcomplete': {
		buttons: [ 'nextButton', 'prevButton' ],
		frameRate: 6,
		mode: 'html',
	},
	'phaser_example': {
		buttons: [],
		frameRate: 1,
		mode: 'phaser',
	}
}

for (let levelName of LEVELS) {
	let instructionName = levelName.replace('level', 'instruction')
	modalConfig[instructionName] = modalConfig.instruction
}