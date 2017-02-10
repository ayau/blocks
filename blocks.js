// Global function
var getAllBlocks;
var getBlock;

(function() {

	// See http://www.gottfriedville.net/blokus/set.png
	var BLOCKS = {
		'i1': [[0,0]],
		'i2': [[0,0],[0,1]],
		'i3': [[0,0],[0,1],[0,2]],
		'i4': [[0,0],[0,1],[0,2],[0,3]],
		'i5': [[0,0],[0,1],[0,2],[0,3],[0,4]],
		'v3': [[0,0],[0,1],[1,1]],
		'v5': [[0,0],[0,1],[0,2],[1,2],[2,2]],
		'o4': [[0,0],[0,1],[1,1],[1,0]],
		't4': [[0,0],[1,0],[2,0],[1,1]],
		't5': [[0,0],[1,0],[2,0],[1,1],[1,2]],
		'l4': [[0,0],[1,0],[2,0],[2,1]],
		'l5': [[0,0],[1,0],[2,0],[3,0],[3,1]],
		'z4': [[0,0],[1,0],[1,1],[2,1]],
		'z5': [[0,0],[1,0],[1,1],[1,2],[2,2]],
		'y':  [[0,0],[1,0],[2,0],[3,0],[1,1]],
		'n':  [[0,0],[1,0],[2,0],[2,1],[3,1]],
		'u':  [[0,0],[1,0],[0,1],[0,2],[1,2]],
		'x':  [[0,1],[1,0],[1,1],[2,1],[1,2]],
		'w':  [[0,0],[0,1],[1,1],[1,2],[2,2]],
		'p':  [[0,0],[0,1],[1,1],[1,0],[0,2]],
		'f':  [[0,0],[1,0],[1,1],[1,2],[2,1]]
	};
	var NUM_CELLS = 89;
	var MAX_BLOCK_LENGTH = 5;
	var BLOCKS_HASH = getBlockHashes();

	getAllBlocks = function() {
		return _.cloneDeep(BLOCKS);
	}

	getBlock = function(cells) {
		return BLOCKS_HASH[getHash(cells)];
	}

	function getBlockHashes() {
		var hashes = {};
		for (var blockId in BLOCKS) {
			var cells = BLOCKS[blockId];
			// Flip twice
			_.each([cells, flipBlock(cells)], function(c) {
				// Rotate 4 times
				for (var i = 0; i < 4; i++) {
					c = rotateBlock(c);
					hashes[getHash(c)] = blockId;
				}
			});
		}
		return hashes;
	}

	// Rotates counter clockwise once
	function rotateBlock(cells) {
		return _.map(cells, function(cell) {
			return [MAX_BLOCK_LENGTH - cell[1] - 1, cell[0]];
		});
	}

	function flipBlock(cells) {
		return _.map(cells, function(cell) {
			return [MAX_BLOCK_LENGTH - cell[0] - 1, cell[1]];
		});
	}

	// Pushes the grid to the corner so it can be compared with hash
	function normalizeCells(cells) {
		var minX = Infinity;
		var minY = Infinity;
		_.each(cells, function(cell) {
			minX = Math.min(cell[0], minX);
			minY = Math.min(cell[1], minY);
		});
		return _.map(cells, function(cell) {
			return [cell[0] - minX, cell[1] - minY];
		});
	}

	// Unique hash based on grid permutation
	function getHash(cells) {
		cells = normalizeCells(cells);
		var hash = 0;
		_.each(cells, function(cell) {
			hash |= 1 << cell[0] * MAX_BLOCK_LENGTH + cell[1];
		});
		return hash;
	}
})();