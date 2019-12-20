window.modalVisible = null;

let Modal = {
	spawn: function(phaser, key, dismissCallback) {
		this.phaser = phaser;
		this.key = key;
		this.dismissCallback = dismissCallback;
		this.render();
	},

	// Open for custom usage
	afterRender: function(){},
	afterHide: function(){},

	backgroundFrameRate: 1,
	isVisible: false,
	modalParts: [],

	render: function() {
		if (this.isVisible) { return }

		if (window.modalVisible !== null) {
			console.error('Error: trying to open a new popup "' + this.key +
				'" when popup "' + window.modalVisible + '" is still open!');
		}

		window.modalVisible = this;
		this.isVisible = true;

		this.renderBackground();
		this.renderButtons();

		this.afterRender();
	},

	renderBackground: function() {
		let spritesheetId = this.key + '_ss';
		let animId = this.key + '_anim';

		this.phaser.anims.create({
			key: animId,
			frames: this.phaser.anims.generateFrameNames(spritesheetId),
			frameRate: 5,
		});
		this.background = this.phaser.add.sprite(0, 0, spritesheetId, 1);
		this.background.setDepth(10);
		this.background.setOrigin(0, 0);
		this.background.setInteractive();
		this.background.setDisplaySize(window.gameWidth, window.gameHeight);
		this.background.play(animId);
		this.modalParts.push(this.background);
	},

	renderButtons: function() {
		let dismissBtn = Utils.setGameObject(this.phaser, OBJECT_CONF['okButton'], 'okButton');
		dismissBtn.on('pointerdown', this.dismissHandler.bind(this));
		this.modalParts.push(dismissBtn);
	},

	dismissHandler: function(e) {
		this.hide();
		if (this.dismissCallback) {
			this.dismissCallback();
		}
	},

	hide: function() {
		if (!this.isVisible) { return }

		for (let object of this.modalParts) {
			object.destroy();
		}
		this.isVisible = false;
		window.modalVisible = null;

		this.afterHide();
	}
}

Modals = {};

window.initModals = function() {
	// Win modal
	let WinModal = Object.create(Modal);
	WinModal.spawn = function(phaser, levelName, dismissCallback) {
		this.phaser = phaser;
		this.levelName = levelName;
		this.dismissCallback = dismissCallback;
		this.render();
	};
	WinModal.key = 'victory';
	WinModal.renderButtons = function() {
		this.timer = setTimeout(function() {
			let againButton = this.Utils.setGameObject(OBJECT_CONF['againButton']);
			againButton.on('pointerdown', this.dismissHandler.bind(this));
			this.modalParts.push(againButton);

			let nextButton = this.Utils.setGameObject(OBJECT_CONF['nextButton']);
			this.modalParts.push(nextButton);

			this.nextHandler = function(e) {
				this.hide();
				window.game.scene.stop(this.levelName);
				let nextLevel = LEVELS[LEVELS.indexOf(this.levelName) + 1];
				try {
					window.game.scene.start(nextLevel);
				} catch (err) {
					console.error("Probably trying to start undefined level. Error:", err);
				}
			}.bind(this);
			this.nextButton.on('pointerdown', this.nextHandler);

		}.bind(this), VICTORY_TIMEOUT);
	}
	Modals.WinModal = WinModal;

	let FailModal = Object.create(Modal);
	FailModal.key = 'fail';
	FailModal.spawn = function(phaser){
		this.phaser = phaser;
		this.render();
	}
	Modals.FailModal = FailModal;

	// Event modal
	let EventModal = Object.create(Modal);
	EventModal.spawn = function(phaser, key, timeout, dismissCallback) {
		this.phaser = phaser;
		this.timeout = timeout;
		this.key = key;
		this.dismissCallback = dismissCallback;
		this.render();
	}
	// Prevent interaction until timeout finishes
	EventModal.renderButtons = function() {
		this.timer = setTimeout(function(e) {
			this.background.on('pointerdown', this.dismissHandler.bind(this));
		}.bind(this), this.timeout);
	}
	Modals.EventModal = EventModal;
}
