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

function activate(id, user) {
	GameManager.Entities.forEach((entity) => {
		if (entity.ID === id) {
			entity.activate(user)
		}
	})
}

function addEntity(entity, mapName) {
	if (mapName) {
		getEnts(mapName).add(entity)
	} else {
		getCurEnts().add(entity)
	}
	GameManager.Entities.add(entity)
}

function slashEffect(pos, dir) {
	const effect = document.createElement('div')
	effectsDisplay.appendChild(effect)

	fillElement(effect, pos)
	let curFrame = 0
	let rotation = Math.rad2deg(Math.atan2(dir.dy, dir.dx)) + 90

	effect.style.transform = `rotate(${rotation}deg)`
	effect.classList.add('effect')

	effect.style.backgroundImage = `url(img/effects/Slash/Slash_${curFrame++}.png)`
	const interval = setInterval(() => {
		effect.style.backgroundImage = `url(img/effects/Slash/Slash_${curFrame++}.png)`
		if (curFrame > 8) {
			effect.remove()
			clearInterval(interval)
		}
	}, 20)

}

// Entities

class Entity {
	constructor(pos, col = Collision.Solid, dir = Directions.South) {
		this.Pos = new Pos(pos.X, pos.Y)
		this.Col = col
		this.Dir = dir
		this.Sprite = 0
	}

	replace(newEntity) {
		GameManager.Maps.forEach((map) => {
			const deleted = map.Entities.delete(this)
			if (deleted) {
				map.Entities.add(newEntity)
			}
		})
		GameManager.Entities.delete(this)
		GameManager.Entities.add(newEntity)
		delete this
	}

	delete() {
		getCurEnts().delete(this)
		GameManager.Entities.delete(this)
		delete this
	}

	update() {
		return
	}

	onUse(user) {
		return
	}

	activate(user) {
		return
	}
}

class Chest extends Entity {
	constructor(pos, content, quantity = 1) {
		super(pos)
		this.Content = content
		this.Quantity = quantity
		this.Opened = false
	}

	onUse(user) {
		if (this.Opened) {
			dialogBox.showText('The chest is already opened.')
			return
		}

		dialogBox.showText(`You\'ve got ${this.Quantity <= 1 ? 'a' : this.Quantity} ${this.Content + (this.Quantity <= 1 ? '' : 's')}!`)

		if (user.Inventory[this.Content]) {
			user.Inventory[this.Content] += this.Quantity
		} else {
			user.Inventory[this.Content] = this.Quantity
		}

		switch (this.Content) {
			case 'sword':
				user.Sprite += 1
				break;
			case 'shield':
				user.Sprite += 2
				break;
		}

		this.Sprite++
		this.Opened = true
	}
}

class AreaTrigger extends Entity {
	constructor(pos, map, endX, endY) {
		super(pos)
		this.Map = map
		this.EndX = endX
		this.EndY = endY
	}

	trigger(user) {
		if (GameManager.Maps.has(this.Map)) {
			GameManager.Maps.get(this.Map).Entities.add(user)
			user.Pos.setPos(this.EndX, this.EndY)
			loadMap(this.Map)
		}
	}
}

class Teleporter extends Entity {
	constructor(pos, endX, endY) {
		super(pos)
		this.EndX = endX
		this.EndY = endY
	}

	trigger(user) {
		user.Pos.setPos(this.EndX, this.EndY)
	}
}

class Spike extends Teleporter {
	constructor(pos, endX, endY) {
		super(pos)
		this.EndX = endX
		this.EndY = endY
	}

	trigger(user) {
		user.takeDamage(1, this)
		super.trigger(user)
	}
}

class Door extends Entity {
	constructor(pos, id, map, endX, endY) {
		super(pos)
		this.ID = id
		this.Map = map
		this.EndX = endX
		this.EndY = endY
	}

	activate() {
		this.replace(new AreaTrigger(this.Pos, this.Map, this.EndX, this.EndY))
	}
}

class Heart extends Entity {
	constructor(pos) {
		super(pos, Collision.Transparent)
	}

	trigger(user) {
		user.takeDamage(-1, this)
		this.delete()
	}
}

class Button extends Entity {
	constructor(pos, id) {
		super(pos)
		this.ID = id
		this.Pressed = false
	}

