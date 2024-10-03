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

import { Entity, Player } from "./entities.js"
import { loadMapsJSONs, loadMap } from "./maps.js"
import { GameManager, MapSettings, GameSettings } from "./manager.js"
import { drawGrid } from "./renderer.js"
import { Pos, Directions } from "./classes.js"
import { drawEntities, resizeGUI, drawMap } from "./renderer.js"

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

		player.reload()
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
	player.reload()
}

onresize = () => {
	drawMap()
	drawEntities()
	resizeGUI()
}

function update() {
	if (!player) return

	health.innerHTML = ''
	for (let i = 1; i <= player.Health.MaxHealth; i++) {
		const heart = document.createElement('img')
		heart.src = 'img/ui/empty_heart.png'
		if (i <= player.Health.Health)
			heart.src = 'img/ui/heart.png'
		health.appendChild(heart)
	}

	bombCounter.innerHTML = player.Inventory.bomb ? player.Inventory.bomb : 0

	Entity.getCurEnts().forEach((entity) => {
		entity.update()
	})

	GameManager.TickCount++
}

var player
function main(...args) {
	GameManager.Maps = loadMapsJSONs(MapSettings.Maps)
	drawGrid()
	loadMap('start')
	dialogBox.showText('You woke up in a field without anything!')
	player = new Player(new Pos(7, 7))
	// player.giveSword()
	// player.giveShield()
	// player.giveItems("bomb", 10)
	Entity.getCurEnts().add(player)
	drawEntities()
	resizeGUI()
	setInterval(() => {
		update()
	}, GameSettings.TPS)
}

main()
