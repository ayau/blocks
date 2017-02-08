// Global function
var generateBlocks;
var getCellsHash;

(function() {

	var MAX_BLOCK_LENGTH = 5;

	generateBlocks = function() {
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

				if (block.size >= MAX_BLOCK_LENGTH) {
					return;
				}
				for (var x = 0; x < MAX_BLOCK_LENGTH; x++) {
					for (var y = 0; y < MAX_BLOCK_LENGTH; y++) {
						if (!grid[x][y]) {
							continue;
						}
						_.each(getEdgeCells(x, y), function(c) {
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

	// Given an array of cells, return the hash of the block
	getCellsHash = function(cells) {
		var grid = createBlankGrid();
		
		var minX = Infinity;
		var minY = Infinity;
		for (var i = 0; i < cells.length; i++) {
			minX = Math.min(minX, cells[i][0]);
			minY = Math.min(minY, cells[i][1]);
		}
		for (var i = 0; i < cells.length; i++) {
			grid[cells[i][0] - minX][cells[i][1] - minY] = 1;
		}
		return getGridHash(grid);
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
		for (var x = 0; x < MAX_BLOCK_LENGTH; x++) {
			for (var y = 0; y < MAX_BLOCK_LENGTH; y++) {
				if (grid[x][y]) {
					newGrid[MAX_BLOCK_LENGTH - y - 1][x] = 1;
				}
			}
		}
		return normalizeGrid(newGrid);
	}

	function flipBlock(grid) {
		var newGrid = createBlankGrid();
		for (var x = 0; x < MAX_BLOCK_LENGTH; x++) {
			for (var y = 0; y < MAX_BLOCK_LENGTH; y++) {
				if (grid[x][y]) {
					newGrid[MAX_BLOCK_LENGTH - x - 1][y] = 1;
				}
			}
		}
		return normalizeGrid(newGrid);
	}

	// Pushes the grid to the corner so it can be compared with hash
	function normalizeGrid(grid) {
		var minX = MAX_BLOCK_LENGTH;
		var minY = MAX_BLOCK_LENGTH;
		for (var x = 0; x < MAX_BLOCK_LENGTH; x++) {
			for (var y = 0; y < MAX_BLOCK_LENGTH; y++) {
				if (grid[x][y]) {
					minX = Math.min(x, minX);
					minY = Math.min(y, minY);
				}
			}
		}
		var newGrid = createBlankGrid();
		for (var x = 0; x < MAX_BLOCK_LENGTH; x++) {
			for (var y = 0; y < MAX_BLOCK_LENGTH; y++) {
				if (grid[x][y]) {
					newGrid[x - minX][y - minY] = 1;
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
		for (var x = 0; x < MAX_BLOCK_LENGTH; x++) {
			for (var y = 0; y < MAX_BLOCK_LENGTH; y++) {
				if (grid[x][y]) {
					hash |= 1 << x * MAX_BLOCK_LENGTH + y;
				}
			}
		}
		return hash;
	}

	// Represents 1 unique block
	function Block(inputGrid) {
		var size = 0;
		var cells = [];
		var grid = createBlankGrid();

		for (var x = 0; x < MAX_BLOCK_LENGTH; x++) {
			inputGrid[x] = inputGrid[x] || [];
			for (var y = 0; y < MAX_BLOCK_LENGTH; y++) {
				if (inputGrid[x][y]) {
					grid[x][y] = 1;
					size ++;
					cells.push([x, y]);
				}
			}
		}
		grid = normalizeGrid(grid);

		var getPermutations = function() {
			if (!this._permutations) {
				this._permutations = getAllRotation(grid);
			}
			return this._permutations;
		}

		return {
			id: getGridHash(grid),
			size: size,
			grid: grid,
			cells: cells,
			getPermutations: getPermutations
		}
	}
})();