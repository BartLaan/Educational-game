import { COMMON_OBJECTS, NUMBER_COMMANDS, INIT_OBJECTS, OBJECTS_MULTIPLE } from './constants/objects'
import { SPRITE_PATHS } from './constants/paths'
import {
	BOARD_OFFSET_X,
	BOARD_OFFSET_Y,
	BOARD_STEPSIZE_X,
	BOARD_STEPSIZE_Y,
	HOVER_SCALING,
	MOVEMENT_DURATION,
	OBJECT_CONFIG,
	SCALING_FACTOR_DIV,
	STACK_AVG_CMD_SIZE,
	STACK_BRACKET_INDENT,
	STACK_BRACKET_OFFSET,
	STACK_BRACKET_SPACING,
	STACK_COMMAND_SPACING,
	STACK_ZONE_HEIGHT,
	STACK_ZONE_POS_X,
	STACK_ZONE_POS_Y,
	STACK_ZONE_WIDTH,
	WH_RATIO,
} from './constants/sizes'
import { LevelCompleteModal, Modal, FailModal } from './modals'
import { Coords, OssiePos } from './types/board'
import { LevelConfig, Space } from './types/game_config'
import { InterPhaserEvent } from './types/interphaser'
import { strToCoord } from './utils/level_setup'
import { h, isBracketObject, renderNumber, setGameObject, w, animateMovement } from './utils/phaser_objects'
import { getStackRepresentation } from './utils/stack'

type ObjectKey = string
type PhaserObject = any
export type InterPhaserHandler = (stackEvent: InterPhaserEvent, data?: any) => void

export default class InterPhaser {

	constructor(phaser: Phaser.Scene, levelConfig: LevelConfig, eventHandler: InterPhaserHandler) {
		this.phaser = phaser
		this.levelConfig = levelConfig
		this.eventHandler = eventHandler

		this.width = Math.min(window.innerWidth, window.innerHeight * WH_RATIO)
		this.height = this.width / WH_RATIO
		this.scalingFactor = this.width / SCALING_FACTOR_DIV

		this.levelConfig.objects = this.levelConfig.objects.concat(COMMON_OBJECTS)
		this.showIntro()
		this.initLevel()
	}

	// free to override
	afterCommandExecute = function(commandReference){}
	afterFail = function() {}

	// phsr object, indicating the command that the character is executing
	activeCommand: PhaserObject
	// number, offsets for the playing field/space that the avatar can move in
	boardOffsetX: number
	boardOffsetY: number
	eventHandler: InterPhaserHandler
	// height to use. callculated based on width in constructor
	height: number
	// phsr graphics. Used for debugging purposes
	graphics = null
	// object containing the level configuration set for each level
	levelConfig: LevelConfig
	// boolean, indicates whether the player has reached the maximum number of commands
	maxedOut: boolean = false
	// object with object names as keys, phaser objects/object lists as values
	objects: any
	// the phaser instance (I think it's actually a scene)
	phaser: Phaser.Scene
	// boolean, indicates the gamestate, i.e. whether the character is executing the commands
	running: boolean
	// number, factor to scale all size units by
	scalingFactor: number
	// number, indicating the stack position that the pointer is hovering over
	stackIndex: number | null
	// list of phaser objects representing the commands in the command stack
	stackObjects: any[]
	// number, indicating the size of a grid element
	stepsizeX: number
	stepsizeY: number
	// number, indicating the width of the canvas. Should be equal to window.innerWidth except when resizing
	width: number

	showIntro() {
		let instructionName = this.levelConfig.levelName.replace('level', 'instruction')
		let instructionModal = Object.create(Modal)

		// Hack: use anonymous function so that we can replace the afterIntro function after creating the InterPhaser instance. This is necessary because showIntro is called in the constructor.
		instructionModal.afterHide = function() {
			this.afterIntro()
		}.bind(this)
		instructionModal.spawn(this.phaser, instructionName)
	}
	afterIntro() {}

