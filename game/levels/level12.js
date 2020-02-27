Level12 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level12',

	objects: COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixles',
	]),
	modals: COMMON_MODALS,

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() {
		Utils.preloadLevel(this);
		Utils.loadSpritesheet(this, 'background12');
	},

	create: function ()
	{
		const goalPath = ['0,200', '100,200', '20,20', '0,20', '0,200'];
		const levelConfig = {
			goalPath: goalPath,
			initPosition: {
				orientation: 90,
				nodeLocation: '120,50',
			},
			maxCommands: 5,
			levelName: this.levelName,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_DEGREES,
			pixleSize: 0.002514,
			spaceType: TYPE_SPACE_PIXLES,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
		let interPhaser = window.ossieGame.interPhaser;
	}
});
