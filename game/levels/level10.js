Level10 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level10',

	objects: COMMON_OBJECTS.concat([
		'if_padlinks',
		'if_padrechts',
		'if_padvooruit',
		'else',
		'for_till',
		'for_x',
		'turndegrees',
	]),

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() { Utils.preloadLevel(this) },

	create: function ()
	{
		const gameboard = [
			[0,0,1,1,1,0,1,1,1],
			[1,1,1,0,1,1,1,0,2],
			[1,0,0,0,0,0,0,0,0],
			[1,1,1,1,1,1,1,1,1],
			[0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1],
		];
		const nodes = Utils.boardToNodes(gameboard, TYPE_ORIENTATION_DEGREES);
		const levelConfig = {
			goalPosition: '8,1',
			initPosition: {
				orientation: '90',
				nodeLocation: '0,5',
			},
			maxCommands: 10,
			levelName: this.levelName,
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_DEGREES,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
