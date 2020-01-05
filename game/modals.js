window.modalVisible = null;

let Modal = {
	spawn: function(phaser, key, dismissCallback) {
		this.phaser = phaser;
		this.key = key;
		if (MODALS_CONF[key] !== undefined) {
			this.mode = MODALS_CONF[key].mode;
		}
		this.dismissCallback = dismissCallback;
		this.render();
	},

	// Open for custom usage
	afterRender: function(){},
	afterHide: function(){},

	mode: null,
	isVisible: false,
	modalParts: [],

	render: function() {
		if (this.isVisible) { return }

		if (window.modalVisible !== null) {
			console.error('Error: trying to open a new popup "' + this.key +
				'" when popup "' + window.modalVisible + '" is still open!');
			window.modalVisible.hide();
		}

		window.modalVisible = this;
		this.isVisible = true;

		this.renderBackground();
		this.renderButtons();

		this.afterRender();
	},

	renderBackground: function() {
		if (this.mode === 'html') {
			this.modalEl = document.getElementById(this.key + "_modal");
			let newClass = this.modalEl.className + ' active';
			this.modalEl.className = newClass;
			return;
		}
		let spritesheetId = this.key + '_ss';
		let animId = this.key + '_anim';

		this.phaser.anims.create({
			key: animId,
			frames: this.phaser.anims.generateFrameNames(spritesheetId),
			frameRate: MODALS_CONF[this.key].frameRate,
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
		if (this.mode === 'html') {
			let buttonName = MODALS_CONF[this.key].buttons[0];
			let dismissBtn = this.modalEl.querySelector('.' + buttonName);
			dismissBtn.addEventListener(
				'click',
				this.dismissHandler.bind(this),
				{ once: true }
			);
		}
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
		if (this.mode === 'html') {
			let newClass = this.modalEl.className.replace('active', '');
			this.modalEl.className = newClass;
		}
		this.isVisible = false;
		window.modalVisible = null;

		this.afterHide();
	}
}

Modals = {};

window.initModals = function() {
	// Win modal
	let LevelCompleteModal = Object.create(Modal);
	LevelCompleteModal.spawn = function(phaser, levelName, dismissCallback) {
		this.phaser = phaser;
		this.levelName = levelName;
		this.dismissCallback = dismissCallback;
		this.render();
	};
	LevelCompleteModal.key = 'levelcomplete';
	LevelCompleteModal.mode = MODALS_CONF[LevelCompleteModal.key].mode;
	LevelCompleteModal.renderButtons = function() {
		this.timer = setTimeout(function() {
			let againQuery = '.prevButton';
			let againButton = this.modalEl.querySelector(againQuery);
			againButton.addEventListener('click', this.dismissHandler.bind(this), { once: true });

			this.nextHandler = function(e) {
				this.hide();
				window.game.scene.stop(this.levelName);
				let nextLevel = LEVELS[LEVELS.indexOf(this.levelName) + 1];
				if (nextLevel === undefined) {
					console.error("Trying to start undefined level");
				}
				window.game.scene.start(nextLevel);
			}.bind(this);

			let nextQuery = '.nextButton';
			let nextButton = this.modalEl.querySelector(nextQuery);
			nextButton.addEventListener('click', this.nextHandler, { once: true });

			againButton.className = againButton.className + ' active';
			nextButton.className = nextButton.className + ' active';
		}.bind(this), VICTORY_TIMEOUT);
	}
	LevelCompleteModal.afterHide = function(){
		let btns = document.querySelector('.prevButton, .nextButton');
		btns.className = btns.className.replace('active', '');
	};
	Modals.LevelCompleteModal = LevelCompleteModal;

	let FailModal = Object.create(Modal);
	FailModal.key = 'fail';
	FailModal.mode = MODALS_CONF[FailModal.key].mode;
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
		this.mode = MODALS_CONF[key].mode;
		this.dismissCallback = dismissCallback;
		this.render();
	}
	// Prevent interaction until timeout finishes
	EventModal.renderButtons = function() {
		this.timer = setTimeout(function(e) {
			let zone = this.phaser.add.zone(0, 0, window.gameWidth, window.gameHeight);
			zone.setOrigin(0, 0);
			zone.setInteractive();
			zone.on('pointerdown', this.dismissHandler.bind(this));
			console.log(zone);
			this.modalParts.push(zone);
		}.bind(this), this.timeout);
	}
	Modals.EventModal = EventModal;
}
