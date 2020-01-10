Level11 = new Phaser.Class({
	Extends: Phaser.Scene,

	levelName: 'level11',

	objects: COMMON_OBJECTS.concat([
		'for_x',
		'turndegrees',
		'steppixles',
	]),
	modals: COMMON_MODALS.concat([
		'beforelvl11',
	]),

	initialize: function() { Utils.initializeLevel.bind(this)() },

	preload: function() {
		Utils.preloadLevel(this);
		Utils.loadSpritesheet(this, 'background11');
	},

	create: function ()
	{
		let loadLevel = function(){
			const goalPath = ['0,120', '100,120', '100,20', '0,20', '0,120'];
			const levelConfig = {
				goalPath: goalPath,
				initPosition: {
					orientation: 90,
					nodeLocation: '0,120',
				},
				maxCommands: 5,
				levelName: this.levelName,
				objects: this.objects,
				orientationType: TYPE_ORIENTATION_DEGREES,
				pixleSize: 0.001953,
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
		let modal = Object.create(Modals.EventModal);
		let timeout = 5000
		modal.spawn(this, 'beforelvl11', timeout, loadLevel.bind(this));
	}
});
