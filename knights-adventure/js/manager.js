const MapSettings = {
	Maps: ['start', 'sword_maze', 'shield_dungeon', 'plain_01', 'village', 'castle', 'mirror_room'],
	Width: 16,
	Height: 16,
	GridSize: 0,
	CellSize: 0,
	CurMap: '',
	WorldName: 'Aincrad',
}

const GameSettings = {
	TPS: 1000 / 5,
	MaxHealth: 5,
	ValidKeys: ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyE', 'Space']
}

const GameManager = {
	Entities: new Set(),
	TickCount: 0,
	Maps: new Map(),
	MousePos: new Pos(0, 0)
}