	initLevel() {
		this.objects = {}
		this.stackObjects = []
		if (this.levelConfig.spaceType === Space.pixles) {
			this.stepsizeX = w(this.levelConfig.pixleSize)
			this.stepsizeY = this.stepsizeX
		} else {
			this.stepsizeX = w(BOARD_STEPSIZE_X)
			this.stepsizeY = h(BOARD_STEPSIZE_Y)
		}
		this.boardOffsetX = w(BOARD_OFFSET_X)
		this.boardOffsetY = h(BOARD_OFFSET_Y)

		// Set static objects
		let backgroundName = 'background' + this.levelConfig.levelName.replace(/[A-Za-z]/g, '')
		this.objects.background = this.phaser.add.image(0, 0, backgroundName).setOrigin(0, 0)
		this.objects.background.name = 'background'
		this.objects.background.setDisplaySize(this.width, this.height)

		let maxCommands = this.levelConfig.maxCommands
		OBJECT_CONFIG.stepcount_total.spriteID = maxCommands.toString()
		this.objects.stepcount_total = setGameObject(this.phaser, OBJECT_CONFIG.stepcount_total, 'stepcount_total')

		this.setDynamicObjects()
		this.setInteractions()
	}

	setDynamicObjects() {
		let objects = this.objects

		for (let objectName of INIT_OBJECTS) {
			if (!this.hasObject(objectName)) { continue }
			let objConfig = OBJECT_CONFIG[objectName]

			// normal objects
			if (OBJECTS_MULTIPLE.indexOf(objectName) === -1) {
				objects[objectName] = setGameObject(this.phaser, objConfig, objectName)
				objects[objectName].name = objectName

			} else { // draggable commands can have multiple versions
				objects[objectName] = {}
				let objectRef = objectName + '-' + 0
				let object = setGameObject(this.phaser, objConfig, objectRef)
				object.setData('i', 0)
				objects[objectName][0] = object
			}
		}

		if (this.levelConfig.spaceType === Space.grid && this.hasObject('questionmark')) {
			let questionmarkCoords = strToCoord(this.levelConfig.goalPosition)
			objects.questionmark.x += this.boardOffsetX
			objects.questionmark.y += this.boardOffsetY
			objects.questionmark.x += this.stepsizeX * questionmarkCoords.x
			objects.questionmark.y += this.stepsizeY * questionmarkCoords.y
		}

		let me = this
		objects.execute.on('pointerdown', function(pointer) {
			if (me.running) {
				return me.abortMission()
			}
			this.setTint(0xff0000)
			if (me.stackObjects.length === 0) return

			let repr = getStackRepresentation(me.stackObjects)
			me.eventHandler(InterPhaserEvent.start, { stack: repr })
			me.running = true
		})

		objects.reset.on('pointerdown', function() {
			if (me.running) {
				me.abortMission()
			} else {
				me.resetLevel()
			}
		})

		objects.backButton.on('pointerdown', this.showIntro.bind(this))

		this.updateOssiePos(this.levelConfig.initPosition)
	}

	abortMission() {
		// Stop execution and reset player position
		this.updateOssiePos(this.levelConfig.initPosition)
		this.updateCurrentCommand()
		this.eventHandler(InterPhaserEvent.reset)
		this.running = false
	}

	resetLevel() {
		if (window.modalVisible) { return }

		console.log("restarting level")
		this.eventHandler(InterPhaserEvent.reset)
		this.activeCommand = null
		this.stackIndex = null
		this.running = false
		this.maxedOut = false

		// Lots of prior knowledge here, not really nice. Maybe move to a config, i.e. resettableObjects = []
		for (let objectName of INIT_OBJECTS) {
			if (this.objects[objectName] === undefined) { continue }
			console.log('resetting object', objectName)
			if (OBJECTS_MULTIPLE.indexOf(objectName) === -1) {
				let object = this.objects[objectName]
				if (object !== undefined) {
					if (isBracketObject(object) && this.stackObjects.indexOf(object) > -1) {
						this.clearBracketObject(object)
					}
					object.destroy()
				}
			} else {
				for (let objectKey in this.objects[objectName]) {
					let object = this.objects[objectName][objectKey]
					if (object === undefined || object.scene === undefined) { continue }

					if (isBracketObject(object) && this.stackObjects.indexOf(object) > -1) {
						this.clearBracketObject(object)
					}

					object.destroy()
				}
			}
			this.objects[objectName] = undefined
		}
		delete this.stackObjects
		this.stackObjects = []

		// Cleaned up old data, now we need to reinitialize. That's easy:
		this.setDynamicObjects()
		// this.setInteractions()
	}

