Level3a = new Phaser.Class({

	Extends: Phaser.Scene,

	objects: COMMON_OBJECTS.concat([
		'background3',
		'draailinks',
		'draairechts',
		'instruction3a',
		'levelcount',
		'opnieuw',
		'slash',
		'stap',
	]),

	initialize: function level3a ()
	{
		console.log('initialize');
		Phaser.Scene.call(this, { key: 'level3a' });
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
			[0,0,0,0,1,1,0,0,0],
			[0,0,0,1,1,0,0,0,0],
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
			levelName: 'level3a',
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
