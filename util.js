function inBounds(x, y, length) {
	return x >= 0 && x < length && y >= 0 && y < length;
}

// Return coordinates touching the edges of this cell
function getEdgeCells(x, y) {
	return [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
}

// Return coordinates touching the corners of this cell
function getCornerCells(x, y) {
	return [[x-1, y-1], [x+1, y+1], [x-1, y+1], [x+1, y-1]];
}