	// Set event handlers and init drop zone
	setInteractions() {
		let myself = this
		let phsr = this.phaser

		// this.renderDropZone()

		let firstDrag = true
		let newDrag = false

		let fastClickTimeout: number | undefined
		let fastClick = false
		phsr.input.on('gameobjectdown', function(pointer: Coords, gameObject: PhaserObject) {
			if (myself.running === true) { return }
			// Only allow command objects to be dragged
			if (gameObject.getData('commandID') === undefined) { return }
			if (myself.maxedOut && !myself.inDropZone(pointer)) { return }

			fastClick = true
			clearTimeout(fastClickTimeout)
			fastClickTimeout = setTimeout(function() {
				fastClick = false
			}, 300)

			newDrag = true
			firstDrag = true
			phsr.input.setDefaultCursor('grabbing')
		})

		phsr.input.on('drag', function (pointer: Coords, gameObject: PhaserObject, dragX: number, dragY: number) {
			if (myself.running === true) { return }
			if (myself.maxedOut && !myself.inDropZone(pointer)) { return }
			if (firstDrag) {
				// First drag event doesn't count, as it fires on initial mouse click without any movement
				return firstDrag = false
			}
			if (newDrag) {
				// Drag/remove command from the command queue
				if (myself.inDropZone(pointer)) {
					myself.removeFromStack(gameObject)

				} else if (!myself.maxedOut) {
					// Dragging from original position, so create another one under the hood
					myself.duplicateObject(gameObject)
				}
				newDrag = false
				fastClick = false
			}

			gameObject.setDepth(3)

			gameObject.x = dragX
			gameObject.y = dragY

			if (myself.inDropZone(pointer)) {
				myself.positionCommands(pointer)
			}
		})

		phsr.input.on('dragend', function (pointer, gameObject: PhaserObject) {
			if (myself.running === true) { return }
			myself.clearHoverTexture(gameObject)
			gameObject.setDepth(2)
			phsr.input.setDefaultCursor('default')

			if (newDrag) {
				newDrag = false
				if (!fastClick) { return }
			}

			if (fastClick) {
				return myself.fastClick(pointer, gameObject)
			}

			let shouldDrop = myself.inDropZone(pointer) && !pointer.isDown
			if (!myself.maxedOut && shouldDrop) {
				return myself.dropObjectOnStack(gameObject)
			}
			if (myself.maxedOut) { return }

			myself.positionCommands()
			// Dragged outside of drop zone -> delete this object
			myself.objects[gameObject.name][gameObject.getData('i')] = undefined
			gameObject.destroy()
		})

		phsr.input.on('pointerover', function (event, gameObjectList) {
			let object = gameObjectList[0]
			if (object !== undefined) {
				myself.setHoverTexture(object)
			}
		})

		phsr.input.on('pointerout', function (event, gameObjectList) {
			if (gameObjectList.length > 0) {
				myself.clearHoverTexture(gameObjectList[0])
			}
		})
	}

	// Used to make a new command in the command area to replace the one that the user is dragging
	duplicateObject(gameObject: PhaserObject) {
		let newObjectI = gameObject.getData('i') + 1
		let newObjectRef = gameObject.name + '-' + newObjectI.toString()
		let newObject = setGameObject(this.phaser, OBJECT_CONFIG[gameObject.name], newObjectRef)
		newObject.setData('i', newObjectI)
		this.objects[gameObject.name][newObjectI] = newObject
	}

	setHoverTexture(gameObject: PhaserObject) {
		if (gameObject.scene === undefined) { return }
		let objConfig = OBJECT_CONFIG[gameObject.name]
		if (objConfig === undefined || gameObject.getData('hover')) { return }

		gameObject.setData('hover', true)
		this.phaser.input.setDefaultCursor('pointer')
		let hoverTexture = gameObject.texture ? gameObject.texture.key + "-hover" : ''

		if (SPRITE_PATHS[hoverTexture] === undefined) {
			let newScale = (objConfig.scaling || 1) * HOVER_SCALING * this.scalingFactor
			gameObject.setScale(newScale)
			return
		}

		gameObject.setTexture(hoverTexture)
	}

