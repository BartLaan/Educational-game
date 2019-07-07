Level2 = new Phaser.Class({
	Extends: Phaser.Scene,

	objects: COMMON_OBJECTS.concat([
		'background2',
		'instruction2',
		'draailinks',
		'draairechts',
	]),

	initialize: function level2 ()
	{
		console.log('initialize');
		Phaser.Scene.call(this, { key: 'level2' });
	},

	preload: function ()
	{
		console.log('preload');
		Utils.loadSprites(this);
	},

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
			levelName: 'level2',
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
