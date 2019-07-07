Level1 = new Phaser.Class({

	Extends: Phaser.Scene,

	objects: COMMON_OBJECTS.concat([
		'background1',
		'instruction1',
		'opnieuw',
		'player',
		'slash',
		'stap',
	]),

	initialize: function level1 ()
	{
		Phaser.Scene.call(this, { key: 'level1' });
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
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,2,1]
		];
		const nodes = Utils.boardToNodes(gameboard);
		const levelConfig = {
			goalPosition: '7,5',
			initPosition: {
				orientation: 'east',
				nodeLocation: '0,5',
			},
			maxCommands: 10,
			levelName: 'level1',
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
