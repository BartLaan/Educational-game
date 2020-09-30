import { COMMON_OBJECTS, INIT_OBJECTS, NUMBER_COMMANDS } from './constants/objects'
import { SPRITE_PATHS } from './constants/paths'
import * as SIZES from './constants/sizes'
import InputPopup, { InputType } from './input_popup'
import FailModal from './modals/fail'
import InstructionModal from './modals/instruction'
import LevelCompleteModal from './modals/level_complete'
import { Coords, OssiePos } from './types/board'
import { LevelConfig, Space } from './types/game_config'
import { Container, GameObject, GameObjects, InterPhaserEvent, ObjectKey, PhaserImage, Pointer, Sprite } from './types/interphaser'
import { SSKey } from './types/spritesheets'
import { strToCoord } from './utils/level_setup'
import * as phaser_objects from './utils/phaser_objects'
import { getStackRepresentation } from './utils/stack'

const {
	BOARD_OFFSET_X,
	BOARD_OFFSET_Y,
	BOARD_STEPSIZE_X,
	BOARD_STEPSIZE_Y,
	HOVER_SCALING,
	OBJECT_CONFIG,
	PATH_COLOR,
	PATH_THICKNESS,
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
} = SIZES
const {
	animateMovement,
	cancelAnimations,
	h,
	isBracketObject,
	isDuplicableObject,
	isSprite,
	isContainer,
	renderNumber,
	setAngle,
	setGameObject,
	w,
} = phaser_objects

