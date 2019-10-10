window.modalVisible = null;

let Modal = {
	spawn: function(key, dismissCallback) {
		this.key = key;
		this.dismissCallback = dismissCallback;
		this.render();
	},

	// [Start] These should be set after window load
	backgroundEL: null,
	modalEl: null,
	dismissEl: null, // e.g. ok button or play again
	// [End]

	// Open for custom usage
	afterRender: function(){},
	afterHide: function(){},

	isVisible: false,

	render: function() {
		if (this.isVisible) { return }

		if (window.modalVisible !== null) {
			console.error('Error: trying to open a new popup "' + this.key +
				'" when popup "' + window.modalVisible + '" is still open!');
		}

		window.modalVisible = this;
		this.isVisible = true;
		if (SPRITE_PATHS[this.key] !== undefined) {
			this.backgroundEl.setAttribute('src', SPRITE_PATHS[this.key]);
		}

		this.dismissEl.style.display = 'block';
		this.modalEl.style.display = 'block';

		this.dismissHandler = function(e) {
			this.hide();
			if (this.dismissCallback) {
				this.dismissCallback();
			}
		}.bind(this);
		this.dismissEl.addEventListener('click', this.dismissHandler);

		this.afterRender();
	},

	hide: function() {
		if (!this.isVisible) { return }

		this.modalEl.style.display = 'none';
		this.dismissEl.style.display = 'none';
		this.dismissEl.removeEventListener('click', this.dismissHandler);
		this.isVisible = false;

		window.modalVisible = null;

		this.afterHide();
	}
}

Modals = {};

window.initModals = function() {
	Modal.backgroundEl = document.getElementById('fullscreenGif');
	Modal.modalEl = document.getElementById('modal');
	Modal.modalEl.addEventListener('mousedown', function(e) { e.preventDefault(); });
	Modal.dismissEl = document.getElementById('okButton');

	// Win modal
	let WinModal = Object.create(Modal);
	WinModal.spawn = function(levelName, dismissCallback) {
		this.levelName = levelName;
		this.dismissCallback = dismissCallback;
		this.render();
	};
	WinModal.key = 'victory';
	WinModal.nextButton = document.getElementById('nextButton');
	WinModal.dismissEl = document.getElementById('prevButton');
	WinModal.afterRender = function() {
		this.dismissEl.style.display = 'none';

		this.timer = setTimeout(function() {
			this.nextButton.style.display = 'block';
			this.dismissEl.style.display = 'block';

			this.nextHandler = function(e) {
				this.hide();
				window.game.scene.stop(this.levelName);
				let nextLevel = LEVELS[LEVELS.indexOf(this.levelName) + 1];
				if (nextLevel !== undefined) {
					window.game.scene.start(nextLevel);
				}
			}.bind(this);
			this.nextButton.addEventListener('click', this.nextHandler);

		}.bind(this), VICTORY_TIMEOUT);
	}
	WinModal.afterHide = function() {
		this.nextButton.style.display = 'none';
		this.nextButton.removeEventListener('click', this.nextHandler);
	}
	Modals.WinModal = WinModal;

	let FailModal = Object.create(Modal);
	FailModal.key = 'fail';
	FailModal.spawn = FailModal.render;
	Modals.FailModal = FailModal;

	// Event modal
	let EventModal = Object.create(Modal);
	EventModal.spawn = function(key, timeout, dismissCallback) {
		this.timeout = timeout;
		this.key = key;
		this.dismissCallback = dismissCallback;
		this.render();
	}
	// Prevent interaction until timeout finishes
	EventModal.afterRender = function() {
		this.dismissEl.style.display = 'none';
		this.dismissEl.removeEventListener('click', this.dismissHandler);

		this.timer = setTimeout(function(e) {
			this.backgroundEl.addEventListener('click', this.dismissHandler);
		}.bind(this), this.timeout);
	}
	EventModal.afterHide = function() {
		clearTimeout(this.timeout);
		this.backgroundEl.removeEventListener('click', this.dismissHandler);
	}
	Modals.EventModal = EventModal;
}
