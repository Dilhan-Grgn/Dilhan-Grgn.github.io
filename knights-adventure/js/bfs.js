function bfs(map, startPos, endPos) {
	map[startPos.X][startPos.Y] = 0
	map[endPos.X][endPos.Y] = 0
	const queue = []
	const visited = new Set()

	visited.add(startPos.toString())
	queue.push(startPos)
	while (queue.length > 0) {
		const curPos = queue.shift()
		if (Pos.Equal(curPos, endPos)) {
			return reconstructPath(curPos, map)
		}

		curPos.getNeighbors(map).forEach(nPos => {
			if (!visited.has(nPos.toString())) {
				visited.add(nPos.toString())
				nPos.Parent = curPos
				queue.push(nPos)
			}
		});
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
