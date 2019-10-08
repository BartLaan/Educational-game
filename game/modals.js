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

		// this.backgroundEl.style.display = 'block'; // should not be needed
		this.dismissEl.style.display = 'block';
		this.modalEl.style.display = 'block';

		this.dismissHandler = function() {
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
		this.dismissHandler = undefined;

		window.modalVisible = null;

		if (this.callback !== undefined) {
			this.callback();
		}
		this.afterHide();
	}
}

Modals = {};

let modalInit = function() {
	Modal.backgroundEl = document.getElementById('fullscreenGif');
	Modal.modalEl = document.getElementById('modal');
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

		this.timer = setTimeout(function() {
			this.backgroundEl.addEventListener('click', this.dismissHandler);
		}.bind(this), this.timeout);
	}
	EventModal.afterHide = function() {
		clearTimeout(this.timeout);
		this.backgroundEl.removeEventListener('click', this.dismissHandler);
	}
	Modals.EventModal = EventModal;
}

window.onload = modalInit;

// window.renderModal = function(imageKey, timeout) {
// 	let enableInteraction = function() {
// 		image.removeEventListener('load', enableInteraction);
//
// 		let clickElement;
// 		if (imageKey === 'intro' || imageKey === 'helloworld') {
// 			clickElement = image;
// 		} else {
// 			clickElement = document.getElementById('okButton');
// 			clickElement.style.display = 'block';
// 		}
//
// 		let onClick = function(e) {
// 			modal.style.display = 'none';
// 			clickElement.style.display = 'none';
// 			clickElement.removeEventListener('click', onClick);
// 			window.modalVisible = false;
// 			if (callback !== undefined) {
// 				callback();
// 			}
// 		}
// 		clickElement.addEventListener('click', onClick);
// 	}
//
// 	let modal = document.getElementById('modal');
// 	modal.style.display = 'block';
// 	let image = document.getElementById('fullscreenGif');
// 	image.setAttribute('src', SPRITE_PATHS[imageKey]);
//
// 	if (timeout !== undefined) {
// 		setTimeout(enableInteraction, timeout);
// 	} else if (image.complete) {
// 		enableInteraction();
// 	} else {
// 		image.addEventListener('load', enableInteraction);
// 	}
// }
