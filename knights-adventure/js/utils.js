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

import { MapSettings, GameSettings } from "./manager.js";
import { Tile } from "./tiles.js";
import { Entity } from "./entities.js";
import { Pos } from "./classes.js";

export function fillElement(element, pos, object) {
	MapSettings.CellSize = Math.min(window.innerHeight / MapSettings.Height * 0.8, window.innerWidth / MapSettings.Width * 0.8)
	MapSettings.GridSize = Math.min(MapSettings.CellSize * MapSettings.Width, MapSettings.CellSize * MapSettings.Height)

	element.removeAttribute('class')
	element.removeAttribute('style')

	element.style.position = 'absolute'
	element.style.width = `${MapSettings.CellSize}px`
	element.style.height = `${MapSettings.CellSize}px`
	const screen = Pos.posToScreen(pos)
	element.style.left = `${screen.X}px`
	element.style.top = `${screen.Y}px`
	element.style.backgroundColor = 'transparent'

	element.setAttribute('position', pos.toString())

	if (!object) return
	element.style.transition = GameSettings.TPS + 'ms all'

	if (object instanceof Entity) {
		element.classList.add('entity')
		if (object.Mirrored)
			element.style.transform = 'scaleX(-1)'
		if (object.Stunned)
			element.style.filter = 'invert(1)'

		element.classList.add(object.constructor.name)
		element.style.backgroundImage = `url(img/entities/${object.constructor.name}/${object.Sprite}.png)`
	}

	if (object instanceof Tile) {
		element.classList.add('tile')
		if (object) {
			const tileClass = object.constructor.name
			element.style.backgroundImage = `url(img/tiles/${object.constructor.name}.${object.FileType})`
			element.classList.add(tileClass)
		} else {
			element.style.backgroundImage = ''
		}
	}
}
