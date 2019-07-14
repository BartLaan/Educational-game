Level2 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level2',

	objects: COMMON_OBJECTS.concat([
		'turnleft',
		'turnright',
	]),

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() { Utils.preloadLevel(this) },

	create: function ()
	{
		console.log('create');
		const gameboard = [
			[0,0,0,0,0,0,0,1,0],
			[0,0,0,0,0,1,1,2,0],
			[0,1,1,1,0,1,0,0,0],
			[0,1,0,1,1,1,0,0,0],
			[0,1,0,0,0,0,0,0,0],
			[1,1,0,0,0,0,0,0,0]
		];
		const nodes = Utils.boardToNodes(gameboard);
		const levelConfig = {
			goalPosition: '7,1',
			initPosition: {
				orientation: 'east',
				nodeLocation: '0,5',
			},
			maxCommands: 19,
			levelCount: 2,
			levelName: this.levelName,
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
