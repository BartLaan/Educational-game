var level2 = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

	function level2 ()
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
		let myself = this;

		let gameboard = [
			[0,0,0,0,0,0,0,2,0],
			[0,0,0,0,0,1,1,1,0],
			[0,1,1,1,0,1,0,0,0],
			[0,1,0,1,1,1,0,0,0],
			[0,1,0,0,0,0,0,0,0],
			[1,1,0,0,0,0,0,0,0]
		];
		let nodes = Utils.boardToNodes(gameboard);
		let initPosition = '0,5';
		let levelConfig = {
			background: 'background',
			nodes: nodes,
			initPosition: '0,5',
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
			]
		}
		let interface = new PhaserInterface(this, levelconfig);
	}
});
