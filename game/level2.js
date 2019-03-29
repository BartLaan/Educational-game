var level2 = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize: function level2 ()
	{
		Phaser.Scene.call(this, { key: 'level2' });
	},

	preload: function ()
	{
		let spriteArray = [
			'background',
			'draailinks',
			'draailinks-crnt',
			'draailinks-hover',
			'draairechts',
			'draairechts-crnt',
			'draairechts-hover',
			'vraagteken',

		];
		PhaserUtils.loadSprites(this, spriteArray);
	},

	create: function ()
	{
		const gameboard = [
			[0,0,0,0,0,0,0,2,0],
			[0,0,0,0,0,1,1,1,0],
			[0,1,1,1,0,1,0,0,0],
			[0,1,0,1,1,1,0,0,0],
			[0,1,0,0,0,0,0,0,0],
			[1,1,0,0,0,0,0,0,0]
		];
		const nodes = Utils.boardToNodes(gameboard);
		const levelConfig = {
			background: 'background',
			goalPosition: '8,0',
			initPosition: {
				direction: 'east',
				nodeLocation: '0,5',
			},
			levelCount: 2,
			levelName: 'level2',
			nextLevelName: 'level3',
			nodes: nodes,
			objects: [
				'draailinks',
				'draairechts',
				'levelcount',
				'nine',
				'one'
				'open',
				'opnieuw',
				'player',
				'slash',
				'sluit',
				'stap',
				'vraagteken',
			],
			orientationType: 'cardinals',
			spaceType: 'grid',
		}
		let ossieGame = new OssieGame(levelConfig, this);
	}
});
