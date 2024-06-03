String.prototype.evalVariables = function () {
	let tempStr = this
	const matches = tempStr.match(/({.*?})/gm) || []
	matches.forEach(match => {
		const value = eval(match.replace('{', '').replace('}', ''))
		tempStr = tempStr.replace(match, value)
	})
	return tempStr
}

Array.prototype.removeByValue = function (value) {
	return this.splice(this.indexOf(value), 1)[0]
}

Array.prototype.empty = function () {
	return this.splice(0, this.length)
}

{
	let uniqueID = 0
	Object.prototype.uniqueID = function () {
		if (typeof this.__uniqueID === 'undefined') {
			this.__uniqueID = this.constructor.name + ++uniqueID
		}
		return this.__uniqueID
	}
}

{
	let curTimeout = null
	Node.prototype.showText = function (message, index = 0, interval = 50) {
		if (curTimeout) clearInterval(curTimeout)
		if (index === 0)
			this.innerHTML = ''
		if (index < message.length) {
			this.append(message[index++])
			curTimeout = setTimeout(() => this.showText(message, index, interval), interval)
		}
	}
}

Math.clamp = function (x, min = 0, max = 1) {
	return Math.min(Math.max(x, min), max)
}
