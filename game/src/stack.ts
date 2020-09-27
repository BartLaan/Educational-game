import { BOARD_SIZE_REL_TO_PIXLE_X, BOARD_SIZE_REL_TO_PIXLE_Y, COMMAND_TIMING, PIXLESIZE } from './constants/sizes'
import { Nodes, OssiePos } from './types/board'
import { LevelConfig, Space } from './types/game_config'
import { Conditional, Stack, StackEvent, StackItemFor } from './types/stack'
import { deepCopy } from './utils/etc'
import { strToCoord, coordToStr } from './utils/level_setup'
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
	printPath = false // for debugging
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

		if (levelConfig.spaceType === Space.grid) {
			this.nodes = levelConfig.nodes
			return
		}

		this.goalPath = levelConfig.goalPath
		this.boundaryX = Math.floor((PIXLESIZE * PIXLESIZE / levelConfig.pixleSize) * BOARD_SIZE_REL_TO_PIXLE_X)
		this.boundaryY = Math.floor((PIXLESIZE * PIXLESIZE / levelConfig.pixleSize) * BOARD_SIZE_REL_TO_PIXLE_Y)
	}

	getPosition() {
		return this.ossiePos
	}

	resetOssie() {
		this.ossiePos = deepCopy(this.initPosition)
		this.eventHandler(StackEvent.ossieposChange)
	}

	step() {
		const newNode = this.nodes[this.ossiePos.nodeLocation][this.ossiePos.orientation]
		if (newNode !== undefined) {
			this.ossiePos.nodeLocation = newNode
			this.eventHandler(StackEvent.ossieposChange)
		} else {
			this.eventHandler(StackEvent.walkintowall)
		}
	}

	stepPixles(pixles: number, drawPath: boolean, onArrival: () => void) {
		const coords = strToCoord(this.ossiePos.nodeLocation)
		const radial = this.ossiePos.orientation * Math.PI / 180
		const unsafeNewX = coords.x + (pixles * Math.sin(radial))
		const unsafeNewY = coords.y - (pixles * Math.cos(radial))

		const newX = Math.min(Math.max(0, unsafeNewX), this.boundaryX)
		const newY = Math.min(Math.max(0, unsafeNewY), this.boundaryY)
		if (newX !== unsafeNewX || newY !== unsafeNewY) {
			this.eventHandler(StackEvent.walkintowall)
		}
		this.ossiePos.nodeLocation = coordToStr(newX, newY)
		// track goal completion
		if (this.goalPath) {
			const nextRequiredNode = this.goalPath[this.pathTaken.length]
			const roundedLocation = coordToStr(Math.round(newX), Math.round(newY))
			if (roundedLocation === nextRequiredNode || this.printPath) {
				this.pathTaken.push(roundedLocation)
			}
		}

		return this.eventHandler(StackEvent.ossieposChange, { drawPath, onArrival })
	}

	facingWall() {
		const node = this.nodes[this.ossiePos.nodeLocation]
		return node[this.ossiePos.orientation] === undefined
	}

	pathExistsTo(direction: 'right' | 'left') {
		const node = this.nodes[this.ossiePos.nodeLocation]
		const clockWise = direction === 'right'
		const nodeDirection = turnClock(this.ossiePos.orientation, clockWise)
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

		if (this.pathTaken.length < this.goalPath.length) {
			return false
		}
		// Check if the player has passed all the checkpoints
		for (const i in this.goalPath) {
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
				return this.cueStackItem(stack, callbackStacks)
			}
		} else if (stackItem.counts !== undefined && stackItem.counts <= 0) {
			// Only take forloop serious if it has at least 1
			stack.shift()
			return this.cueStackItem(stack, callbackStacks)
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

		const forStack = deepCopy(stackItem.do)
		return this.cueStackItem(forStack, callbackStacks)

	}

	stackStart() {
		const stackToExecute = deepCopy(this.stack)
		if (stackToExecute.shift().commandID !== 'open') {
			return this.eventHandler(StackEvent.openEnd)
		}
		if (this.spaceType === Space.pixles) {
			this.pathTaken = []
		}
		this.timer = undefined

		this.cueStackItem(stackToExecute, [])
	}

	stackEnd(proper: boolean) {
		if (this.printPath) {
			console.log(JSON.stringify(this.pathTaken))
		}
		if (proper && this.hasReachedGoal()) {
			this.eventHandler(StackEvent.win)
			if (window.debug) {
				console.log('won')
			}
			return
		}
		if (proper) {
			return this.eventHandler(StackEvent.fail)
		}

		this.eventHandler(StackEvent.openEnd)
	}

	// wrapper around executeStackItem for pacing and managing the stack/callbackStacks
	cueStackItem(stack: Stack, callbackStacks: Stack[]) {
		if (this.timer) { alert('HELP IM BROKEN') }

		// No commands left
		if (stack.length === 0 && callbackStacks.length === 0) {
			return this.stackEnd(false)
		}
		// Stack exhausted, continue with callbackStacks
		if (stack.length === 0) {
			const newStack = callbackStacks.shift()
			return this.cueStackItem(newStack || [], callbackStacks)
		}

		// Freeze game so player can see what's happening, but only for actions that change position
		const timing = isBracketObject(stack[0].commandID) ? 0 : this.timing
		this.timer = setTimeout(() => {
			this.timer = undefined
			this.executeStackItem(stack, callbackStacks)
		}, timing)
	}

	// Execute a stack item. Returns true if player enters win condition
	executeStackItem(stack: Stack, callbackStacks: Stack[]) {
		const stackItem = stack[0]
		// this.debugStackItem(stackItem)
		// console.log('executing command:', stackItem.commandID, this.ossiePos)

		this.eventHandler(StackEvent.executeCommand, stackItem.objectRef)
		// For loops prepend the current stack to callbackStacks and call cueStackItem with the for stack:
		// cueStackItem(forStack, [currentStack, ...callbackStacks])
		// Everytime this happens, the counter of the forloop updates and when it reaches 0, we continue
		// with the currentStack
		if (stackItem.commandID !== 'for') {
			stack.shift()
		}

		// callback for the step commands, so that the animation can complete before
		// moving on to the next command
		const onArrival = () => this.cueStackItem(stack, callbackStacks)

		switch (stackItem.commandID) {
			case 'if':
				if (this.conditional(stackItem.condition)) {
					callbackStacks.unshift(stack)
					return this.cueStackItem(stackItem.do, callbackStacks)
				}
				break

			case 'else':
				const ifObject = getStackItem(stackItem.blockRef, this.stack || [])
				if (!ifObject || ifObject.commandID !== 'if') { break }
				// console.log('found ifobject for else:', ifObject)
				if (this.conditional(ifObject.condition) === false) {
					callbackStacks.unshift(stack)
					return this.cueStackItem(stackItem.do, callbackStacks)
				}
				break

			case 'for':
				return this.executeFor(stackItem, stack, callbackStacks)

			case 'skipPixles':
				return this.stepPixles(stackItem.pixles, false, onArrival)

			case 'step':
				this.step()
				break

			case 'stepPixles':
				return this.stepPixles(stackItem.pixles, true, onArrival)

			case 'stepPixlesBack':
				return this.stepPixles(-stackItem.pixles, true, onArrival)

			case 'turnL':
				this.turnL()
				break
			case 'turnR':
				this.turnR()
				break

			case 'turnDegrees':
				this.turnDegrees(stackItem.degrees)
				break

			case 'close':
				return this.stackEnd(true)

			default:
				console.log('skip command', stackItem.commandID)
		}

		return this.cueStackItem(stack, callbackStacks)
	}
}
