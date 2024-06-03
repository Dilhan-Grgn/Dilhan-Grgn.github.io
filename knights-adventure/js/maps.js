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
	reloadEntities()
}
