class Tile {
	constructor(col = Collision.Solid) {
		this.Col = col
	}
}

class Wall extends Tile {
	constructor() {
		super(Collision.Solid)
	}
}

class Grass extends Tile {
	constructor() {
		super(Collision.Transparent)
	}
}

class CarpetNorth extends Tile {
	constructor() {
		super(Collision.Transparent)
	}
}

class CarpetSouth extends Tile {
	constructor() {
		super(Collision.Transparent)
	}
}