	clearHoverTexture(gameObject: PhaserObject) {
		let objConfig = OBJECT_CONFIG[gameObject.name]
		if (objConfig === undefined || !gameObject.getData('hover')) { return }

		gameObject.setData('hover', false)
		this.phaser.input.setDefaultCursor('default')

		if (!gameObject.texture || gameObject.texture.key.indexOf('hover') === -1) {
			let newScale = (objConfig.scaling || 1) * this.scalingFactor
			gameObject.setScale(newScale)
			return
		}
		let newTexture = gameObject.texture.key.replace('-hover', '')

		if (gameObject.scene === undefined) return // is being deleted
		gameObject.setTexture(newTexture)

	}
	fastClick(pointer, gameObject: PhaserObject) {
		this.stackIndex = null
		let inDropZone = this.inDropZone(pointer)

		// fastClick in DropZone to ask for new input for numbers
		if (inDropZone && NUMBER_COMMANDS.indexOf(gameObject.name) > -1) {
			return this.askCounts(gameObject)
		}
		if (inDropZone || this.maxedOut) { return }

		// Add command to stack
		this.dropObjectOnStack(gameObject)
		this.duplicateObject(gameObject)
	}

	// //  Just a visual display of the drop zone
	// renderDropZone() {
	// 	if (this.graphics === null) {
	// 		this.graphics = this.phaser.add.graphics()
	// 		this.graphics.lineStyle(2, 0xffff00)
	// 	}
	// 	this.graphics.strokeRect(
	// 		w(BOARD_OFFSET_X),
	// 		h(BOARD_OFFSET_Y),
	// 		w(BOARD_STEPSIZE_X * 8),
	// 		h(BOARD_STEPSIZE_Y * 5)
	// 	)
	// 	this.graphics.strokeRect(
	// 		w(BOARD_OFFSET_X),
	// 		h(BOARD_OFFSET_Y),
	// 		w(BOARD_STEPSIZE_X),
	// 		h(BOARD_STEPSIZE_Y)
	// 	)
	// }

	inDropZone(location: Coords) {
		return (
			location.x > w(STACK_ZONE_POS_X)
			&& location.x < w(STACK_ZONE_POS_X + STACK_ZONE_WIDTH)
			&& location.y > h(STACK_ZONE_POS_Y)
			&& location.y < h(STACK_ZONE_POS_Y + STACK_ZONE_HEIGHT)
		)
	}

	dropObjectOnStack(gameObject: PhaserObject) {
		console.log('Drop object', gameObject, 'stackIndex:', this.stackIndex, 'stackObjects', this.stackObjects)

		// First input the amount for commands that require it
		let command = gameObject.getData('command')
		let askForCounts = command.counts === null || command.degrees === null || command.pixles === null
		if (askForCounts) {
			let result = this.askCounts(gameObject)
			if (result === false) {
				// user cancelled input
				delete this.objects[command.objectRef]
				gameObject.destroy()
				return this.positionCommands()
			}
		}

		// Add object to internal InterPhaser stack
		this.stackIndex = this.stackIndex !== null ? this.stackIndex : this.stackObjects.length
		this.stackObjects.splice(this.stackIndex, 0, gameObject)

		let isBracketObj = isBracketObject(gameObject)
		if (isBracketObj) {
			this.insertBrackets(gameObject)
		}

		this.positionCommands()
		this.updateStepcount()
	}

	askCounts(gameObject: PhaserObject) {
		let command = gameObject.getData('command')

		let msg = {
			'for': 'Hoe vaak herhalen?',
			'stepPixles': 'Hoeveel pixels?',
			'turnDegrees': 'Hoeveel graden?',
		}[command.commandID]

		let promptForInput = function (wrongInput?: boolean) {
			let question = wrongInput ? 'Er is iets fout gegaan. Heb je een getal ingevoerd? \n \n' + msg : msg
			let result = window.prompt(question, 'Voer een getal in')
			if (result === null) { return false } // Cancel

			let counts = parseInt(result, 10)
			if (!isNaN(counts) && counts < 1000 && counts > -1000) {
				return counts
			}
			return promptForInput(true)
		}

		let result = promptForInput()
		if (result === false) { return false }

		let key = {
			'for': 'counts',
			'stepPixles': 'pixles',
			'turnDegrees': 'degrees',
		}
		command[key[command.commandID]] = result
		renderNumber(this.phaser, gameObject, result)
		return true
	}

