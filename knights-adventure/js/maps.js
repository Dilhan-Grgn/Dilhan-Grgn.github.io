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

class Grid {
	constructor(map, entities, text) {
		this.Map = map
		this.Entities = entities || new Set()
		this.Text = text || ''
	}
}

function getCollisionMap() {
	const width = MapSettings.Width
	const height = MapSettings.Height

	const walls = []
	for (let x = 0; x < width; x++) {
		const col = []
		for (let y = 0; y < height; y++) {
			if (!getObjects(new Pos(x, y))) {
				col.push(0)
			} else {
				col.push(1)
			}
		}
		walls.push(col)
	}

	return walls
}

function parseEntities(entities) {
	const newEntities = new Set()
	entities.forEach(entity => {
		const classRef = eval(entity[0])
		if (!classRef) {
			throw Error(`${entity[0]} isn't a valid entity class name!`)
		}

		const pos = new Pos(entity[1], entity[2])
		const infos = [pos]
		const compInfos = entity.slice(3)
		if (compInfos.length > 0) {
			infos.push(...compInfos)
		}
		const newEntity = new classRef(...infos)

		if (newEntity != null) {
			GameManager.Entities.add(newEntity)
			newEntities.add(newEntity);
		}
	})

	return newEntities
}

function loadMapsJSONs(files) {
	const tmpMaps = new Map()

	files.forEach(file => {
		const request = new XMLHttpRequest()
		request.open('GET', `./maps/${file}.json`, false)
		request.send(null);

		if (request.status === 200) {
			const json = JSON.parse(request.response)
			const entities = parseEntities(json.Entities)
			const text = json.Text ? json.Text.evalVariables() : ''
			tmpMaps.set(file, new Grid(json.Map, entities, text))
		}
	})

	return tmpMaps
}

function loadMap(mapName) {
	MapSettings.CurMap = mapName
	const map = GameManager.Maps.get(mapName).Map

	ObjectsGrid.empty()

	for (let x = 0; x < MapSettings.Width; x++) {
		const objectsCol = []
		for (let y = 0; y < MapSettings.Height; y++) {
			const tileString = map[y][x]

			const tileObject = toTile(tileString)

			objectsCol.push(tileObject)
		}
		ObjectsGrid.push(objectsCol)
	}

	if (GameManager.Maps.get(mapName).Text) {
		dialogBox.showText(GameManager.Maps.get(mapName).Text)
	}

	drawMap()
	drawEntities()
}
