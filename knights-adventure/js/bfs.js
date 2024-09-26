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

export function bfs(map, startPos, endPos) {
	map[startPos.X][startPos.Y] = 0
	map[endPos.X][endPos.Y] = 0
	const queue = []
	const visited = new Set()

	visited.add(startPos.toString())
	queue.push(startPos)
	while (queue.length > 0) {
		const curPos = queue.shift()
		if (curPos.compare(endPos)) {
			return reconstructPath(curPos, map)
		}

		curPos.getNeighbors(map).forEach(nPos => {
			if (!visited.has(nPos.toString())) {
				visited.add(nPos.toString())
				nPos.Parent = curPos
				queue.push(nPos)
			}
		})
	}
}

function reconstructPath(pos, map) {
	const path = []
	while (pos.Parent) {
		path.unshift(...pos.Dir.diagonalToLine(pos, map))
		pos = pos.Parent
	}
	if (path.length === 0) {
		return
	}
	return path
}
