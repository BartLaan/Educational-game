import { Coords } from '~/types/board'
import { deepCopy } from './etc'
import { NUMBER_COMMANDS, BRACKET_OBJECTS } from '~/constants/objects'
import { OBJECT_CONFIG, NUM_SCALING, NUM_SPACING, ANIMATION_FPS } from '~/constants/sizes'

// Helpers for converting height/width units to pixel values
export function h(heightInUnits: number) { return window.gameHeight * heightInUnits }
export function w(widthInUnits: number) { return window.gameWidth * widthInUnits }

export function setGameObject(phaser, config, id) {
	let scaling = (config.scaling || 1) * window.gameScale
	let objectName = id.split('-')[0]

	let gameObject = phaser.add.sprite(0, 0, config.spriteID)

	// we need to draw numbers for the amount of repeats for forX and degrees for turnDegrees
	if (NUMBER_COMMANDS.indexOf(objectName) !== -1) {
		// SO this is a bit weird, we're replacing the gameObject with a container containing the gameObject.
		// This is so that we can treat the container like an object, so it will take the number with it when dragging
		let container = phaser.add.container(0, 0, [gameObject])
		container.setSize(gameObject.width, gameObject.height)
		container.setScale(scaling)
		gameObject = container
	} else {
		gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling)
	}
	gameObject.setData('objectRef', id)
	gameObject.name = objectName

	if (config.command !== undefined) {
		let commandObject = deepCopy(config.command)
		// This is a command object, we need a reference to itself for when we pass it to the stack
		commandObject.objectRef = id
		gameObject.setData('command', commandObject)
		gameObject.setData('commandID', config.command.commandID)
	}
	if (config.offsetX !== undefined) {
		gameObject.x = w(config.offsetX)
		gameObject.y = h(config.offsetY)
	}

	gameObject.setDepth(1)
	if (config.depth !== undefined) {
		gameObject.setDepth(config.depth)
	}
	if (config.interactive === true || config.draggable === true) {
		gameObject.setInteractive()
	}
	if (config.draggable === true) {
		phaser.input.setDraggable(gameObject)
	}

	return gameObject
}

// This should probably be moved to somewhere else, but is common to ossieGame/interPhaser
export function isBracketObject(gameObject) {
	if (typeof gameObject !== 'string') {
		return gameObject.getData !== undefined && BRACKET_OBJECTS.indexOf(gameObject.getData('commandID')) > -1
	}
	return BRACKET_OBJECTS.indexOf(gameObject) > -1
}

// Render number for commands that need it (forX, turnDegrees)
export function renderNumber(phaser, object, num: number) {
	object.each(function(sprite) {
		if (sprite.name.indexOf('number') > -1) {
			object.remove(sprite, true, true)
		}
	})
	let config = OBJECT_CONFIG[object.name]
	let numScale = config.numScale || NUM_SCALING
	let numSpacing = w(NUM_SPACING) * numScale
	let numX = w(config.numOffsetX)
	let numY = h(config.numOffsetY)
	// get array of decreasing order of magnitude (-123 > ['3','2','1','-'])
	let numParts = num.toString().split('').reverse()
	for (let numIStr in numParts) {
		let numI = parseInt(numIStr, 10)
		let numberObj = phaser.add.sprite(numX - (numSpacing * (numI + 1)), numY, numParts[numI])
		numberObj.setOrigin(0,0)
		numberObj.setScale(numScale)
		numberObj.name = 'number' + numI
		numberObj.setDepth(1)
		object.add(numberObj)
	}
}

export function animateMovement(object, newCoords: Coords, duration: number) {
	let existingAnimation = object.getData('animatedMovement')
	if (existingAnimation !== undefined) {
		clearInterval(existingAnimation)
	}

	let frameDuration = 1000 / ANIMATION_FPS
	let frameAmount = Math.ceil(duration / frameDuration)

	let stepX = (newCoords.x - object.x) / frameAmount
	let stepY = (newCoords.y - object.y) / frameAmount
	let moveRight = object.x < newCoords.x
	let moveDown = object.y < newCoords.y

	let interval = setInterval(function() {
		let potentialNewX = object.x + stepX
		let overShootX = moveRight
			? potentialNewX > newCoords.x
			: potentialNewX < newCoords.x

		let potentialNewY = object.y + stepY
		let overShootY = moveDown
			? potentialNewY > newCoords.y
			: potentialNewY < newCoords.y

		if (overShootX || overShootY) {
			object.x = newCoords.x
			object.y = newCoords.y
			clearInterval(interval)
			return
		}
		object.x = potentialNewX
		object.y = potentialNewY

	}, frameDuration)
	object.setData('animatedMovement', interval)
}
