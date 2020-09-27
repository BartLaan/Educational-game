import ModalPhaser from '~/modal_phaser'
import { ObjectConfig } from '~/types/interphaser'
import { SSKey } from '~/types/spritesheets'
import { setGameObject } from '~/utils/phaser_objects'
import { LEVELS } from '~/constants/objects'
import { getCookie } from '~/utils/cookies'
import { HOVER_SCALING } from '~/constants/sizes'

export default class LevelOverviewModal extends ModalPhaser {
	animate = false
	currentLevel: string

	constructor(phaser: Phaser.Scene, currentLevel: string) {
		super(phaser, SSKey.leveloverview)
		this.currentLevel = currentLevel
	}

	renderButtons() {
		const progressCookie = getCookie('level_progress')

		// highest available level is the level after the player's
		// progress/highest finished level, or just the first level if there's
		// no progress
		const highestAvailableLevel = progressCookie ? parseInt(progressCookie, 10) + 1 : 0
		const okButton = setGameObject(this.phaser, levelOverviewConfigs['ok-button'], 'overview-ok')
		this.modalParts.push(okButton)
		okButton.on('pointerdown', () => {
			this.dismissHandler()
			window.ossieGame.interPhaser.showIntro()
		})

		const okButtonHover = hoverZoom(okButton, this.phaser)
		okButton.on('pointerover', okButtonHover.onMouseOver)
		okButton.on('pointerout', okButtonHover.onMouseOut)

		for (const levelIcon of levelIcons) {
			const level = levelMapping[levelIcon]
			const objConfig = levelOverviewConfigs[levelIcon]

			if (highestAvailableLevel < LEVELS.indexOf(level)) {
				const qmConfig = getQMConfig(objConfig)
				const qmButton = setGameObject(this.phaser, qmConfig, `overview-qm-${levelIcon}`)
				this.modalParts.push(qmButton)
				continue
			}

			const levelButton = setGameObject(this.phaser, objConfig, levelIcon)
			this.modalParts.push(levelButton)
			levelButton.on('pointerdown', () => {
				this.dismissHandler()
				window.game.scene.stop(this.currentLevel)
				window.game.scene.start(level)
			}, this)

			const levelButtonHover = hoverZoom(levelButton, this.phaser)
			levelButton.on('pointerover', levelButtonHover.onMouseOver)
			levelButton.on('pointerout', levelButtonHover.onMouseOut)
		}
	}
}

const hoverZoom = (gameObject, phaser: Phaser.Scene) => {
	const defaultScale = gameObject.scale
	const onMouseOver = () => {
		gameObject.setScale(defaultScale * HOVER_SCALING)
		phaser.input.setDefaultCursor('pointer')
	}
	const onMouseOut = () => {
		gameObject.setScale(defaultScale)
		phaser.input.setDefaultCursor('default')
	}
	return { onMouseOver, onMouseOut }
}

const getQMConfig = ({ depth, interactive, offsetX, offsetY }: ObjectConfig) => ({
	depth, interactive, offsetX, offsetY, scaling: 0.9, spriteID: 'overview-questionmark',
})

const levelIcons = [
	'h-1', 'e-1', 'l-1', 'l-2', 'o-1', 'o-2', 's-1', 's-2', 'i-1', 'e-3', '!-1', 'y-1', 'e-4', 'a-1', 'h-2', '!-2',
]

const levelMapping = {
	'h-1': LEVELS[0],
	'e-1': LEVELS[1],
	'l-1': LEVELS[2],
	'l-2': LEVELS[4],
	'o-1': LEVELS[5],
	'o-2': LEVELS[6],
	's-1': LEVELS[7],
	's-2': LEVELS[8],
	'i-1': LEVELS[9],
	'e-3': LEVELS[10],
	'!-1': LEVELS[11],
	'y-1': LEVELS[12],
	'e-4': LEVELS[13],
	'a-1': LEVELS[14],
	'h-2': LEVELS[15],
	'!-2': LEVELS[16],
}

const levelOverviewConfigs: { [key: string]: ObjectConfig } = {
	'h-1': {
		depth: 11,
		interactive: true,
		offsetX: 31.125,
		offsetY: 90,
		spriteID: 'h-1',
	},
	'e-1': {
		depth: 11,
		interactive: true,
		offsetX: 36,
		offsetY: 70,
		spriteID: 'e-1',
	},
	'l-1': {
		depth: 11,
		interactive: true,
		offsetX: 54.953125,
		offsetY: 76.9583333352573,
		spriteID: 'l-1',
	},
	'l-2': {
		depth: 11,
		interactive: true,
		offsetX: 65.59765625,
		offsetY: 96.61979166908217,
		spriteID: 'l-2',
	},
	'o-1': {
		depth: 11,
		interactive: true,
		offsetX: 96.1640625,
		offsetY: 89.58854166890639,
		spriteID: 'o-1',
	},
	'o-2': {
		depth: 11,
		interactive: true,
		offsetX: 85.91015625,
		offsetY: 75.91666666856458,
		spriteID: 'o-2',
	},
	's-1': {
		depth: 11,
		interactive: true,
		offsetX: 59.8359375,
		offsetY: 62.24479166822279,
		spriteID: 's-1',
	},
	's-2': {
		depth: 11,
		interactive: true,
		offsetX: 26.73046875,
		offsetY: 36.20312500090508,
		spriteID: 's-2',
	},
	'i-1': {
		depth: 11,
		interactive: true,
		offsetX: 41.0859375,
		offsetY: 23.442708333919404,
		spriteID: 'h-1',
	},
	'e-3': {
		depth: 11,
		interactive: true,
		offsetX: 7.589843750000003,
		offsetY: 23.182291667246227,
		spriteID: 'e-3',
	},
	'!-1': {
		depth: 11,
		interactive: true,
		offsetX: 22.042968750000003,
		offsetY: 4.562500000114065,
		spriteID: '!-1',
	},
	'y-1': {
		depth: 11,
		interactive: true,
		offsetX: 41.0859375,
		offsetY: 4.432291666777477,
		spriteID: 'y-1',
	},
	'e-4': {
		depth: 11,
		interactive: true,
		offsetX: 55.5390625,
		offsetY: 36.33333333424167,
		spriteID: 'e-3',
	},
	'a-1': {
		depth: 11,
		interactive: true,
		offsetX: 74.58203125,
		offsetY: 16.802083333753384,
		spriteID: 'a-1',
	},
	'h-2': {
		depth: 11,
		interactive: true,
		offsetX: 89.03515625,
		offsetY: 4.302083333440885,
		spriteID: 'h-2',
	},
	'!-2': {
		depth: 11,
		interactive: true,
		offsetX: 93.91796875,
		offsetY: 29.302083334065887,
		spriteID: '!-2',
	},
	'ok-button': {
		depth: 11,
		interactive: true,
		offsetX: 62,
		offsetY: 5.9,
		spriteID: 'overview-ok',
	},
}

// this.phaser.input.on('drag', (_pointer, gameObject, dragX: number, dragY: number) => {
// 	gameObject.x = dragX
// 	gameObject.y = dragY
// })
// this.phaser.input.on('dragend', (_pointer, gameObject) => {
// 	console.log(gameObject.x / 1024, gameObject.y / 768)
// })
// levelButton.addListener('mousemove', () => console.log(levelButton.x, levelButton.y))
