import { LEVELS } from './constants/objects'
import { BASE_SIZE_X, WH_RATIO } from './constants/sizes'
import Level1 from './levels/level1'
import Level10 from './levels/level10'
import Level11 from './levels/level11'
import Level12 from './levels/level12'
import Level13 from './levels/level13'
import Level14 from './levels/level14'
import Level15 from './levels/level15'
import Level16 from './levels/level16'
import Level2 from './levels/level2'
import Level3a from './levels/level3a'
import Level3b from './levels/level3b'
import Level3c from './levels/level3c'
import Level4 from './levels/level4'
import Level5 from './levels/level5'
import Level6 from './levels/level6'
import Level7 from './levels/level7'
import Level8 from './levels/level8'
import Level9 from './levels/level9'
import OssieGame from './ossie_game'
import { getCookie } from './utils/cookies'

export { }

declare global {
	interface Window {
		activeLevel: string
		debug?: boolean
		game: any
		gameHeight: number
		gameScale: number
		gameWidth: number
		init(): void
		ossieGame: OssieGame
		selectLevel(levelName: string): void
	}
}

window.selectLevel = (nextLevel: string) => {
	if (nextLevel === undefined) {
		const levelName = window.prompt('Select level:')
		nextLevel = 'level' + levelName
	}
	if (LEVELS.indexOf(nextLevel) === undefined) {
		console.log(`Could not find level "${nextLevel}"`)
	}

	console.log(`Starting level "${nextLevel}"`)
	window.game.scene.stop('intro')
	window.game.scene.stop('level1')
	setTimeout(() => {
		window.game.scene.start(nextLevel)
	}, 100)
}

const widthThatWillFit = Math.min(window.innerWidth, window.innerHeight * WH_RATIO)
window.gameWidth = widthThatWillFit
window.gameHeight = widthThatWillFit / WH_RATIO
window.gameScale = widthThatWillFit / BASE_SIZE_X

let called = false
document.addEventListener('readystatechange', () => {
	if (called || document.readyState === 'loading') { return }

	const modalContainer = document.getElementById('modalContainer')!
	modalContainer.style.width = `${widthThatWillFit}px`
	modalContainer.style.height = `${widthThatWillFit / WH_RATIO}px`
	const inputPopupContainer = document.getElementById('inputPopup')!
	inputPopupContainer.style.width = `${widthThatWillFit}px`
	inputPopupContainer.style.height = `${widthThatWillFit / WH_RATIO}px`

	called = true
})

const config = {
	type: Phaser.WEBGL,
	parent: 'phaser-example',
	width: window.gameWidth,
	height: window.gameHeight,
	transparent: true,
	// scale: 'SHOW_ALL',
	// orientation: 'LANDSCAPE',
	scene: [
		Level1,
		Level2,
		Level3a,
		Level3b,
		Level3c,
		Level4,
		Level5,
		Level6,
		Level7,
		Level8,
		Level9,
		Level10,
		Level11,
		Level12,
		Level13,
		Level14,
		Level15,
		Level16,
	],
}

function pickLevel() {
	const hashLevel = location.hash.replace('#', '')
	const progress = parseInt(getCookie('level_progress') || '-1', 10)
	const progressLevel = progress ? LEVELS[progress + 1] || '' : ''
	const level = hashLevel !== '' ? hashLevel : progressLevel

	if (level === '') {
		return
	}

	// Phaser runs the first scene in the config array, so in order to change the loaded level,
	// we find the levelIndex and move it to the front of the array
	const levelIndex = LEVELS.indexOf(level)
	if (levelIndex === undefined) {
		return console.error(`Could not find level "${level}"`)
	}
	console.log('Loading level', level, 'from url')
	const scene = config.scene[levelIndex]
	config.scene.splice(levelIndex, 1)
	config.scene.unshift(scene)
}
pickLevel()

addEventListener('hashchange', () => {
	const nextLevel = window.location.hash.replace('#', '')
	if (nextLevel === window.activeLevel || LEVELS.indexOf(nextLevel) === undefined) {
		return
	}
	window.modalVisible?.hide()
	window.game.scene.stop(window.activeLevel)
	window.game.scene.start(nextLevel)
})

// make phaser game object
window.game = new Phaser.Game(config)
window.debug = false
