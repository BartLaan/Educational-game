import { BOARD_SIZE_REL_TO_PIXLE_X, BOARD_SIZE_REL_TO_PIXLE_Y, COMMAND_TIMING } from './constants/sizes'
import { Nodes, OssiePos } from './types/board'
import { LevelConfig, Space } from './types/game_config'
import { Conditional, Stack, StackEvent, StackItemFor } from './types/stack'
import { deepCopy } from './utils/etc'
import { strToCoord } from './utils/level_setup'
import { isBracketObject } from './utils/phaser_objects'
import { turnClock, turnDegrees } from './utils/positioning'
import { getStackItem } from './utils/stack'

export type StackManagerHandler = (stackEvent: StackEvent, data?: any) => void
export default class StackManager {
	boundaryX: number
	boundaryY: number
	eventHandler: StackManagerHandler
	goalPath?: string[]
	nodes: Nodes
	initPosition: OssiePos
	ossiePos: OssiePos
	pathTaken: string[]
	spaceType: Space
	stack?: Stack
	timer?: number
	timing?: number

	constructor(levelConfig: LevelConfig, eventHandler: StackManagerHandler) {
		this.eventHandler = eventHandler
		this.initPosition = levelConfig.initPosition
		this.spaceType = levelConfig.spaceType
		this.timing = levelConfig.timing || COMMAND_TIMING

		this.ossiePos = deepCopy(levelConfig.initPosition)

		if (levelConfig.spaceType === Space.pixles) {
			this.goalPath = levelConfig.goalPath
			this.boundaryX = Math.floor(levelConfig.pixleSize * BOARD_SIZE_REL_TO_PIXLE_X)
			this.boundaryY = Math.floor(levelConfig.pixleSize * BOARD_SIZE_REL_TO_PIXLE_Y)
		} else {
			this.nodes = levelConfig.nodes
		}
	}

	getPosition() {
		return this.ossiePos
	}

	resetOssie() {
		this.ossiePos = deepCopy(this.initPosition)
		this.eventHandler(StackEvent.ossieposChange)
	}

	step() {
		let newNode = this.nodes[this.ossiePos.nodeLocation][this.ossiePos.orientation]
		if (newNode !== undefined) {
			this.ossiePos.nodeLocation = newNode
			this.eventHandler(StackEvent.ossieposChange)
		} else {
			this.eventHandler(StackEvent.walkintowall)
		}
	}

	stepPixles(pixles: number) {
		let coords = strToCoord(this.ossiePos.nodeLocation)
		let radial = this.ossiePos.orientation * Math.PI / 180
		let unsafeNewX = coords.x + (pixles * Math.sin(radial))
		let unsafeNewY = coords.y - (pixles * Math.cos(radial))

		let newX = Math.min(Math.max(0, unsafeNewX), this.boundaryX)
		let newY = Math.min(Math.max(0, unsafeNewY), this.boundaryY)
		if (newX !== unsafeNewX || newY !== unsafeNewY) {
			this.eventHandler(StackEvent.walkintowall)
		}

		this.ossiePos.nodeLocation = newX.toString() + ',' + newY.toString()
		this.pathTaken.push(this.ossiePos.nodeLocation)
		return this.eventHandler(StackEvent.ossieposChange)
	}

	facingWall() {
		let node = this.nodes[this.ossiePos.nodeLocation]
		return node[this.ossiePos.orientation] === undefined
	}

	pathExistsTo(direction: 'right' | 'left') {
		let node = this.nodes[this.ossiePos.nodeLocation]
		let clockWise = direction === 'right'
		let nodeDirection = turnClock(this.ossiePos.orientation, clockWise)
		return node[nodeDirection] !== undefined
	}

	turnL() {
		this.ossiePos.orientation = turnClock(this.ossiePos.orientation, false)
		this.eventHandler(StackEvent.ossieposChange)
	}
	turnR() {
		this.ossiePos.orientation = turnClock(this.ossiePos.orientation, true)
		this.eventHandler(StackEvent.ossieposChange)
	}

	turnDegrees(degrees: number) {
		this.ossiePos.orientation = turnDegrees(this.ossiePos.orientation, degrees)
		this.eventHandler(StackEvent.ossieposChange)
	}

	conditional(conditionalCode: Conditional): boolean {
		switch (conditionalCode) {
			case Conditional.forwardfree:
				return !this.facingWall()
			case Conditional.leftfree:
				return this.pathExistsTo('left')
			case Conditional.rightfree:
				return this.pathExistsTo('right')
			case Conditional.onGoal:
				return this.hasReachedGoal()
			default:
				return true
		}
	}

