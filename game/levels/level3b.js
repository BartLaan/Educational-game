Level3b = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level3b',

	objects: COMMON_OBJECTS.concat([
		'for',
		'turnleft',
		'turnright',
	]),

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() { Utils.preloadLevel(this) },

	create: function ()
	{
		const gameboard = [
			[0,0,0,0,1,1,0,0,0],
			[0,0,0,1,2,0,0,0,0],
			[0,0,1,1,0,0,0,0,0],
			[0,1,1,0,0,0,0,0,0],
			[1,1,0,0,0,0,0,0,0],
			[1,0,0,0,0,0,0,0,0],
		];
		const nodes = Utils.boardToNodes(gameboard);
		const levelConfig = {
			goalPosition: '4,1',
			initPosition: {
				orientation: 'east',
				nodeLocation: '0,5',
			},
			maxCommands: 10,
			levelName: this.levelName,
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);

		let interPhaser = window.ossieGame.interPhaser;
		let forCounter = 0;
		let goal = false;
		// Special handling of this level so we transition upon goal condition, namely:
		// player is past question mark and had more than 7 for-loops
		interPhaser.onCommandExecute = function(objectRef) {
			InterPhaser.prototype.onCommandExecute.bind(interPhaser)(objectRef);
			if (objectRef.indexOf('step') > -1, window.ossieGame.isOnGoal()) {
				goal = true;
			}

			if (objectRef.indexOf('for') > -1) {
				forCounter += 1;
				if (goal && forCounter > 7) {
					window.ossieGame.phaserHandler(PHASER_STACK_RESET);
					window.game.scene.stop('level3b');
					window.game.scene.start('level3c');
				}
			}
		}
		interPhaser.fail = function() {
			InterPhaser.prototype.fail.bind(interPhaser)();
			goal = false;
			forCounter = 0;
		}
	}
});
