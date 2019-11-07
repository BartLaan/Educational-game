General notes:
	- The PIXLE unit (note the intentional misspelling) is used as the smallest unit
		and its size is arbitrarily defined

Naming conventions:
	- snake_case for filenames
	- camelCase for variable names and object properties
	- kebab-case for sprite keys (paths.js)
	- PascalCase for global/window objects (with functions)
	- UPPERCASE for global/window constants and objects with constants
	exceptions:
		- snake_case for specific game objects in ph_config.js/OBJECT_CONF

Code overview:
	- index.html loads init.js
	- init.js loads and configures Phaser
	- Phaser loads levels (level<x>.js)
	- levels load ossieGame.js (and sometimes do some custom stuff)
	- ossieGame.js does:
		- load inter_phaser.js
		- manage the internal, non-phaser representation of the gamestate.
			This primarily comes down to the game's "stack"

	- interPhaser does:
		- manage Phaser
		- setup all Phaser objects, event handlers and logic common to different
			levels
		- manage the Phaser objects
		- manage its own representation of the game's "stack" and converts it to the
			ossieGame version
		- interface with ossieGame using the event handler passed down from
			ossieGame.init and event codes specified in constants.js
		- open modals (but should really be done in ossieGame.js)

	- utils.js does:
		- provide utils for things that I'd rather keep together and/or away from
			other pieces of codes

	- ph_config.js/paths.js/constants.js do:
		- store data that should actually be in json files ¯\_(ツ)_/¯
