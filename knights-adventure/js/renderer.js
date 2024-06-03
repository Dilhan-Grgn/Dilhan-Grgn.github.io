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

function drawGrid() {
	displayGrid = []
	for (let x = 0; x < MapSettings.Width; x++) {
		const cols = []
		for (let y = 0; y < MapSettings.Width; y++) {
			const cell = document.createElement('div')
			display.appendChild(cell)
			cols.push(cell)
		}
		displayGrid.push(cols)
	}
}

function drawMap() {
	let x = 0
	ObjectsGrid.forEach(objectsCol => {
		let y = 0
		objectsCol.forEach(object => {
			const cell = displayGrid[x][y]
			fillElement(cell, new Pos(x, y), object)
			y++
		})
		x++
	})

	gui.style.position = 'absolute'
	gui.style.left = `${(window.innerWidth - MapSettings.GridSize) / 2}px`
	gui.style.top = `${MapSettings.GridSize}px`
}

function reloadEntities() {
	EntitiesGrid.empty()
	for (let col = 0; col < MapSettings.Height; col++) {
		const entitiesCol = []
		EntitiesGrid.push(entitiesCol)
	}

	getCurEnts().forEach(entity => {
		EntitiesGrid[entity.Pos.X][entity.Pos.Y] = entity
	})

	drawEntities()
}

function drawEntities() {
	const children = Array.prototype.slice.call(entitiesDisplay.children)
	children.forEach(child => {
		let valid = false
		getCurEnts().forEach(entity => {
			if (child.id == entity.uniqueID()) {
				valid = true
			}
		})

		if (!valid) {
			child.remove()
		}
	})

	getCurEnts().forEach(entity => {
		let element = document.getElementById(entity.uniqueID())
		if (!element) {
			element = document.createElement("div")
			element.id = entity.uniqueID()
			entitiesDisplay.appendChild(element)
		}

		fillElement(element, entity.Pos, entity)
	})
}
