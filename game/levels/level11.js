Level11 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level11',

	objects: COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixels',
	]),

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() {
		Utils.preloadLevel(this);
		this.load.spritesheet(
			"background11_ss",
			"assets/backgrounds/background-11.png",
			{frameHeight: 768, frameWidth: 1024}
		);

	},

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

		let newBackground = interPhaser.phaser.add.sprite(0, 0, 'background11_ss', 0);
		interPhaser.objects.background.destroy();
		interPhaser.objects.background = newBackground;
		newBackground.setOrigin(0, 0);
		newBackground.name = 'background';
		newBackground.setDisplaySize(interPhaser.width, interPhaser.height);

		this.anims.create({
			key: 'background11_anim',
			frames: this.anims.generateFrameNames("background11_ss"),
			frameRate: 2,
		});

		interPhaser.afterIntro = function() {
			newBackground.play('background11_anim');
		}
	}
});
