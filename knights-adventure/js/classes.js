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

import { MapSettings } from "./manager.js";
import { Tile } from "./tiles.js";
import { Entity } from "./entities.js";

export class Pos {
	constructor(x, y) {
		this.setPos(x, y)
	}

	toString() {
		return `[X: ${this.X},Y: ${this.Y}]`
	}

	isValid(map) {
		return this.X >= 0 && this.Y >= 0 && this.X < map.length && this.Y < map[0].length && map[this.X][this.Y] === 0;
	}

	isValidDiagonal(map, direction) {
		const newPos = new Pos(this.X + direction.dx, this.Y + direction.dy);

		if (!newPos.isValid(map)) return false;

		if (direction.dx !== 0 && direction.dy !== 0) {
			const adjacent1 = new Pos(this.X + direction.dx, this.Y);
			const adjacent2 = new Pos(this.X, this.Y + direction.dy);

			if (!adjacent1.isValid(map) || !adjacent2.isValid(map)) {
				return false;
			}
		}

		return true;
	}

	getNeighbors(map) {
		const neighbors = []
		for (const dir of Object.values(Directions)) {
			if (this.isValidDiagonal(map, dir)) {
				const neighbor = new Pos(this.X + dir.dx, this.Y + dir.dy)
				neighbor.Dir = dir;
				neighbors.push(neighbor)
			}
		}
		return neighbors;
	}

	setPos(x, y) {
		if (x instanceof Pos) {
			y = x.Y
			x = x.X
		}

		this.X = x
		this.Y = y
	}

	compare(pos2) {
		return this.X === pos2.X && this.Y === pos2.Y
	}

	static posToScreen(pos) {
		return new this(((window.innerWidth - MapSettings.GridSize) / 2) + (MapSettings.CellSize * pos.X), MapSettings.CellSize * pos.Y)
	}

	getObjects(filters = [Collision.Transparent], filterOut = true) {
		if (this.X >= MapSettings.Width || this.Y >= MapSettings.Height || this.X < 0 || this.Y < 0) return null

		const tile = Tile.getTile(this, filters, filterOut)
		const entities = Entity.getEntities(this, filters, filterOut)

		return tile || entities ? { Tile: tile, Entities: entities } : null
	}
}

export class Direction {
	#x
	#y
	constructor(dx, dy) {
		this.#x = dx
		this.#y = dy
	}

	diagonalToLine(curPos, map) {
		let dir1 = null
		let dir2 = null
		const nextPos = new Pos(curPos.X - this.#x, curPos.Y - this.#y)
		if (this.#x != 0 && this.#y != 0) {
			const xPos = new Pos(nextPos.X, curPos.Y)
			const yPos = new Pos(curPos.X, nextPos.Y)
			if (xPos.isValid(map)) {
				if (this.#x > 0) dir1 = Directions.East
				else if (this.#x < 0) dir1 = Directions.West
				if (this.#y > 0) dir2 = Directions.South
				else if (this.#y < 0) dir2 = Directions.North
			} else if (yPos.isValid(map)) {
				if (this.#y > 0) dir1 = Directions.South
				else if (this.#y < 0) dir1 = Directions.North
				if (this.#x > 0) dir2 = Directions.East
				else if (this.#x < 0) dir2 = Directions.West
			}
		}
		if (dir1 && dir2) {
			return [dir1, dir2]
		}
		return [this]
	}

	isDiagonal() {
		return this.#x == 0 || this.#y == 0 ? false : true
	}

	toString() {
		return `[${this.#x},${this.#x}]`
	}

	get dx() { return this.#x }
	set dx(value) { if (value instanceof undefined) { this.#x = value } else throw Error('Cannot edit direction values.') }
	get dy() { return this.#y }
	set dy(value) { if (value instanceof undefined) { this.#y = value } else throw Error('Cannot edit direction values.') }
}

export class Health {
	constructor(health = 3, maxHealth = 3) {
		this.Health = health
		this.MaxHealth = maxHealth
	}
}

export class Directions {
	static None = new Direction(0, 0)
	static West = new Direction(-1, 0)
	static East = new Direction(1, 0)
	static North = new Direction(0, -1)
	static South = new Direction(0, 1)
	static NorthWest = new Direction(-1, -1)
	static SouthWest = new Direction(-1, 1)
	static NorthEast = new Direction(1, -1)
	static SouthEast = new Direction(1, 1)
}

export class Collision {
	static Solid = 0
	static Transparent = 1
}
