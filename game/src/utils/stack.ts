import { Stack, StackItem, StackItemFor, StackItemIf, StackItemElse } from '~/types/stack'

// Convert the InterPhaser stacklist to a representation that the ossiegame stack can work with nicely.
export function getStackRepresentation(stack: any[]): Stack[] {
	// Recursive inner function
	let stackRepresentationInner = function(startIndex: number) {
		let result = [] as Stack
		let ifObject = undefined

		for (let i = startIndex; i < stack.length; i++) {
			let object = stack[i]
			let stackItem = object.getData('command')
			if (stackItem) {
				stackItem.stackIndex = i
			}
			let commandID = object.getData('commandID')

			switch (commandID) {
				case undefined:
					// Bracketside/brackettop
					break

				case 'blockend':
					// End of this part of the stack, return the results
					return [result, i]

				case 'if':
					ifObject = stackItem.stackIndex
				case 'else':
					stackItem.blockRef = commandID === 'else' ? ifObject : undefined // fallthrough of if case
				case 'for':
					let [newStack, newI] = stackRepresentationInner(i + 1) // RECURSION
					if (typeof newI !== 'number') {
						return [newStack]
					}
					stackItem.do = newStack
					i = newI

				default:
					result.push(stackItem)
			}
		}

		return result
	}
	// Init with 0 to start at the top of command stack
	return stackRepresentationInner(0)
}

export function isNestStackItem(stackItem: StackItem): stackItem is StackItemFor | StackItemIf | StackItemElse {
	return stackItem.commandID === 'for' || stackItem.commandID === 'if' || stackItem.commandID === 'else'
}

export function getStackItem(stackIndex: number, stack: Stack): StackItem | undefined {
	for (let object of stack) {
		if (object.stackIndex === stackIndex) {
			return object
		}

		if (isNestStackItem(object)) {
			let foundObject = getStackItem(stackIndex, object.do)
			if (foundObject !== undefined) {
				return foundObject
			}
		}
	}

	return undefined
}
