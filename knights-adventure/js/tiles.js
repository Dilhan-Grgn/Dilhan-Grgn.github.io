/*
MIT License

Copyright (c) 2024 Dilhan-Grgn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { ObjectsGrid } from "./consts.js";
import { MapSettings } from "./manager.js";
import { Collision } from "./classes.js";

export class Tile {
	constructor(col = Collision.Solid, fileType = 'png') {
		this.Col = col
		this.FileType = fileType
	}

	static toTile(tileCharacter) {
		let tile = null

		const tileParams = tileCharacter.split(':')
		const params = tileParams[1] ? tileParams[1].split(';') : []

		if (tileParams)
			tileCharacter = tileParams[0]

		switch (tileCharacter[0]) {
			case 'W':
				tile = new Wall()
				break;
			case 'G':
				tile = new Grass()
				break;
			case 'U':
				tile = new CarpetNorth()
				break;
			case 'D':
				tile = new CarpetSouth()
				break;
		}

		return tile
	}

	static getTile(pos, filters = [Collision.Transparent], filterOut = true) {
		if (pos.X >= MapSettings.Width || pos.Y >= MapSettings.Height || pos.X < 0 || pos.Y < 0) return null

		const object = (ObjectsGrid && ObjectsGrid[pos.X] && ObjectsGrid[pos.X][pos.Y]) ? ObjectsGrid[pos.X][pos.Y] : null

		return object && ((filters.includes(object.Col)) != filterOut) ? object : null
	}
}

export class Wall extends Tile {
	constructor() {
		super(Collision.Solid)
	}
}

export class Grass extends Tile {
	constructor() {
		super(Collision.Transparent)
	}
}

export class CarpetNorth extends Tile {
	constructor() {
		super(Collision.Transparent)
	}
}

export class CarpetSouth extends Tile {
	constructor() {
		super(Collision.Transparent)
	}
}

export class Water extends Tile {
	constructor() {
		super(Collision.Transparent, 'gif')
	}
}
