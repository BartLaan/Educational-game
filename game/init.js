window.init = function() {
	window.initModals();
	let minHeight = Math.min(window.innerHeight, window.innerWidth / WH_RATIO);
	let widthThatWillFit = Math.min(window.innerWidth, window.innerHeight * WH_RATIO);
	let modalEl = document.getElementById('modal');
	modalEl.style.width = widthThatWillFit;
	modalEl.style.height = widthThatWillFit / WH_RATIO;

	var config = {
		type: Phaser.WEBGL,
		parent: 'phaser-example',
		width: widthThatWillFit,
		height: widthThatWillFit / WH_RATIO,
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
			// Level12,
			// Level13,
			// Level14,
			// Level15,
			// Level16,
		]
	};

	function runLevelFromUrl() {
		let level = location.hash.replace('#', '');
		if (level === "") {
			return;
		}
		// Phaser runs the first scene in the config array, so in order to change the loaded level,
		// we find the levelIndex and move it to the front of the array
		let levelIndex = LEVELS.indexOf(level);
		if (levelIndex === undefined) {
			return console.log('Could not find level "' + level + '"');
		}
		console.log('Loading level', level, 'from url');
		let scene = config.scene[levelIndex];
		config.scene.splice(levelIndex, 1);
		config.scene.unshift(scene);
	}
	runLevelFromUrl();

	addEventListener("hashchange", function(){
		let nextLevel = window.location.hash.replace('#', '');
		if (nextLevel === window.activeLevel || LEVELS.indexOf(nextLevel) === undefined) {
			return;
		}
		window.game.scene.stop(window.activeLevel);
		window.game.scene.start(nextLevel);
	})

	// make phaser game object
	window.game = new Phaser.Game(config);
	window.debug = false;
}

window.selectLevel = function(nextLevel) {
	if (nextLevel === undefined) {
		let levelName = window.prompt("Select level:");
		let nextLevel = 'level' + levelName;
	}
	if (LEVELS.indexOf(nextLevel) !== undefined) {
		console.log('Starting level "' + nextLevel + '"');
		window.game.scene.stop('intro');
		window.game.scene.stop('level1');
		setTimeout(function() {
			window.game.scene.start(nextLevel);
		}, 100)
	} else {
		console.log('Could not find level "' + nextLevel + '"');
	}
}
window.init();
