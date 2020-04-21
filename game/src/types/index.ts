import OssieGame from '~/ossie_game'
import { SSKey } from './spritesheets';

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

export interface PhaserLevel extends Phaser.Scene {
	levelName: string
	objects: string[]
	modals: SSKey[]
}
