import OssieGame from '~/ossie_game'

declare global {
	interface Window {
		activeLevel: string
		debug?: boolean
		init() : void
		ossieGame: OssieGame
		game: any
		gameHeight: number
		gameScale: number
		gameWidth: number
		selectLevel(levelName: string): void
	}
}
