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

const MapSettings = {
	Maps: ['start', 'sword_maze', 'shield_dungeon', 'plain_01', 'village', 'castle', 'mirror_room'],
	Width: 16,
	Height: 16,
	GridSize: 0,
	CellSize: 0,
	CurMap: '',
	WorldName: 'Rigon',
}

const GameSettings = {
	TPS: 1000 / 5,
	MaxHealth: 5,
	ValidKeys: ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyE', 'Space', 'KeyQ']
}

const GameManager = {
	Entities: new Set(),
	TickCount: 0,
	Maps: new Map(),
	MousePos: new Pos(0, 0)
}
