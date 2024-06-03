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
