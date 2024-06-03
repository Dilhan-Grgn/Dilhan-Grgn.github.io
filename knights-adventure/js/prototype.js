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
