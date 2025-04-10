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

import { Pos, Health, Collision, Directions } from "./classes.js";
import { bfs } from "./bfs.js";
import { MapSettings, GameManager, GameSettings } from "./manager.js"
import { drawEntities } from "./renderer.js";
import { getCollisionMap, loadMap } from "./maps.js";
import { fillElement } from "./utils.js";

export function activate(id, user) {
	GameManager.Entities.forEach((entity) => {
		if (entity.ID === id) {
			entity.activate(user)
		}
	})
}

export function slashEffect(pos, dir) {
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

export class Entity {
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
		Entity.getCurEnts().delete(this)
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

	static getEnts(map) {
		return GameManager.Maps.get(map).Entities
	}

	static getCurEnt(type) {
		const ents = Array.from(Entity.getCurEnts())
		if (Array.isArray(ents)) {
			return ents.find(entity => entity instanceof type)
		}
	}

	static getCurEnts() {
		return this.getEnts(MapSettings.CurMap)
	}

	static getEntities(pos, filters = [Collision.Transparent], filterOut = true) {
		if (pos.X >= MapSettings.Width || pos.Y >= MapSettings.Height || pos.X < 0 || pos.Y < 0) return null

		const entities = Entity.getCurEnts().filter(entity => ((filters.includes(entity.Col)) != filterOut) && entity.Pos.compare(pos));

		return entities.size > 0 ? entities : null
	}

	static addEntity(entity, mapName) {
		if (mapName) {
			this.getEnts(mapName).add(entity)
		} else {
			this.getCurEnts().add(entity)
		}
		GameManager.Entities.add(entity)
	}
}

export class Chest extends Entity {
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

		if (!user || !user.giveItems) {
			return
		}

		switch (this.Content) {
			case 'sword':
				user.giveSword()
				break
			case 'shield':
				user.giveShield()
				break
			default:
				user.giveItems(this.Content, this.Quantity)
				break
		}


		this.Sprite++
		this.Opened = true
	}
}

export class AreaTrigger extends Entity {
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

export class Teleporter extends Entity {
	constructor(pos, endX, endY) {
		super(pos)
		this.EndX = endX
		this.EndY = endY
	}

	trigger(user) {
		user.Pos.setPos(this.EndX, this.EndY)
	}
}

export class Spike extends Teleporter {
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

export class Door extends Entity {
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

export class Heart extends Entity {
	constructor(pos) {
		super(pos, Collision.Transparent)
	}

	trigger(user) {
		user.takeDamage(-1, this)
		this.delete()
	}
}

export class Button extends Entity {
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

export class Bomb extends Entity {
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
			const ents = Entity.getEntities(pos, [])
			if (ents) {
				entities = entities.union(ents)
			}
			slashEffect(pos, dir)
		})

		entities.forEach(entity => {
			if ((entity instanceof NPC))
				entity.takeDamage(2, this)
		})

		entities = Entity.getEntities(this.Pos, [])
		if (entities) {
			entities.forEach(entity => {
				if ((entity instanceof NPC))
					entity.takeDamage(3, this)
			})
		}

		this.delete()
		drawEntities()
	}

	disable() {
		clearTimeout(this.timeout)
	}
}

// NPC

export class NPC extends Entity {
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

