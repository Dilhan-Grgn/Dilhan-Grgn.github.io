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

import { Pos } from "./classes.js";

export class MapSettings {
	static Maps = ['start', 'sword_maze', 'shield_dungeon', 'plain_01', 'village', 'castle', 'mirror_room']
	static Width = 16
	static Height = 16
	static GridSize = 0
	static CellSize = 0
	static CurMap = ''
	static WorldName = 'Rigon'
}

export class GameSettings {
	static TPS = 1000 / 5
	static MaxHealth = 5
	static ValidKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyE', 'Space', 'KeyQ']
}

export class GameManager {
	static Entities = new Set()
	static TickCount = 0
	static Maps = new Map()
	static MousePos = new Pos(0, 0)
}
