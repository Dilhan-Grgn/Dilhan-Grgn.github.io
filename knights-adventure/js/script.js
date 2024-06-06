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

const KEY_UPDATE_MAP = new Map()

function KeyUpdates(keycode) {
	if (player) {
		let dir = Directions.None

		if (keycode === 'KeyW' && keycode !== 'KeyS')
			dir = Directions.North
		if (keycode === 'KeyS' && keycode !== 'KeyW')
			dir = Directions.South
		if (keycode === 'KeyA' && keycode !== 'KeyD')
			dir = Directions.West
		if (keycode === 'KeyD' && keycode !== 'KeyA')
			dir = Directions.East

		if (dir != Directions.None)
			player.move(dir)

		if (keycode === 'KeyE')
			player.use(player.Dir)
		if (keycode === 'Space' && player.Sword)
			player.attack(player.Dir)
		if (keycode === 'KeyQ')
			player.bomb()

		updatePlayer()
	}
}

onkeydown = (event) => {
	if (GameSettings.ValidKeys.includes(event.code) && !KEY_UPDATE_MAP.has(event.code)) {
		KeyUpdates(event.code)
		KEY_UPDATE_MAP.set(event.code, setInterval(() => KeyUpdates(event.code), GameSettings.TPS))
	}
}

onkeyup = (event) => {
	if (GameSettings.ValidKeys.includes(event.code) && KEY_UPDATE_MAP.has(event.code)) {
		clearInterval(KEY_UPDATE_MAP.get(event.code))
		KEY_UPDATE_MAP.delete(event.code)
	}
}

onclick = (event) => {
	if (player.Inventory.hasOwnProperty('sword'))
		player.attack(player.Dir)
}

onmousemove = (event) => {
	if (!player) return

	GameManager.MousePos.setPos(event.clientX, event.clientY)
	updatePlayer()
}

function updatePlayer() {
	const pPos = posToScreen(player.Pos)
	pPos.X += MapSettings.CellSize / 2
	pPos.Y += MapSettings.CellSize / 2

	const relPos = new Pos(GameManager.MousePos.X - pPos.X, GameManager.MousePos.Y - pPos.Y)

	if (relPos.X > 0) {
		player.Mirrored = false
	}
	else if (relPos.X < 0) {
		player.Mirrored = true
	}

	if (Math.abs(relPos.X) > Math.abs(relPos.Y)) {
		if (relPos.X > 0)
			player.Dir = Directions.East
		else if (relPos.X < 0)
			player.Dir = Directions.West
	} else if (Math.abs(relPos.X) < Math.abs(relPos.Y)) {
		if (relPos.Y > 0)
			player.Dir = Directions.South
		else if (relPos.Y < 0)
			player.Dir = Directions.North
	}

	updateEvil()
	drawEntities()
}

function updateEvil() {
	const evil = getCurEnt(Evil)
	if (evil && !evil.Active) {
		evil.Pos.setPos(player.Pos.X, (MapSettings.Height - 1) - player.Pos.Y)
		evil.Dir = player.Dir
		evil.Mirrored = player.Mirrored
		if (evil.Dir === Directions.North)
			evil.Dir = Directions.South
		else if (evil.Dir === Directions.South)
			evil.Dir = Directions.North
	}
}

onresize = () => {
	drawMap()
	drawEntities()
	resizeGUI()
}