		if (nextPos.getObjects()) {
			if (!new Pos(nextPos.X, this.Pos.Y).getObjects()) {
				nextPos.Y = this.Pos.Y
			}
			if (!new Pos(this.Pos.X, nextPos.Y).getObjects()) {
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

		const entities = Entity.getEntities(nextPos)
		if (entities) {
			this.triggerEvents(entities, dir)
			return
		}

		const tEntities = Entity.getEntities(nextPos, [Collision.Transparent], false)
		if (tEntities) {
			this.triggerEvents(tEntities, dir)
		}

		if (this.Stunned && !isPlayer)
			return

		if (!this.Pos.isValidDiagonal(map, dir)) return
		// if (getObjects(new Pos(nextPos.X, this.Pos.Y)) && getObjects(new Pos(this.Pos.X, nextPos.Y))) return

		if (nextPos.compare(this.Pos) || !nextPos.isValid(map)) return

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
			const entities = Entity.getEntities(attackPos)

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

export class Player extends NPC {
	constructor(pos) {
		super(pos, GameSettings.MaxHealth)
		this.InTrigger = false
		this.Inventory = {}
		this.Mobile = false
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
		const entities = Entity.getEntities(usePos, [])

		if (entities) {
			entities.forEach(entity => {
				if (entity && entity.onUse && typeof entity.onUse === 'function') {
					entity.onUse(this)
				}
			});
		}
		drawEntities()
	}

	attack(dir) {
		if (this.Inventory.hasOwnProperty('sword')) {
			super.attack(dir)
		}
	}

	onDeath(attacker) {
		location.reload()
	}

	giveSword() {
		if (this.Inventory.sword >= 1 && (this.Sprite == 1 || this.Sprite == 3)) return
		this.Inventory.sword = 1
		this.Sprite += 1
	}

	giveShield() {
		if (this.Inventory.shield >= 1 && (this.Sprite == 2 || this.Sprite == 3)) return
		this.Inventory.shield = 1
		this.Sprite += 2
	}

	giveItems(item, quantity) {
		if (this.Inventory[item]) {
			this.Inventory[item] += quantity
		} else {
			this.Inventory[item] = quantity
		}
	}

	move(dir) {
		super.move(dir)
		if (this.Mobile) {
			this.Dir = dir
			switch (dir) {
				case Directions.East:
					this.Mirrored = false
					break;

				case Directions.West:
					this.Mirrored = true
					break;
			}
		}
	}

	bomb() {
		if (this.Inventory.bomb && this.Inventory.bomb > 0) {
			Entity.addEntity(new Bomb(this.Pos))
			this.Inventory.bomb--
		}
	}

	reload() {
		const pPos = Pos.posToScreen(this.Pos)
		pPos.X += MapSettings.CellSize / 2
		pPos.Y += MapSettings.CellSize / 2

		if (!this.Mobile) {
			const relPos = new Pos(GameManager.MousePos.X - pPos.X, GameManager.MousePos.Y - pPos.Y)

			if (relPos.X > 0) {
				this.Mirrored = false
			}
			else if (relPos.X < 0) {
				this.Mirrored = true
			}

			if (Math.abs(relPos.X) > Math.abs(relPos.Y)) {
				if (relPos.X > 0)
					this.Dir = Directions.East
				else if (relPos.X < 0)
					this.Dir = Directions.West
			} else if (Math.abs(relPos.X) < Math.abs(relPos.Y)) {
				if (relPos.Y > 0)
					this.Dir = Directions.South
				else if (relPos.Y < 0)
					this.Dir = Directions.North
			}
		}

		const evil = Entity.getCurEnt(Evil)
		if (evil && !evil.Active) {
			evil.reload()
		}
		drawEntities()
	}
}

export class Bush extends NPC {
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

export class Mirror extends NPC {
	constructor(pos) {
		super(pos, 1)
	}

	onDeath() {
		const right = Entity.getEntities(new Pos(this.Pos.X + 1, this.Pos.Y))
		const left = Entity.getEntities(new Pos(this.Pos.X - 1, this.Pos.Y))
		const up = Entity.getEntities(new Pos(this.Pos.X, this.Pos.Y - 1))
		const down = Entity.getEntities(new Pos(this.Pos.X, this.Pos.Y + 1))

		let entities = new Set()

		if (right) entities = entities.union(right)
		if (left) entities = entities.union(left)
		if (up) entities = entities.union(up)
		if (down) entities = entities.union(down)

		entities.forEach(entity => {
			if ((entity instanceof Mirror))
				entity.takeDamage(1, this)
		})

		const evil = Entity.getCurEnt(Evil)
		if (evil && !evil.Active) {
			evil.Active = true
		}

		super.onDeath()
	}
}

export class CrackedWall extends NPC {
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

export class Enemy extends NPC {
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
			const player = Entity.getCurEnt(Player)
			this.moveTowards(player.Pos)
		}
	}
}

export class Zombie extends Enemy {
	constructor(pos) {
		super(pos, 3)
		this.MoveFrames = 3
	}
}

export class Evil extends Enemy {
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

	reload() {
		const player = Entity.getCurEnt(Player)
		this.Pos.setPos(player.Pos.X, (MapSettings.Height - 1) - player.Pos.Y)
		this.Dir = player.Dir
		this.Mirrored = player.Mirrored
		if (this.Dir === Directions.North)
			this.Dir = Directions.South
		else if (this.Dir === Directions.South)
			this.Dir = Directions.North
	}
}
