const tick = setInterval(() => {
	update()
}, GameSettings.TPS)

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

	getCurEnts().forEach((entity) => {
		entity.update()
	})

	GameManager.TickCount++
}
