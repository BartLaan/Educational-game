window.level1 = new Phaser.Class({

	Extends: Phaser.Scene,

	objects: COMMON_OBJECTS.concat([
		'background1',
		'instruction1',
		'levelcount',
		'opnieuw',
		'player',
		'slash',
		'stap',
		'vraagteken',
	]),

	initialize: function level1 ()
	{
		console.log('initialize');
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
			background: 'background1',
			goalPosition: '7,5',
			initPosition: {
				orientation: 'east',
				nodeLocation: '0,5',
			},
			instruction: 'instruction1',
			maxCommands: 10,
			levelName: 'level1',
			nextLevelName: 'level2',
			nodes: nodes,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_CARDINALS,
			spaceType: TYPE_SPACE_GRID,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
	}
});