interface MovePlayerOptions { animate?: boolean, drawPath?: boolean, onArrival?: () => void }
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
	afterCommandExecute?(commandReference: string): void
	afterFail?(): void
	afterIntro?(): void

	// phsr object, indicating the command that the character is executing
	activeCommand: GameObject | null
	// number, offsets for the playing field/space that the avatar can move in
	boardOffsetX: number
	boardOffsetY: number
	disableInteraction: boolean = false
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
	objects: GameObjects
	// the phaser instance (I think it's actually a scene)
	phaser: Phaser.Scene
	// boolean, indicates the gamestate, i.e. whether the character is executing the commands
	running: boolean
	// number, factor to scale all size units by
	scalingFactor: number
	// number, indicating the stack position that the pointer is hovering over
	stackIndex: number | null
	// list of phaser objects representing the commands in the command stack
	stackObjects: GameObject[]
	// number, indicating the size of a grid element
	stepsizeX: number
	stepsizeY: number
	// number, indicating the width of the canvas. Should be equal to window.innerWidth except when resizing
	width: number

	showIntro() {
		const instructionName = SSKey[this.levelConfig.levelName.replace('level', 'instruction')]
		const instructionModal = new InstructionModal(this.phaser, instructionName)

		instructionModal.afterHide = () => {
			if (loadingScreen) {
				loadingScreen.destroy()
			}
			if (this.afterIntro) {
				this.afterIntro()
			}
		}
		instructionModal.render()

		// to not show the game screen while loading the intro
		const loadingScreen = this.phaser.add.rectangle(0, 0, this.width, this.height, 0xffffff)
		loadingScreen.setOrigin(0, 0)
		loadingScreen.setDepth(3)
	}

	initLevel() {
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

		this.setDynamicObjects()

		// Set static objects
		const backgroundName = 'background' + this.levelConfig.levelName.replace(/[A-Za-z]/g, '')
		const background = this.phaser.add.image(0, 0, backgroundName).setOrigin(0, 0)
		background.name = 'background'
		background.setDisplaySize(this.width, this.height)
		this.objects.background = background as PhaserImage

		const maxCommands = this.levelConfig.maxCommands
		OBJECT_CONFIG.stepcount_total.spriteID = maxCommands.toString()
		const stepCountTotal = setGameObject(this.phaser, OBJECT_CONFIG.stepcount_total, 'stepcount_total')
		this.objects.stepcount_total = stepCountTotal as Sprite

		this.setInteractions()
	}

	setDynamicObjects() {
		const objects = {}

		for (const objectName of INIT_OBJECTS) {
			if (!this.hasObject(objectName)) { continue }
			const objConfig = OBJECT_CONFIG[objectName]

			// normal objects
			if (!isDuplicableObject(objectName)) {
				const object = setGameObject(this.phaser, objConfig, objectName, this.levelConfig.spaceType)
				object.name = objectName
				objects[objectName] = object as Sprite

			} else { // draggable commands can have multiple versions
				const objectMap = {}
				const objectRef = `${objectName}-${0}`
				const object = setGameObject(this.phaser, objConfig, objectRef, this.levelConfig.spaceType)
				object.setData('i', 0)
				objectMap[0] = object
				objects[objectName] = objectMap
			}
		}
		this.objects = objects as GameObjects

		this.objects.stop.setVisible(false)
		this.objects.path = []

		if (this.levelConfig.spaceType === Space.grid && this.hasObject('questionmark')) {
			const questionmarkCoords = strToCoord(this.levelConfig.goalPosition)
			this.objects.questionmark.x += this.boardOffsetX
			this.objects.questionmark.y += this.boardOffsetY
			this.objects.questionmark.x += this.stepsizeX * questionmarkCoords.x
			this.objects.questionmark.y += this.stepsizeY * questionmarkCoords.y
		}

		this.addListener(this.objects.execute, 'pointerdown', () => {
			this.clearPath()
			if (this.stackObjects.length === 0) { return }

			const repr = getStackRepresentation(this.stackObjects)
			this.eventHandler(InterPhaserEvent.start, { stack: repr })
			this.setRunning(true)
		})

		this.addListener(this.objects.stop, 'pointerdown', () => this.abortMission())

		this.addListener(this.objects.reset, 'pointerdown', () => {
			if (this.running) {
				this.abortMission()
			} else {
				this.resetLevel()
			}
		})

		this.addListener(this.objects.backButton, 'pointerdown', () => this.showIntro())

		this.movePlayer(this.levelConfig.initPosition)
	}

	addListener(object: GameObject | Container | Phaser.Input.InputPlugin, eventName: string, func: any) {
		object.on(eventName, (...args) => {
			if (this.disableInteraction || window.modalVisible !== null) { return }
			func(...args)
		})
	}

	abortMission() {
		// Stop execution and reset player position
		this.setRunning(false)
		cancelAnimations(this.objects.player)
		this.eventHandler(InterPhaserEvent.reset)
		this.updateCurrentCommand()
		this.clearPath()
	}

	setRunning(running: boolean) {
		this.running = running
		this.objects.execute.setVisible(!this.running)
		this.objects.stop.setVisible(this.running)
	}

	resetLevel() {
		if (window.modalVisible) { return }

		console.log('restarting level')
		this.eventHandler(InterPhaserEvent.reset)
		this.activeCommand = null
		this.stackIndex = null
		this.setRunning(false)
		this.maxedOut = false
		this.disableInteraction = false

		// Lots of implicit knowledge here, not really nice. Maybe move to a config, i.e. resettableObjects = []
		for (const objectName of INIT_OBJECTS) {
			if (this.objects[objectName] === undefined) { continue }

			if (!isDuplicableObject(objectName)) {
				const object = this.objects[objectName]
				if (object !== undefined) {
					if (isBracketObject(object) && this.stackObjects.indexOf(object) > -1) {
						this.clearBracketObject(object)
					}
					object.destroy()
				}
			} else {
				for (const i in this.objects[objectName]) {
					if (!this.objects[objectName].hasOwnProperty(i)) { continue }
					const object = this.objects[objectName][i]
					if (!object.active) { continue }

					if (isBracketObject(object) && this.stackObjects.indexOf(object) > -1) {
						this.clearBracketObject(object)
					}

					object.destroy()
				}
			}
			// this.objects[objectName] = undefined
		}
		this.clearPath()
		this.stackObjects = []

		// Cleaned up old data, now we need to reinitialize. That's easy:
		this.setDynamicObjects()
	}

	// Set event handlers and init drop zone
	setInteractions() {
		const phsr = this.phaser

		// this.renderDropZone()

		let firstDrag = true
		let newDrag = false

		let fastClickTimeout: number | undefined
		let fastClick = false
		this.addListener(phsr.input, 'gameobjectdown', (pointer: Coords, gameObject: GameObject) => {
			if (this.running === true) { return }
			// Only allow command objects to be dragged
			if (gameObject.getData('commandID') === undefined) { return }
			if (this.maxedOut && !this.inDropZone(pointer)) { return }

			fastClick = true
			clearTimeout(fastClickTimeout)
			fastClickTimeout = setTimeout(() => {
				fastClick = false
			}, 300)

			newDrag = true
			firstDrag = true
			phsr.input.setDefaultCursor('grabbing')
		})

		this.addListener(phsr.input, 'drag', (pointer: Coords, gameObject: GameObject, dragX: number, dragY: number) => {
			if (this.running === true) { return }
			if (this.maxedOut && !this.inDropZone(pointer)) { return }
			if (firstDrag) {
				// First drag event doesn't count, as it fires on initial mouse click without any movement
				return firstDrag = false
			}
			if (newDrag) {
				// Drag/remove command from the command queue
				if (this.inDropZone(pointer)) {
					this.removeFromStack(gameObject)

				} else if (!this.maxedOut) {
					// Dragging from original position, so create another one under the hood
					this.duplicateObject(gameObject)
				}
				newDrag = false
				fastClick = false
			}

			gameObject.setDepth(3)

			gameObject.x = dragX
			gameObject.y = dragY

			if (this.inDropZone(pointer)) {
				this.positionCommands(pointer)
			}
		})

		this.addListener(phsr.input, 'dragend', (pointer: Pointer, gameObject: GameObject) => {
			if (this.running === true) { return }
			this.clearHoverTexture(gameObject)
			gameObject.setDepth(2)
			phsr.input.setDefaultCursor('default')

			if (newDrag) {
				newDrag = false
				if (!fastClick) { return }
			}

			if (fastClick) {
				return this.fastClick(pointer, gameObject)
			}

			const shouldDrop = this.inDropZone(pointer) && !pointer.isDown
			if (!this.maxedOut && shouldDrop) {
				return this.dropObjectOnStack(gameObject)
			}
			if (this.maxedOut) { return }

			this.positionCommands()
			// Dragged outside of drop zone -> delete this object
			// this.objects[gameObject.name][gameObject.getData('i')] = undefined
			gameObject.destroy()
		})

		this.addListener(phsr.input, 'pointerover', (__: Pointer, gameObjectList: GameObject[]) => {
			const object = gameObjectList[0]
			if (object !== undefined) {
				this.setHoverTexture(object)
			}
		})

		this.addListener(phsr.input, 'pointerout', (__: Pointer, gameObjectList: GameObject[]) => {
			if (gameObjectList.length > 0) {
				this.clearHoverTexture(gameObjectList[0])
			}
		})
	}

	// Used to make a new command in the command area to replace the one that the user is dragging
	duplicateObject(gameObject: GameObject) {
		const newObjectI = gameObject.getData('i') + 1
		const newObjectRef = `${gameObject.name}-${newObjectI}`
		const newObject = setGameObject(this.phaser, OBJECT_CONFIG[gameObject.name], newObjectRef, this.levelConfig.spaceType)
		newObject.setData('i', newObjectI)
		this.objects[gameObject.name][newObjectI] = newObject
	}

	setHoverTexture(gameObject: GameObject) {
		if (!gameObject.active) { return }
		const objConfig = OBJECT_CONFIG[gameObject.name]
		if (objConfig === undefined || gameObject.getData('hover')) { return }

		gameObject.setData('hover', true)
		this.phaser.input.setDefaultCursor('pointer')

		const hoverTexture = isSprite(gameObject) ? gameObject.texture.key + '-hover' : ''
		if (isSprite(gameObject) && SPRITE_PATHS[hoverTexture] !== undefined) {
			return gameObject.setTexture(hoverTexture)
		}

		const newScale = (objConfig.scaling || 1) * HOVER_SCALING * this.scalingFactor
		gameObject.setScale(newScale)
	}

	clearHoverTexture(gameObject: GameObject) {
		const objConfig = OBJECT_CONFIG[gameObject.name]
		if (objConfig === undefined || !gameObject.getData('hover')) { return }

		gameObject.setData('hover', false)
		this.phaser.input.setDefaultCursor('default')

		if (!isSprite(gameObject) || gameObject.texture.key.indexOf('hover') === -1) {
			const newScale = (objConfig.scaling || 1) * this.scalingFactor
			gameObject.setScale(newScale)
			return
		}
		const newTexture = gameObject.texture.key.replace('-hover', '')

		if (!gameObject.active) { return } // is being deleted
		gameObject.setTexture(newTexture)

	}
	fastClick(pointer: Pointer, gameObject: GameObject) {
		this.stackIndex = null
		const inDropZone = this.inDropZone(pointer)

		// fastClick in DropZone to ask for new input for numbers
		if (inDropZone && NUMBER_COMMANDS.indexOf(gameObject.name) > -1 && isContainer(gameObject)) {
			return this.askCounts(gameObject)
		}
		if (inDropZone || this.maxedOut) { return }

		const lastStackI = this.stackObjects.length-1
		const lastEmptyBracket = this.stackObjects[lastStackI] && this.stackObjects[lastStackI].name === 'bracketBottom'
		if (lastEmptyBracket && gameObject.name !== 'close') {
			this.stackIndex = lastStackI
		}
		// Add command to stack
		this.dropObjectOnStack(gameObject)
		this.duplicateObject(gameObject)
	}

	inDropZone(location: Coords) {
		return (
			location.x > w(STACK_ZONE_POS_X)
			&& location.x < w(STACK_ZONE_POS_X + STACK_ZONE_WIDTH)
			&& location.y > h(STACK_ZONE_POS_Y)
			&& location.y < h(STACK_ZONE_POS_Y + STACK_ZONE_HEIGHT)
		)
	}

	dropObjectOnStack(gameObject: GameObject) {
		// console.log('Drop object', gameObject, 'stackIndex:', this.stackIndex, 'stackObjects', this.stackObjects)

		// First input the amount for commands that require it
		const command = gameObject.getData('command')
		const noExistingInput = !command.counts && !command.pixles && !command.degrees
		const askForCounts = NUMBER_COMMANDS.indexOf(gameObject.name) > -1 && noExistingInput
		if (askForCounts && isContainer(gameObject)) {
			this.askCounts(gameObject)
		}

		// Add object to internal InterPhaser stack
		this.stackIndex = this.stackIndex !== null ? this.stackIndex : this.stackObjects.length
		this.stackObjects.splice(this.stackIndex, 0, gameObject)

		const isBracketObj = isBracketObject(gameObject)
		if (isBracketObj) {
			this.insertBrackets(gameObject)
		}

		this.positionCommands()
		this.updateStepcount()
	}

	askCounts(gameObject: Container) {
		this.disableInteraction = true
		const command = gameObject.getData('command')

		const inputType = {
			'for': InputType.counts,
			'turnDegrees': InputType.degrees,
			'skipPixles': InputType.pixles,
			'stepPixles': InputType.pixles,
			'stepPixlesBack': InputType.pixles,
		}[command.commandID]

		const inputCallback = (result?: number) => {
			this.disableInteraction = false
			if (result === undefined) {
				// user cancelled input
				this.removeFromStack(gameObject)
				delete this.objects[command.objectRef]
				gameObject.destroy()
				return this.positionCommands()
			}
			command[inputType] = result
			renderNumber(this.phaser, gameObject, result)
		}

		const inputPopup = new InputPopup(inputType, inputCallback)
		inputPopup.render()
	}

	positionCommands(pointer?: Coords) {
		this.stackIndex = null
		const bracketIndent = h(STACK_BRACKET_INDENT)
		const bracketTopOffset = h(STACK_BRACKET_OFFSET)
		const bracketSpacing = h(STACK_BRACKET_SPACING)
		const commandSpacing = h(STACK_COMMAND_SPACING)
		const avgCommandSize = h(STACK_AVG_CMD_SIZE)
		// The coordinates for the top-left aligned position for the next object
		let stackX = w(STACK_ZONE_POS_X)
		let stackY = h(STACK_ZONE_POS_Y) + avgCommandSize

		for (const object of this.stackObjects) {
			// should be set in first if
			let bracketSide: any
			let heightDiff = 0

			const halfObjectWidth = (isContainer(object) ? object.getBounds().width : object.displayWidth) / 2
			const halfObjectHeight = (isContainer(object) ? object.getBounds().height : object.displayHeight) / 2
			// Set height for the object
			// Note about how this works: stackX/stackY is defined as the top-left position of an object, but
			// the objects's y coordinate is set in the middle of the object so that the hovering effect
			// (i.e. it temporarily becomes a bit larger) works correctly. What that means is that we have to
			// add half of the object width/height to stackX/stackY
			object.y = object.name === 'bracketSide' ? stackY : stackY + halfObjectHeight
			if (object.name === 'bracketBottom') {
				bracketSide = this.objects['bracketSide-for:' + object.getData('blockRef')]
				heightDiff = object.y - bracketSide.y
				if (heightDiff < avgCommandSize) {
					object.y += avgCommandSize
				}
			}
			if (object.name === 'bracketBottom' || object.name === 'close') {
				stackX -= bracketIndent
			}
			object.x = (stackX + halfObjectWidth)

			// See if we should add temporary space around the pointer (when dragging command)
			const bracketSideOrTop = object.name === 'bracketSide' || object.name === 'bracketTop'
			const tryTempSpace = this.stackIndex === null && pointer !== undefined && !bracketSideOrTop
			if (tryTempSpace && pointer && pointer.y < (object.y + halfObjectHeight)) {
				this.stackIndex = this.stackObjects.indexOf(object)
				object.y += avgCommandSize
			}

			const objectBottom = object.y + halfObjectHeight
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
					const newScale = heightDiff / bracketSide.height
					// #magicnumbers (trial & error)
					bracketSide.scaleY = Math.max(0.15 * window.gameScale, newScale)
					bracketSide.scaleX = 0.5 * window.gameScale
					const leftCoord = isContainer(object) ? object.getBounds().left : object.getTopLeft().x
					bracketSide.x = leftCoord + w(1)
					bracketSide.y += heightDiff / 2

					stackY = objectBottom + h(0.2)
					break
				case 'for':
				case 'for_x':
				case 'for_till':
					stackY = objectBottom - h(0.2)
					break
				default:
					if (object.name === 'open') {
						stackX += bracketIndent
					}
					stackY = objectBottom + commandSpacing
			}
		}
	}

	/**
	 * Position the for command and the corresponding bracket in the commandzone
	 */
	insertBrackets(gameObject: GameObject) {
		if (this.stackIndex === null) { return }

		const insertIn = this.stackIndex + 1
		for (const objectName of ['bracketBottom', 'bracketSide', 'bracketTop']) {
			const objID = `${objectName}-for:${gameObject.getData('objectRef')}`
			const object = setGameObject(this.phaser, OBJECT_CONFIG[objectName], objID)
			this.objects[objID] = object
			this.stackObjects.splice(insertIn, 0, object)

			if (objectName === 'bracketBottom') {
				object.setData('blockRef', gameObject.getData('objectRef'))
			}
		}
	}

	clearBracketObject(bracketObject: GameObject) {
		const commandRef = bracketObject.getData('objectRef')
		const deleteStart = this.stackObjects.indexOf(bracketObject) + 1
		const deleted: number[] = []

		for (let i=deleteStart; i < this.stackObjects.length; i++) {
			const object = this.stackObjects[i]
			const selfRef = object.getData('objectRef')
			const blockRef = object.getData('blockRef')

			if (object.active && selfRef.indexOf(commandRef) > -1) {
				deleted.push(i)
				delete this.objects[selfRef]
				object.destroy()
			}
			if (blockRef === commandRef) { break }
		}
		this.stackObjects = this.stackObjects.filter((_, i) => deleted.indexOf(i) === -1)
		this.positionCommands()
	}

	removeFromStack(object: GameObject) {
		const objectIndex = this.stackObjects.indexOf(object)
		if (objectIndex === -1) { return }

		if (isBracketObject(object)) {
			this.clearBracketObject(object)
		}
		this.stackObjects.splice(objectIndex, 1)
		this.positionCommands()
		this.updateStepcount()
	}

	updateStepcount() {
		const stepCounter = this.objects.stepcount as Sprite
		const commandTotal = this.stackObjects.reduce((counter, stackObject) => {
			const commandID = stackObject.getData('commandID')
			const isCommand = commandID !== undefined && commandID !== 'blockend'
			return isCommand ? counter + 1 : counter
		}, 0)

		const newTexture = commandTotal.toString()
		stepCounter.setTexture(newTexture)

		this.maxedOut = commandTotal >= this.levelConfig.maxCommands
	}

	hasObject(objectName: ObjectKey) {
		return this.levelConfig.objects.indexOf(objectName) >= 0
	}

	fail() {
		this.setRunning(false)
		const modal = new FailModal(this.phaser)
		modal.render()
		this.updateCurrentCommand()
		if (this.levelConfig.spaceType === Space.pixles) {
			// this.clearPath()
		}
		if (this.afterFail) {
			this.afterFail()
		}
	}

	/**
	 * displays a levelcomplete image on screen when victory event is fired
	 */
	win() {
		const modal = new LevelCompleteModal(this.phaser, this.levelConfig.levelName, this.resetLevel.bind(this))
		// in the pixle levels, wait a bit so the player can see their path result a bit longer
		if (this.levelConfig.spaceType === Space.pixles) {
			setTimeout(() => modal.render(), 1000)
			return
		}

		modal.render()
	}

	movePlayer(ossiePos: OssiePos, options: MovePlayerOptions = {}) {
		const player = this.objects.player as Sprite

		const newAngle = ossiePos.orientation - 90

		const ossieCoords = strToCoord(ossiePos.nodeLocation)
		const newCoords = {
			x: this.boardOffsetX + (this.stepsizeX * ossieCoords.x),
			y: this.boardOffsetY + (this.stepsizeY * ossieCoords.y),
		}

		if (options.animate && this.running) {
			const onMovement = options.drawPath ? this.drawPath.bind(this) : undefined
			const animOptions = { onMovement, onArrival: options.onArrival }
			animateMovement(player, newCoords, newAngle, animOptions)
			return
		}

		// not animated
		if (this.running && options.drawPath) {
			this.drawPath(player, newCoords)
		}
		setAngle(player, newAngle)
		player.x = newCoords.x
		player.y = newCoords.y
		if (options.onArrival) {
			options.onArrival()
		}
	}

	drawPath(oldCoords: Coords, newCoords: Coords) {
		const distanceX = newCoords.x - oldCoords.x
		const distanceY = newCoords.y - oldCoords.y
		const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
		if (distance === 0) { return }

		const rect = this.phaser.add.rectangle(oldCoords.x, oldCoords.y, distance, PATH_THICKNESS, PATH_COLOR, 0.7)
		rect.setOrigin(0, 0.5);
		const naiveRotation = Math.acos(distanceX / distance)
		const rotation = distanceY >= 0 ? naiveRotation : Math.PI * 2 - naiveRotation
		rect.setRotation(rotation)
		this.objects.path.push(rect)
	}

	clearPath() {
		for (const polygon of this.objects.path) {
			if (!polygon.active) { continue }
			polygon.destroy()
		}
	}

	onCommandExecute(commandReference: string) {
		const [commandName, commandI] = commandReference.split('-')
		const commandObject = this.objects[commandName][commandI]
		if (!isBracketObject(commandObject)) {
			this.updateCurrentCommand(commandObject)
		}
		if (this.afterCommandExecute) {
			this.afterCommandExecute(commandReference)
		}
	}

	updateCurrentCommand(commandObject?: GameObject) {
		let sprite: Sprite
		const activeCommand = this.activeCommand
		// Reset texture of previous activeCommand
		if (activeCommand && activeCommand.active && !isBracketObject(activeCommand)) {
			// .add exists for phaser groups, I think
			sprite = isContainer(activeCommand) ? activeCommand.getAt(0) as Sprite : activeCommand as Sprite
			sprite.setTexture(OBJECT_CONFIG[activeCommand.name].spriteID)
			this.positionCommands()
		}

		this.activeCommand = commandObject || null

		if (commandObject === undefined) { return }

		// Show custom "current" sprite if applicable.
		// The command is a container if it has numbers (turnDegrees), so we need to get the sprite from it
		sprite = isContainer(commandObject) ? commandObject.getAt(0) as Sprite : commandObject as Sprite
		const crntTexture = sprite.texture.key + '-crnt'
		if (SPRITE_PATHS[crntTexture] !== undefined) {
			sprite.setTexture(crntTexture)
			this.positionCommands() // texture has different size, so realign the stack
		}
	}
}
