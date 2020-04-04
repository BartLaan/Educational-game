import { LEVELS } from './constants/objects'
import { BASE_SIZE_X, WH_RATIO } from './constants/sizes'
import Level1 from './levels/level1'
import Level10 from './levels/level10'
import Level11 from './levels/level11'
import Level12 from './levels/level12'
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

export { }

declare global {
	interface Window {
		activeLevel: string
		debug?: boolean
		init() : void
		ossieGame: OssieGame
		game: any
		gameHeight: number
		gameScale: number
		gameWidth: number
		selectLevel(levelName: string): void
	}
}

window.selectLevel = function(nextLevel) {
	if (nextLevel === undefined) {
		let levelName = window.prompt("Select level:")
		nextLevel = 'level' + levelName
	}
	if (LEVELS.indexOf(nextLevel) !== undefined) {
		console.log('Starting level "' + nextLevel + '"')
		window.game.scene.stop('intro')
		window.game.scene.stop('level1')
		setTimeout(function() {
			window.game.scene.start(nextLevel)
		}, 100)
	} else {
		console.log('Could not find level "' + nextLevel + '"')
	}
}

let widthThatWillFit = Math.min(window.innerWidth, window.innerHeight * WH_RATIO)
window.gameWidth = widthThatWillFit
window.gameHeight = widthThatWillFit / WH_RATIO
window.gameScale = widthThatWillFit / BASE_SIZE_X

// let modalEl = document.getElementById('modal')
// modalEl.style.width = widthThatWillFit
// modalEl.style.height = widthThatWillFit / WH_RATIO

var config = {
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
		// Level13,
		// Level14,
		// Level15,
		// Level16,
	]
}

function runLevelFromUrl() {
	let level = location.hash.replace('#', '')
	if (level === "") {
		return
	}
	// Phaser runs the first scene in the config array, so in order to change the loaded level,
	// we find the levelIndex and move it to the front of the array
	let levelIndex = LEVELS.indexOf(level)
	if (levelIndex === undefined) {
		return console.log('Could not find level "' + level + '"')
	}
	console.log('Loading level', level, 'from url')
	let scene = config.scene[levelIndex]
	config.scene.splice(levelIndex, 1)
	config.scene.unshift(scene)
}
runLevelFromUrl()

addEventListener("hashchange", function(){
	let nextLevel = window.location.hash.replace('#', '')
	if (nextLevel === window.activeLevel || LEVELS.indexOf(nextLevel) === undefined) {
		return
	}
	window.game.scene.stop(window.activeLevel)
	window.game.scene.start(nextLevel)
})

// make phaser game object
window.game = new Phaser.Game(config)
window.debug = false
