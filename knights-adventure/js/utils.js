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

function toTile(tileCharacter) {
	let tile = null

	tileParams = tileCharacter.split(':')
	params = tileParams[1] ? tileParams[1].split(';') : []

	if (tileParams)
		tileCharacter = tileParams[0]

	switch (tileCharacter[0]) {
		case 'W':
			tile = new Wall()
			break;
		case 'G':
			tile = new Grass()
			break;
		case 'U':
			tile = new CarpetNorth()
			break;
		case 'D':
			tile = new CarpetSouth()
			break;
	}

	return tile
}

function getTile(pos, filters = [Collision.Transparent], filterOut = true) {
	if (pos.X >= MapSettings.Width || pos.Y >= MapSettings.Height || pos.X < 0 || pos.Y < 0) return null

	const object = (ObjectsGrid && ObjectsGrid[pos.X] && ObjectsGrid[pos.X][pos.Y]) ? ObjectsGrid[pos.X][pos.Y] : null

	return object && ((filters.includes(object.Col)) != filterOut) ? object : null
}

function getEntities(pos, filters = [Collision.Transparent], filterOut = true) {
	if (pos.X >= MapSettings.Width || pos.Y >= MapSettings.Height || pos.X < 0 || pos.Y < 0) return null

	const entities = getCurEnts().filter(entity => ((filters.includes(entity.Col)) != filterOut) && Pos.compare(entity.Pos, pos));

	return entities.size > 0 ? entities : null
}

function getObjects(pos, filters = [Collision.Transparent], filterOut = true) {
	if (pos.X >= MapSettings.Width || pos.Y >= MapSettings.Height || pos.X < 0 || pos.Y < 0) return null

	const tile = getTile(pos, filters, filterOut)
	const entities = getEntities(pos, filters, filterOut)

	return tile || entities ? { Tile: tile, Entities: entities } : null
}

function getCurEnts() {
	return getEnts(MapSettings.CurMap)
}

function getCurEnt(type) {
	const ents = Array.from(getCurEnts())
	if (Array.isArray(ents)) {
		return ents.find(entity => entity instanceof type)
	}
}

function getEnts(map) {
	return GameManager.Maps.get(map).Entities
}

function posToScreen(pos) {
	return new Pos(((window.innerWidth - MapSettings.GridSize) / 2) + (MapSettings.CellSize * pos.X), MapSettings.CellSize * pos.Y)
}

function fillElement(element, pos, object) {
	MapSettings.CellSize = Math.min(window.innerHeight / MapSettings.Height * 0.8, window.innerWidth / MapSettings.Width * 0.8)
	MapSettings.GridSize = Math.min(MapSettings.CellSize * MapSettings.Width, MapSettings.CellSize * MapSettings.Height)

	element.removeAttribute('class')
	element.removeAttribute('style')

	element.style.position = 'absolute'
	element.style.width = `${MapSettings.CellSize}px`
	element.style.height = `${MapSettings.CellSize}px`
	const screen = posToScreen(pos)
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
			tileClass = object.constructor.name
			element.style.backgroundImage = `url(img/tiles/${object.constructor.name}.${object.FileType})`
		} else {
			element.style.backgroundImage = ''
		}
		element.classList.add(tileClass)
	}
}
