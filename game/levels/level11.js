Level10 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level11',

	objects: COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixels',
	]),

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() { Utils.preloadLevel(this) },

	create: function ()
	{
		const goalPath = ['0,50', '20,50', '20,20', '0,20', '0,50'];
		const levelConfig = {
			goalPath: goalPath,
			initPosition: {
				orientation: 90,
				nodeLocation: '0,50',
			},
			maxCommands: 5,
			levelName: this.levelName,
			objects: this.objects,
			orientationType: TYPE_ORIENTATION_DEGREES,
			spaceType: TYPE_SPACE_PIXLES,
		}

		window.ossieGame = new OssieGame(levelConfig, this);
		let interPhaser = window.ossieGame.interPhaser;
		let callback = function() {
			window.game.scene.stop(this.levelName);
			window.game.scene.start(LEVELS[LEVELS.indexOf(this.levelName) + 1]);
		}.bind(this);

		let intermezzoModal = Object.create(Modals.EventModal);
		interPhaser.win = function() {
			console.log('lose :()');
			intermezzoModal.spawn('helloworld', 3000, callback);
		}
	}
});