	hasReachedGoal(): boolean {
		if (this.spaceType === Space.grid) {
			return this.nodes[this.ossiePos.nodeLocation].goal === true
		}
		if (this.goalPath === undefined) { return false }
		// else
		if (this.pathTaken.length < this.goalPath.length) {
			return false
		}
		// Check if the player has passed all the checkpoints
		for (let i in this.goalPath) {
			if (this.goalPath[i] !== this.pathTaken[i]) {
				return false
			}
		}

		return true
	}

	executeFor(stackItem: StackItemFor, stack: Stack, callbackStacks: Stack[]) {
		if (stackItem.autoStop) {
			if (this.hasReachedGoal()) {
				stack.shift()
				return this.stackExecute(stack, callbackStacks)
			}
		} else if (stackItem.counts !== undefined && stackItem.counts <= 0) {
			// Only take forloop serious if it has at least 1
			stack.shift()
			return this.stackExecute(stack, callbackStacks)
		} else {
			if (stackItem.counter === undefined) {
				stackItem.counter = stackItem.counts
			}
			stackItem.counter -= 1
			if (stackItem.counter <= 0) {
				// If counter reaches zero, remove for command from stack and do the last loop
				stack.shift()
			}
		}
		callbackStacks.unshift(stack)

		let forStack = deepCopy(stackItem.do)
		return this.stackExecute(forStack, callbackStacks)

	}

	stackStart() {
		let stackToExecute = deepCopy(this.stack)
		if (stackToExecute.shift().commandID !== 'open') {
			return this.eventHandler(StackEvent.openEnd)
		}
		if (this.spaceType === Space.pixles) {
			this.pathTaken = [this.getPosition().nodeLocation]
		}

		this.stackExecute(stackToExecute, [])
	}

	stackEnd(proper: boolean) {
		if (proper && this.hasReachedGoal()) {
			this.eventHandler(StackEvent.win)
			if (window.debug) {
				console.log('won')
			}
			return
		} else if (proper) {
			// this.eventHandler(StackEvent.fail)
		}
		this.eventHandler(StackEvent.openEnd)
	}

	stackExecute(stack: Stack, callbackStacks: Stack[]) {
		// No commands left
		if (stack.length === 0 && callbackStacks.length === 0) {
			return this.stackEnd(false)
		}
		// Stack exhausted, continue with callbackStacks
		if (stack.length === 0) {
			let newStack = callbackStacks.shift()
			return this.stackExecute(newStack || [], callbackStacks)
		}


		// Freeze game so player can see what's happening, but only for actions that change position
		let timing = isBracketObject(stack[0].commandID) ? 0 : this.timing
		let me = this
		this.timer = setTimeout(function(){
			me.executeStackItem(stack, callbackStacks)
		}, timing)
	}

	// Execute a stack item. Returns true if player enters win condition
	executeStackItem(stack: Stack, callbackStacks: Stack[]) {
		let stackItem = stack[0]
		// this.debugStackItem(stackItem)
		console.log('executing command:', stackItem.commandID, this.ossiePos)

		this.eventHandler(StackEvent.executeCommand, stackItem.objectRef)
		// For loops prepend the current stack to callbackStacks and call stackExecute with the for stack:
		// stackExecute(forStack, [currentStack, ...callbackStacks])
		// Everytime this happens, the counter of the forloop updates and when it reaches 0, we continue
		// with the currentStack
		if (stackItem.commandID !== "for") {
			stack.shift()
		}

		switch (stackItem.commandID) {
			case "if":
				if (this.conditional(stackItem.condition)) {
					callbackStacks.unshift(stack)
					return this.stackExecute(stackItem.do, callbackStacks)
				}
				break

			case "else":
				let ifObject = getStackItem(stackItem.blockRef, this.stack || [])
				if (!ifObject || ifObject.commandID !== 'if') { break }
				console.log('found ifobject for else:', ifObject)
				if (this.conditional(ifObject.condition) === false) {
					callbackStacks.unshift(stack)
					return this.stackExecute(stackItem.do, callbackStacks)
				}
				break

			case "for":
				return this.executeFor(stackItem, stack, callbackStacks)

			case "step":
				this.step()
				break

			case "stepPixles":
				this.stepPixles(stackItem.pixles)
				break

			case "turnL":
				this.turnL()
				break
			case "turnR":
				this.turnR()
				break

			case "turnDegrees":
				this.turnDegrees(stackItem.degrees)
				break

			case "close":
				return this.stackEnd(true)

			default:
				console.log('skip command', stackItem.commandID)
		}

		return this.stackExecute(stack, callbackStacks)
	}
}
