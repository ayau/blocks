(function(game) {

	game.addPlayer('bot1', turn);
	game.addPlayer('bot2', turn);
	game.addPlayer('bot3', turn);
	game.addPlayer('bot4', turn);

	function turn(board, myPlayerId, players) {
		var me = players[myPlayerId];

		var validCorners = getValidCorners(board, me);
		if (_.isEmpty(validCorners)) {
			return false;
		}

		validCorners = _.shuffle(validCorners);
		var remainingBlocks = weightedShuffle(me.getRemainingBlocks());
		// var remainingBlocks = _.shuffle(me.getRemainingBlocks());
		for (var j = 0; j < remainingBlocks.length; j++) {
			var permutations = _.shuffle(remainingBlocks[j].getPermutations());
			for (var i = 0; i < validCorners.length; i++) {
				for (var k in permutations) {
					// Pick a cell to anchor on the valid corner
					var cells = gridToCells(permutations[k]);
					for (var l = 0; l < cells.length; l++) {
						var offsetX = validCorners[i][0] - cells[l][0];
						var offsetY = validCorners[i][1] - cells[l][1];
						var move = offsetCells(cells, offsetX, offsetY);
						if (game.isValidMove(move, me)) {
							return move;
						}
					}
				}
			}
		}
		return false;
	}

	function gridToCells(grid) {
		var cells = [];
		for (var x = 0; x < grid.length; x++) {
			for (var y = 0; y < grid[x].length; y++) {
				if (grid[x][y]) {
					cells.push([x, y]);
				}
			}
		}
		return cells;
	}

	function offsetCells(cells, offsetX, offsetY) {
		var newCells = [];
		for (var i = 0; i < cells.length; i++) {
			newCells.push([cells[i][0] + offsetX, cells[i][1] + offsetY]);
		}
		return newCells;
	}

	function weightedShuffle(blocks) {
		var weights = [];
		_.each(blocks, function(block, k) {
			for (var i = 0; i < block.size; i++) weights.push(k);
		});
		var weights = _.shuffle(weights);
		var seen = {};
		var randomBlocks = [];
		_.each(weights, function(k) {
			if (seen[k]) return;
			seen[k] = true;
			randomBlocks.push(blocks[k]);
		});
		return randomBlocks;
	}

	// Returns valid corners to place a move
	// One of the player's blocks must use one of these cells
	// TODO instead of computing this everytime we should just store and check the diff after every move
	function getValidCorners(board, player) {
		// First move must be played at the start
		if (!board[player.startCell[0]][player.startCell[1]]) {
			return [player.startCell];
		}
		var validCells = [];
		for (var x = 0; x < game.BOARD_LENGTH; x++) {
			for (var y = 0; y < game.BOARD_LENGTH; y++) {
				if (board[x][y] !== player.id) {
					continue;
				}
				var cornerCells = getCornerCells(x, y);
				cornerLoop:
				for (var i = 0; i < cornerCells.length; i++) {
					var cell = cornerCells[i];
					// Out of bounds or already occupied
					if (!inBounds(cell[0], cell[1], game.BOARD_LENGTH) || board[cell[0]][cell[1]]) {
						continue;
					}
					var edgeCells = getEdgeCells(cell[0], cell[1]);
					for (var j = 0; j < edgeCells.length; j++) {
						var edgeCell = edgeCells[j];
						if (inBounds(edgeCell[0], edgeCell[1], game.BOARD_LENGTH) && board[edgeCell[0]][edgeCell[1]] === player.id) {
							continue cornerLoop;
						}
					}
					validCells.push(cell);
				}
			}
		}
		return validCells;
	}

})(game);