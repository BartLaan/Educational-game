import { Coords } from '~/types/board'
import { deepCopy } from './etc'
import { NUMBER_COMMANDS, BRACKET_OBJECTS, OBJECTS_MULTIPLE } from '~/constants/objects'
import { OBJECT_CONFIG, NUM_SCALING, NUM_SPACING, ANIMATION_FPS, BASE_SIZE_X, BASE_SIZE_Y } from '~/constants/sizes'
import { GameObject, ObjectConfig, Container, Sprite, ObjectKey, DuplicableObject } from '~/types/interphaser'
import { CommandID } from '~/types/stack'

// Helpers for converting height/width units to pixel values, so the whole game is scalable
export function h(heightInUnits: number) { return window.gameHeight * (heightInUnits / 100) }
export function w(widthInUnits: number) { return window.gameWidth * (widthInUnits / 100) }

export function isSprite(gameObject: GameObject): gameObject is Sprite {
	return gameObject.type === 'Sprite'
}
export function isContainer(gameObject: GameObject): gameObject is Container {
	return gameObject.type === 'Container'
}
export function isDuplicableObject(objectKey: ObjectKey): objectKey is DuplicableObject {
	return OBJECTS_MULTIPLE.indexOf(objectKey) > -1
}

export function setGameObject(phaser: Phaser.Scene, config: ObjectConfig, id: string) {
	const scaling = (config.scaling || 1) * window.gameScale
	const objectName = id.split('-')[0] as ObjectKey

	let gameObject: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container = phaser.add.sprite(0, 0, config.spriteID)

	// we need to draw numbers for the amount of repeats for forX and degrees for turnDegrees
	if (NUMBER_COMMANDS.indexOf(objectName) !== -1) {
		// SO this is a bit weird, we're replacing the gameObject with a container containing the gameObject.
		// This is so that we can treat the container like an object, so it will take the number with it when dragging
		const container = phaser.add.container(0, 0, [gameObject])
		container.setSize(gameObject.width, gameObject.height)
		container.setScale(scaling)
		gameObject = container
	} else {
		gameObject.setDisplaySize(gameObject.width * scaling, gameObject.height * scaling)
	}
	gameObject.name = objectName
	gameObject.setData('objectRef', id)

	if (config.command !== undefined) {
		const commandObject = deepCopy(config.command)
		if (commandObject !== null) {
			// This is a command object, we need a reference to itself for when we pass it to the stack
			commandObject.objectRef = id
			gameObject.setData('command', commandObject)
			gameObject.setData('commandID', config.command.commandID)
		}
	}
	if (config.offsetX !== undefined && config.offsetY !== undefined) {
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

	return gameObject as GameObject
}

// This should probably be moved to somewhere else, but is common to ossieGame/interPhaser
export function isBracketObject(gameObject: GameObject | CommandID) {
	if (typeof gameObject !== 'string') {
		return gameObject.getData !== undefined && BRACKET_OBJECTS.indexOf(gameObject.getData('commandID')) > -1
	}
	return BRACKET_OBJECTS.indexOf(gameObject) > -1
}

// Render number for commands that need it (forX, turnDegrees)
export function renderNumber(phaser: Phaser.Scene, object: Container, num: number) {
	object.each((sprite: Phaser.GameObjects.Sprite) => {
		if (sprite.name.indexOf('number') > -1) {
			object.remove(sprite, true)
		}
	})
	const config = OBJECT_CONFIG[object.name]
	// no usage of w() or h() here, as we're in the realm of the container which is scaled on its own
	const numScale = config.numScale || NUM_SCALING
	const numSpacing = (NUM_SPACING * BASE_SIZE_X / 100) * (numScale / NUM_SCALING)

	if (config.numOffsetX === undefined || config.numOffsetY === undefined) {
		return console.error('missing numOffsetX for', object)
	}
	const numX = config.numOffsetX * BASE_SIZE_X / 100
	const numY = config.numOffsetY * BASE_SIZE_Y / 100

	// get array of decreasing order of magnitude (-123 > ['3','2','1','-'])
	const numParts = num.toString().split('').reverse()
	for (const numIStr in numParts) {
		if (!numParts.hasOwnProperty(numIStr)) { continue }

		const numI = parseInt(numIStr, 10)
		const numberObj = phaser.add.sprite(numX - (numSpacing * (numI)), numY, numParts[numI])
		numberObj.setOrigin(1, 0.5)
		numberObj.setScale(numScale)
		numberObj.name = 'number' + numI
		numberObj.setDepth(1)
		object.add(numberObj)
	}
}

type MovementCallback = (oldCoords: Coords, newCoords: Coords) => void
export function animateMovement(object: GameObject, newCoords: Coords, duration: number, callback?: MovementCallback) {
	// nothing to animate
	if (object.x === newCoords.x && object.y === newCoords.y) {
		return
	}

	cancelAnimations(object)

	const frameDuration = 1000 / ANIMATION_FPS
	const frameAmount = Math.ceil(duration / frameDuration)

	const stepX = (newCoords.x - object.x) / frameAmount
	const stepY = (newCoords.y - object.y) / frameAmount
	const moveRight = object.x < newCoords.x
	const moveDown = object.y < newCoords.y

	const interval = setInterval(() => {
		const potentialNewX = object.x + stepX
		const overShootX = moveRight
			? potentialNewX > newCoords.x
			: potentialNewX < newCoords.x

		const potentialNewY = object.y + stepY
		const overShootY = moveDown
			? potentialNewY > newCoords.y
			: potentialNewY < newCoords.y

		if (overShootX || overShootY) {
			object.x = newCoords.x
			object.y = newCoords.y
			clearInterval(interval)
			return
		}

		const oldCoords = { x: object.x, y: object.y }
		object.x = potentialNewX
		object.y = potentialNewY
		if (callback) {
			callback(oldCoords, { x: object.x, y: object.y })
		}

	}, frameDuration)

	if (object.getData('animatedMovement') === undefined) {
		object.setData('animatedMovement', [])
	}
	const existingAnimations = object.getData('animatedMovement')
	existingAnimations.push(interval)
}

export function cancelAnimations(object: GameObject) {
	if (object.getData('animatedMovement') === undefined) { return }

	const existingAnimations = object.getData('animatedMovement')
	while (existingAnimations.length) {
		clearInterval(existingAnimations.shift())
	}
}
