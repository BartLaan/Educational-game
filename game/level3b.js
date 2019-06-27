window.level1 = new Phaser.Class({

	Extends: Phaser.Scene,

	objects: COMMON_OBJECTS.concat([
		'background3',
		'draailinks',
		'draairechts',
		'herhaal',
		'levelcount',
		'opnieuw',
		'player',
		'slash',
		'stap',
		'vraagteken',
	]),

	initialize: function level3b ()
	{
		console.log('initialize');
		Phaser.Scene.call(this, { key: 'level3b' });
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
			background: 'background3',
			goalPosition: '4,1',
			initPosition: {
				orientation: 'east',
				nodeLocation: '0,5',
			},
			instruction: 'instruction3b',
			maxCommands: 10,
			levelName: 'level3b',
			nextLevelName: 'level3c',
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