	onUse(user) {
		if (this.Pressed) {
			dialogBox.showText('The button is already pressed.')
			return
		}

		dialogBox.showText('You pressed the button.')

		activate(this.ID, user)

		this.Sprite++
		this.Pressed = true
	}
}

class Bomb extends Entity {
	constructor(pos) {
		super(pos, Collision.Transparent)
		this.timeout = setTimeout(() => {
			this.explode()
		}, 3 * 1000);
	}

	explode() {
		let entities = new Set()
		Object.entries(Directions).forEach(([_, dir]) => {
			const pos = new Pos(this.Pos.X + dir.dx, this.Pos.Y + dir.dy)
			const ents = getEntities(pos, [])
			if (ents) {
				entities = entities.union(ents)
			}
			slashEffect(pos, dir)
		})

		entities.forEach(entity => {
			if ((entity instanceof NPC))
				entity.takeDamage(2, this)
		})

		entities = getEntities(this.Pos, [])
		if (entities) {
			entities.forEach(entity => {
				if ((entity instanceof NPC))
					entity.takeDamage(3, this)
			})
		}

		this.delete()
		drawEntities()
	}
}

// NPC

class NPC extends Entity {
	constructor(pos, health = 3, damage = 1, dir = Directions.South) {
		super(pos, Collision.Solid, dir)
		this.Health = (health instanceof Health) ? health : new Health(health, health)
		this.Damage = damage
		this.Stunned = false
		this.Dead = false
	}

	triggerEvents(entities, ...args) {
		return
	}

	move(dir) {
		const isPlayer = (this instanceof Player)

		if (this.InTrigger)
			return

		const map = getCollisionMap()

		const nextPos = new Pos(this.Pos.X + dir.dx, this.Pos.Y + dir.dy)

		if (getObjects(nextPos)) {
			if (!getObjects(new Pos(nextPos.X, this.Pos.Y))) {
				nextPos.Y = this.Pos.Y
			}
			if (!getObjects(new Pos(this.Pos.X, nextPos.Y))) {
				nextPos.X = this.Pos.X
			}
		}

		if (!isPlayer) {
			if (dir == Directions.East) {
				this.Mirrored = false
			}
			else if (dir == Directions.West) {
				this.Mirrored = true
			}

			this.Dir = dir
		}

		drawEntities()

		const entities = getEntities(nextPos)
		if (entities) {
			this.triggerEvents(entities, dir)
			return
		}

		const tEntities = getEntities(nextPos, [Collision.Transparent], false)
		if (tEntities) {
			this.triggerEvents(tEntities, dir)
		}

		if (this.Stunned && !isPlayer)
			return

		if (!this.Pos.isValidDiagonal(map, dir)) return
		// if (getObjects(new Pos(nextPos.X, this.Pos.Y)) && getObjects(new Pos(this.Pos.X, nextPos.Y))) return

		if (Pos.compare(nextPos, this.Pos) || !nextPos.isValid(map)) return

		this.Pos.setPos(nextPos)

		drawEntities()
	}

	moveTowards(pos) {
		const path = bfs(getCollisionMap(), this.Pos, pos)
		if (path && path.length > 0) {
			const move = path[0]
			this.move(move)
		}
	}

	onDeath(attacker) {
		this.delete()
	}

	attack(dir) {
		const isPlayer = (this instanceof Player)
		setTimeout(() => {
			if (this.AttackCooldown || !this)
				return

			const attackPos = new Pos(this.Pos.X + dir.dx, this.Pos.Y + dir.dy)
			const entities = getEntities(attackPos)

			slashEffect(attackPos, dir)

			if (entities) {
				entities.forEach(entity => {
					if (entity && entity.takeDamage && typeof entity.takeDamage === 'function') {
						entity.takeDamage(this.Damage, this)
					}
				});
			}

			this.AttackCooldown = true
			setTimeout(() => {
				this.AttackCooldown = false
			}, isPlayer ? 10 : this.Damage * 1000);
		}, isPlayer ? 0 : 100)
	}

	takeDamage(damage, attacker = null) {
		if (this.Stunned || this.Dead)
			return

		this.Health.Health = Math.clamp(this.Health.Health - damage, 0, this.Health.MaxHealth)

		this.Stunned = true
		setTimeout(() => {
			this.Stunned = false
			if (this.Health.Health <= 0) {
				this.Dead = true
				this.onDeath(attacker)
			}
			drawEntities()
		}, Math.abs(damage) * 500)

		drawEntities()
	}
}

