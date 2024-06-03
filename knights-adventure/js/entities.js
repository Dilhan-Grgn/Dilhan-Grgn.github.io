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

function addEntity(mapName, entity) {
	getEnts(mapName).add(entity)
	GameManager.Entities.add(entity)
}

// Entities

class Entity {
	constructor(pos, col = Collision.Solid, dir = Directions.South) {
		this.Pos = pos
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
		EntitiesGrid[this.Pos.X][this.Pos.Y] = newEntity
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

// NPC

class NPC extends Entity {
	constructor(pos, health = 3, damage = 1, dir = Directions.South) {
		super(pos, Collision.Solid, dir)
		this.Health = (health instanceof Health) ? health : new Health(health, health)
		this.Damage = damage
		this.Stunned = false
		this.Dead = false
	}

	triggerEvents(objects, ...args) {
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

		const objects = getObjects(nextPos)
		if (objects) {
			this.triggerEvents(objects, dir)
			return
		}

		const tObjects = getObjects(nextPos, [Collision.Transparent], false)
		if (tObjects) {
			this.triggerEvents(tObjects, dir)
		}

		if (this.Stunned && !isPlayer)
			return

		if (!this.Pos.isValidDiagonal(map, dir)) return
		// if (getObjects(new Pos(nextPos.X, this.Pos.Y)) && getObjects(new Pos(this.Pos.X, nextPos.Y))) return

		if (Pos.Equal(nextPos, this.Pos) || !nextPos.isValid(map)) return

		this.Pos.setPos(nextPos)

		reloadEntities()
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
			const entity = getEntity(attackPos)

			const effect = document.createElement('div')
			effectsDisplay.appendChild(effect)

			fillElement(effect, attackPos)
			let curFrame = 0
			let rotation = 0
			switch (dir) {
				case Directions.East:
					rotation = 90
					break;
				case Directions.South:
					rotation = 180
					break;
				case Directions.West:
					rotation = 270
					break;
			}
			effect.style.transform = `rotate(${rotation}deg)`
			effect.classList.add('effect')

			effect.style.backgroundImage = `url(img/effects/Slash/Slash_${curFrame++}.png)`
			const interval = setInterval(() => {
				effect.style.backgroundImage = `url(img/effects/Slash/Slash_${curFrame++}.png)`
				if (curFrame > 8) {
					effect.remove()
					clearInterval(interval)
				}
			}, 10)

			if (entity && entity.takeDamage && typeof entity.takeDamage === 'function') {
				entity.takeDamage(this.Damage, this)
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
			reloadEntities()
		}, Math.abs(damage) * 500)

		reloadEntities()
	}
}

class Player extends NPC {
	constructor(pos) {
		super(pos, GameSettings.MaxHealth)
		this.InTrigger = false
		this.Inventory = {}
	}

	triggerEvents(objects, ...args) {
		if (objects.Entity.trigger) {
			this.InTrigger = true
			objects.Entity.trigger(this)
			this.InTrigger = false
		}
		super.triggerEvents(objects, ...args)
	}

	use(dir) {
		const tileX = this.Pos.X + dir.dx
		const tileY = this.Pos.Y + dir.dy
		const object = EntitiesGrid[tileX][tileY]

		if (object && object.onUse && typeof object.onUse === 'function') {
			object.onUse(this)
			drawEntities()
		}
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
		const right = getEntity(new Pos(this.Pos.X + 1, this.Pos.Y))
		const left = getEntity(new Pos(this.Pos.X - 1, this.Pos.Y))
		const up = getEntity(new Pos(this.Pos.X, this.Pos.Y - 1))
		const down = getEntity(new Pos(this.Pos.X, this.Pos.Y + 1))
		if ((right instanceof Mirror))
			right.takeDamage(1)
		if ((left instanceof Mirror))
			left.takeDamage(1)
		if ((up instanceof Mirror))
			up.takeDamage(1)
		if ((down instanceof Mirror))
			down.takeDamage(1)

		const evil = getCurEnt(Evil)
		if (evil && !evil.Active) {
			evil.Active = true
		}

		//const newDoors = [
		//	new Door(new Pos(7, 0), 'mirror_doors', 'castle', 3, 14),
		//	new Door(new Pos(8, 0), 'mirror_doors', 'castle', 4, 14),
		//	new Door(new Pos(7, 15), 'mirror_doors', 'other_side', 7, 1),
		//	new Door(new Pos(8, 15), 'mirror_doors', 'other_side', 8, 1)
		//]
		//
		//const roomName = 'mirror_room'
		//newDoors.forEach(door => {
		//	const ent = getEntity(door.Pos)
		//	if (ent && !(ent instanceof Door))
		//		ent.replace(door)
		//	else if (!ent)
		//		addEntity(roomName, door)
		//})

		super.onDeath()
	}
}

// Enemy

class Enemy extends NPC {
	constructor(pos, health = new Health(3, 3), damage = 1, dir = Directions.South) {
		super(pos, health, damage, dir)
		this.MoveFrames = 1
		this.MoveOffset = Math.round(Math.random() * 10)
	}

	triggerEvents(objects, ...args) {
		if ((objects.Entity instanceof Player)) {
			this.attack(args[0])
		}
		super.triggerEvents(objects, ...args)
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
