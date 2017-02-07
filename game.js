(function() {

	var MAX_BLOCK_LENGTH = 5;
	var $board = $('#board');

	function generateBlocks() {
		var hashes = {};
		var blocks = [];
		var oneBlock = createBlankGrid();
		oneBlock[1][1] = 1; // offset the 1 block because the cross does not touch the corner
		var queue = [oneBlock];
		while (grid = queue.shift()) {
			if (hashes[getGridHash(grid)]) {
				continue;
			}
			var block = new Block(grid);
			blocks.push(block);
			_.each(block.getPermutations(), function(grid, hash) {
				hashes[hash] = true;

				if (block.length >= MAX_BLOCK_LENGTH) {
					return;
				}
				for (var i = 0; i < MAX_BLOCK_LENGTH; i++) {
					for (var j = 0; j < MAX_BLOCK_LENGTH; j++) {
						if (!grid[i][j]) {
							continue;
						}
						_.each(getEdgeCells(i, j), function(c) {
							if (!inBounds(c[0], c[1], MAX_BLOCK_LENGTH) || grid[c[0]][c[1]]) {
								return;
							}
							var newGrid = _.cloneDeep(grid);
							newGrid[c[0]][c[1]] = 1;
							queue.push(newGrid);
						});
					}
				}
			});
		}
		return blocks;
	}

	function inBounds(x, y, length) {
		return x >= 0 && x < length && y >= 0 && y < length;
	}

	// Return coordinates touching the edges of this cell
	function getEdgeCells(x, y) {
		return [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
	}

	function getAllRotation(grid) {
		var grids = {};
		for (var i = 0; i < 4; i++) {
			grid = rotateBlock(grid);
			var hash = getGridHash(grid);
			if (!grids[hash]) {
				grids[hash] = grid;
			}
		}
		grid = flipBlock(grid);
		for (var i = 0; i < 4; i++) {
			grid = rotateBlock(grid);
			var hash = getGridHash(grid);
			if (!grids[hash]) {
				grids[hash] = grid;
			}
		}	
		return grids;
	}

	// Rotates counter clockwise once
	function rotateBlock(grid) {
		var newGrid = createBlankGrid();
		for (var i = 0; i < MAX_BLOCK_LENGTH; i++) {
			for (var j = 0; j < MAX_BLOCK_LENGTH; j++) {
				if (grid[i][j]) {
					newGrid[MAX_BLOCK_LENGTH - j - 1][i] = 1;
				}
			}
		}
		return normalizeGrid(newGrid);
	}

	function flipBlock(grid) {
		var newGrid = createBlankGrid();
		for (var i = 0; i < MAX_BLOCK_LENGTH; i++) {
			for (var j = 0; j < MAX_BLOCK_LENGTH; j++) {
				if (grid[i][j]) {
					newGrid[MAX_BLOCK_LENGTH - i - 1][j] = 1;
				}
			}
		}
		return normalizeGrid(newGrid);
	}

	// Pushes the grid to the corner so it can be compared with hash
	function normalizeGrid(grid) {
		var minX = MAX_BLOCK_LENGTH;
		var minY = MAX_BLOCK_LENGTH;
		for (var i = 0; i < MAX_BLOCK_LENGTH; i++) {
			for (var j = 0; j < MAX_BLOCK_LENGTH; j++) {
				if (grid[i][j]) {
					minX = Math.min(i, minX);
					minY = Math.min(j, minY);
				}
			}
		}
		var newGrid = createBlankGrid();
		for (var i = 0; i < MAX_BLOCK_LENGTH; i++) {
			for (var j = 0; j < MAX_BLOCK_LENGTH; j++) {
				if (grid[i][j]) {
					newGrid[i - minX][j - minY] = 1;
				}
			}
		}
		return newGrid;
	}

	function createBlankGrid() {
		return  _.times(MAX_BLOCK_LENGTH, function () {
			return _.times(MAX_BLOCK_LENGTH, function() {
				return 0;
			})
		});
	}

	// Unique hash based on grid permutation
	function getGridHash(grid) {
		var hash = 0;
		for (var i = 0; i < MAX_BLOCK_LENGTH; i++) {
			for (var j = 0; j < MAX_BLOCK_LENGTH; j++) {
				if (grid[i][j]) {
					hash |= 1 << i * MAX_BLOCK_LENGTH + j;
				}
			}
		}
		return hash;
	}

	// Represents 1 unique block
	function Block(inputGrid) {
		var length = 0;
		var cells = [];
		var grid = createBlankGrid();

		for (var i = 0; i < MAX_BLOCK_LENGTH; i++) {
			inputGrid[i] = inputGrid[i] || [];
			for (var j = 0; j < MAX_BLOCK_LENGTH; j++) {
				if (inputGrid[i][j]) {
					grid[i][j] = 1;
					length ++;
					cells.push([i, j]);
				}
			}
		}
		grid = normalizeGrid(grid);

		var getPermutations = function() {
			if (!this.permutations) {
				this.permutations = getAllRotation(grid);
			}
			return this.permutations;
		}

		return {
			length: length,
			grid: grid,
			cells: cells,
			getPermutations: getPermutations
		}
	}

	// var blocks = generateBlocks();
	// _.each(blocks, function(block) {
	// 	console.log(block.grid.join("\n"));
	// 	console.log("permutations: ", _.keys(block.getPermutations()).length);
	// });
	// console.log(blocks.length);
})();