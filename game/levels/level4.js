Level4 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level4',

	objects: COMMON_OBJECTS.concat([
		'step',
		'for_x',
		'turnleft',
		'turnright',
	]),
	modals: COMMON_MODALS,

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() { Utils.preloadLevel(this) },

	create: function ()
	{
		const gameboard = [
			[0,0,0,0,0,0,1,1,1],
			[0,0,0,0,1,1,1,0,1],
			[0,0,0,0,1,0,0,0,1],
			[0,0,1,1,1,0,0,0,2],
			[0,0,1,0,0,0,0,0,1],
			[1,1,1,0,0,0,0,0,0],
		];
		const [nodes, goalPosition] = Utils.boardToNodes(gameboard);
		const levelConfig = {
			goalPosition: goalPosition,
			initPosition: {
				orientation: 'east',
				nodeLocation: '0,5',
			},
			maxCommands: 19,
			levelName: this.levelName,
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