	positionCommands(pointer?: Coords) {
		this.stackIndex = null
		let bracketIndent = h(STACK_BRACKET_INDENT)
		let bracketTopOffset = h(STACK_BRACKET_OFFSET)
		let bracketSpacing = h(STACK_BRACKET_SPACING)
		let commandSpacing = h(STACK_COMMAND_SPACING)
		let avgCommandSize = h(STACK_AVG_CMD_SIZE)
		// The coordinates for the top-left aligned position for the next object
		let stackX = w(STACK_ZONE_POS_X)
		let stackY = h(STACK_ZONE_POS_Y) + avgCommandSize
		for (let i in this.stackObjects) {
			let object = this.stackObjects[i]

			let heightDiff = 0 // should be set in first if

			let halfObjectHeight = object.displayHeight / 2
			// Set height for the object
			// Note about how this works: stackX/stackY is defined as the top-left position of an object, but
			// the objects's y coordinate is set in the middle of the object so that the hovering effect
			// (i.e. it temporarily becomes a bit larger) works correctly. What that means is that we have to
			// add half of the object width/height to stackX/stackY
			object.y = object.name === 'bracketSide' ? stackY : stackY + halfObjectHeight
			if (object.name === 'bracketBottom') {
				var bracketSide = this.objects['bracketSide-for:' + object.getData('blockRef')]
				heightDiff = object.y - bracketSide.y
				if (heightDiff < avgCommandSize) {
					object.y += avgCommandSize
				}
			}
			if (object.name === 'bracketBottom' || object.name === 'close') {
				stackX -= bracketIndent
			}
			object.x = Math.ceil(stackX + (object.displayWidth / 2))

			// See if we should add temporary space around the pointer (when dragging command)
			let bracketSideOrTop = object.name === 'bracketSide' || object.name === 'bracketTop'
			let tryTempSpace = this.stackIndex === null && pointer !== undefined && !bracketSideOrTop
			if (tryTempSpace && pointer && pointer.y < (object.y + halfObjectHeight)) {
				this.stackIndex = parseInt(i, 10)
				object.y += avgCommandSize
			}

			let objectBottom = object.y + halfObjectHeight
			// Determine the position for the next item
			switch (object.name) {
				case 'bracketTop':
					stackY = stackY + bracketTopOffset
					break
				case 'bracketSide':
					stackX += bracketIndent
					stackY = object.y + bracketSpacing
					break
				case 'bracketBottom':
					// Scaling of bracket side
					heightDiff = objectBottom - bracketSide.y
					let newScale = heightDiff / bracketSide.height
					// #magicnumbers (trial & error)
					bracketSide.scaleY = Math.max(0.15, newScale)
					bracketSide.scaleX = 0.5
					bracketSide.x = object.getTopLeft().x + w(0.01)
					bracketSide.y += heightDiff / 2

					stackY = objectBottom + h(0.002)
					break
				case 'for':
				case 'for_x':
				case 'for_till':
					stackY = objectBottom - h(0.002)
					break
				case 'open':
					stackX += bracketIndent
				default:
					stackY = objectBottom + commandSpacing
			}
		}
	}

	/**
	* Position the for command and the corresponding bracket in the commandzone
	*/
	insertBrackets(gameObject) {
		if (this.stackIndex === null) { return }

		let insertIn = this.stackIndex + 1
		for (let objectName of ['bracketBottom', 'bracketSide', 'bracketTop']) {
			let objID = objectName + '-for:' + gameObject.getData('objectRef')
			let object = setGameObject(this.phaser, OBJECT_CONFIG[objectName], objID)
			this.objects[objID] = object
			this.stackObjects.splice(insertIn, 0, object)

			if (objectName === 'bracketBottom') {
				object.setData('blockRef', gameObject.getData('objectRef'))
			}
		}
	}

