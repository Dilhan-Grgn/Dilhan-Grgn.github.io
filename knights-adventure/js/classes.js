class Pos {
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
}

Pos.Equal = function (pos1, pos2) {
	return pos1.X === pos2.X && pos1.Y === pos2.Y
}

class Direction {
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
	set dx(value) { if (value instanceof undefined) {this.#x = value} else throw Error('Cannot edit direction values.') }
	get dy() { return this.#y }
	set dy(value) { if (value instanceof undefined) {this.#y = value} else throw Error('Cannot edit direction values.') }
}

class Health {
	constructor(health = 3, maxHealth = 3) {
		this.Health = health
		this.MaxHealth = maxHealth
	}
}
