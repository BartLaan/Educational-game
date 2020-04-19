import { Coords } from '~/types/board'

export function cardinalToAngle(cardinal: number) {
	const cardinals = [90, 180, 270, 0]
	const result = cardinals.indexOf(cardinal)
	if (result === -1) {
		console.error('Error trying to get degrees from', cardinal)
		return -1
	}

	return result * 90
}

// Turn the orientation clockwise if clockWise is true, otherwise counterclockwise. Should only be used with cardinals
export function turnClock(orientation: number, clockWise: boolean) {
	return turnDegrees(orientation, (clockWise ? 90 : -90))
}

export function turnDegrees(initDegrees: number, addDegrees: number) {
	let newOrientation = (initDegrees + addDegrees) % 360
	while (newOrientation < 0) {
		newOrientation += 360
	}

	return newOrientation
}

export function coordsToPixle(coords: Coords, pixleSize: number) {
	return {
		x: coords.x * pixleSize,
		y: coords.y * pixleSize,
	}
}
