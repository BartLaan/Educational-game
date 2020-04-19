// Makes deep copy of whatever object is inside.
// WARNING!! Does NOT check for self-references/loops or check if property is a
// prototype property
export function deepCopy(object: any): any | any[] | null {
	if (object === null) { return null }

	// array
	if (object.length !== undefined) {
		const arrayResult = [] as any[]
		for (const item of object) {
			const newItem = (typeof item === 'object') ? deepCopy(item) : item
			arrayResult.push(newItem)
		}
		return arrayResult
	}

	const result = {}
	for (const key in object) {
		if (!object.hasOwnProperty(key)) { continue }

		const item = object[key]
		const newItem = (typeof item === 'object') ? deepCopy(item) : item
		result[key] = newItem
	}
	return result
}
