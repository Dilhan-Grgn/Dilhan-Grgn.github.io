const Directions = {
	None: new Direction(0, 0),
	West: new Direction(-1, 0),
	East: new Direction(1, 0),
	North: new Direction(0, -1),
	South: new Direction(0, 1),
	NorthWest: new Direction(-1, -1),
	SouthWest: new Direction(-1, 1),
	NorthEast: new Direction(1, -1),
	SouthEast: new Direction(1, 1),
}

const Collision = {
	Solid: 0,
	Transparent: 1,
}

const EntitiesGrid = []
const ObjectsGrid = []
const DisplayGrid = []
