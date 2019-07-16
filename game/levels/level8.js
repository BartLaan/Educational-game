Level8 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level8',

	objects: COMMON_OBJECTS.concat([
		'if_padlinks',
		'if_padrechts',
		'for_till',
		'for_x',
		'turnDegrees',
	]),

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() { Utils.preloadLevel(this) },

	create: function ()
	{
		const gameboard = [
			[1,1,1,1,1,1,1,1,1],
			[0,0,1,0,0,0,0,0,1],
			[0,0,1,0,0,0,1,0,1],
			[0,0,1,1,1,1,1,0,1],
			[0,0,0,0,0,0,0,0,1],
			[2,1,1,1,1,1,1,1,1],
		];
		const nodes = Utils.boardToNodes(gameboard, TYPE_ORIENTATION_DEGREES);
		const levelConfig = {
			goalPosition: '0,5',
			initPosition: {
				orientation: '90',
				nodeLocation: '6,2',
			},
			maxCommands: 6,
			levelName: this.levelName,
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_DEGREES,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
