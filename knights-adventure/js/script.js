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
}