class Player extends NPC {
	constructor(pos) {
		super(pos, GameSettings.MaxHealth)
		this.InTrigger = false
		this.Inventory = {}
	}

	triggerEvents(entities, ...args) {
		entities.forEach(entity => {
			if (entity.trigger) {
				this.InTrigger = true
				entity.trigger(this)
				this.InTrigger = false
			}
		});
		super.triggerEvents(entities, ...args)
	}

	use(dir) {
		const usePos = new Pos(this.Pos.X + dir.dx, this.Pos.Y + dir.dy)
		const entities = getEntities(usePos, [])

		if (entities) {
			entities.forEach(entity => {
				if (entity && entity.onUse && typeof entity.onUse === 'function') {
					entity.onUse(this)
				}
			});
		}
		drawEntities()
	}

	onDeath(attacker) {
		location.reload()
	}

	giveSword() {
		this.Inventory.sword = 1
		this.Sprite += 1
	}

	giveShield() {
		this.Inventory.shield = 1
		this.Sprite += 2
	}

	move(dir) {
		super.move(dir)
	}

	bomb() {
		if (this.Inventory.bomb && this.Inventory.bomb > 0) {
			addEntity(new Bomb(this.Pos))
			this.Inventory.bomb--
		}
	}
}

class Bush extends NPC {
	constructor(pos, map, endX, endY) {
		super(pos, 1)
		this.Map = map
		this.EndX = endX
		this.EndY = endY
	}

	onDeath() {
		this.replace(new AreaTrigger(this.Pos, this.Map, this.EndX, this.EndY))
	}
}

class Mirror extends NPC {
	constructor(pos) {
		super(pos, 1)
	}

	onDeath() {
		const right = getEntities(new Pos(this.Pos.X + 1, this.Pos.Y))
		const left = getEntities(new Pos(this.Pos.X - 1, this.Pos.Y))
		const up = getEntities(new Pos(this.Pos.X, this.Pos.Y - 1))
		const down = getEntities(new Pos(this.Pos.X, this.Pos.Y + 1))

		let entities = new Set()

		if (right) entities = entities.union(right)
		if (left) entities = entities.union(left)
		if (up) entities = entities.union(up)
		if (down) entities = entities.union(down)

		entities.forEach(entity => {
			if ((entity instanceof Mirror))
				entity.takeDamage(1, this)
		})

		const evil = getCurEnt(Evil)
		if (evil && !evil.Active) {
			evil.Active = true
		}

		super.onDeath()
	}
}

class CrackedWall extends NPC {
	constructor(pos) {
		super(pos, 1)
	}

	takeDamage(damage, attacker) {
		if ((attacker instanceof Bomb)) {
			super.takeDamage(damage, attacker)
		}
	}
}

// Enemy

class Enemy extends NPC {
	constructor(pos, health = new Health(3, 3), damage = 1, dir = Directions.South) {
		super(pos, health, damage, dir)
		this.MoveFrames = 1
		this.MoveOffset = Math.round(Math.random() * 10)
	}

	triggerEvents(entities, ...args) {
		entities.forEach(entity => {
			if ((entity instanceof Player)) {
				this.attack(args[0])
			}
		});
		super.triggerEvents(entities, ...args)
	}

	update() {
		if ((this.MoveOffset + GameManager.TickCount) % this.MoveFrames === 0) {
			this.moveTowards(player.Pos)
		}
	}
}

class Zombie extends Enemy {
	constructor(pos) {
		super(pos, 3)
		this.MoveFrames = 3
	}
}

class Evil extends Enemy {
	constructor(pos) {
		super(pos, 5, 2)
		this.MoveFrames = 2
		this.Active = false
	}

	move(dir) {
		if (this.Active) {
			super.move(dir)
		}
	}

	takeDamage(damage, attacker = null) {
		let newPos = null
		do {
			const tpX = Math.round(Math.random() * (MapSettings.Width - 1))
			const tpY = Math.round(Math.random() * (MapSettings.Width - 1))
			newPos = new Pos(tpX, tpY)
		} while (!newPos.isValid(getCollisionMap()));
		this.Pos.setPos(newPos)
		super.takeDamage(damage, attacker)
	}

	onDeath() {
		activate('mirror_doors')
		super.onDeath()
	}
}
