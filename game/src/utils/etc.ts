// Makes deep copy of whatever object is inside.
// WARNING!! Does NOT check for self-references/loops or check if property is a
// prototype property
export function deepCopy(object: any) {
	if (object === null) { return null }

	let result = {} as any | Array<any>
	// array
	if (object.length !== undefined) {
		result = []
		for (let item of object) {
			let newItem = (typeof item == 'object') ? deepCopy(item) : item
			result.push(newItem)
		}
		return result
	}

	for (let key in object) {
		let item = object[key]
		let newItem = (typeof item == 'object') ? deepCopy(item) : item
		result[key] = newItem
	}
	return result
}