	clearBracketObject(bracketObject) {
		let commandRef = bracketObject.getData('objectRef')
		let deleteStart = this.stackObjects.indexOf(bracketObject) + 1
		let i: number
		for (i=deleteStart; i < this.stackObjects.length; i++) {
			let object = this.stackObjects[i]
			let selfRef = object.getData('objectRef')
			let blockRef = object.getData('blockRef')

			if (object.scene !== undefined) {
				object.destroy()
				delete this.objects[selfRef]
			}
			if (blockRef === commandRef) { break }
		}
		this.stackObjects.splice(deleteStart, 1 + i - deleteStart)
	}

	removeFromStack(object) {
		let objectIndex = this.stackObjects.indexOf(object)
		if (objectIndex !== -1) {
			if (isBracketObject(object)) {
				this.clearBracketObject(object)
			}
			this.stackObjects.splice(objectIndex, 1)
			this.positionCommands()
			this.updateStepcount()
		}
	}

	updateStepcount() {
		let stepCounter = this.objects.stepcount
		let commandTotal = this.stackObjects.reduce(function(counter, stackObject) {
			let commandID = stackObject.getData('commandID')
			let isCommand = commandID !== undefined && commandID !== 'blockend'
			return isCommand ? counter + 1 : counter
		}, 0)

		let newTexture = commandTotal.toString()
		stepCounter.setTexture(newTexture)

		this.maxedOut = commandTotal >= this.levelConfig.maxCommands
	}

	hasObject(objectName: ObjectKey) {
		return this.levelConfig.objects.indexOf(objectName) >= 0
	}

	fail() {
		this.running = false
		let modal = Object.create(FailModal)
		modal.spawn(this.phaser)
		this.updateCurrentCommand()
		this.afterFail()
	}
	/**
	* displays a levelcomplete image on screen when victory event is fired
	*/
	win() {
		let modal = Object.create(LevelCompleteModal)
		modal.spawn(this.phaser, this.levelConfig.levelName, this.resetLevel.bind(this))
	}

	updateOssiePos(ossiePos: OssiePos, animate?: boolean) {
		if (animate === undefined) {
			animate = false
		}

		let player = this.objects.player

		player.angle = ossiePos.orientation - 90

		// Make sure that the avatar is not upside-down
		if (player.angle > 90 || player.angle < -90) {
			// player.angle = 360 - player.angle
			player.setFlipY(true)
		} else {
			player.setFlipY(false)
		}

		let ossieCoords = strToCoord(ossiePos.nodeLocation)
		let newCoords = {
			x: this.boardOffsetX + (this.stepsizeX * ossieCoords.x),
			y: this.boardOffsetY + (this.stepsizeY * ossieCoords.y),
		}

		if (animate) {
			animateMovement(player, newCoords, MOVEMENT_DURATION)
			return
		}
		player.x = newCoords.x
		player.y = newCoords.y
	}

	onCommandExecute(commandReference) {
		let [commandName, commandI] = commandReference.split('-')
		let commandObject = this.objects[commandName][commandI]
		if (!isBracketObject(commandObject)) {
			this.updateCurrentCommand(commandObject)
		}
		this.afterCommandExecute(commandReference)
	}

	updateCurrentCommand(commandObject?: PhaserObject) {
		let activeCommand = this.activeCommand
		// Reset texture of previous activeCommand
		if (activeCommand && activeCommand.scene && !isBracketObject(activeCommand)) {
			// .add exists for phaser groups, I think
			let sprite = activeCommand.add !== undefined ? activeCommand.getAt(0) : activeCommand
			sprite.setTexture(OBJECT_CONFIG[activeCommand.name].spriteID)
			this.positionCommands()
		}

		this.activeCommand = commandObject

		if (commandObject === undefined) { return }

		// Show custom "current" sprite if applicable.
		// The command is a container if it has numbers (turnDegrees), so we need to get the sprite from it
		let sprite = commandObject.add !== undefined ? commandObject.getAt(0) : commandObject
		let crntTexture = sprite.texture.key + '-crnt'
		if (SPRITE_PATHS[crntTexture] !== undefined) {
			sprite.setTexture(crntTexture)
			this.positionCommands() // texture has different size, so realign the stack
		}
	}
}
