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

		var count = 0;
		do {
			var randomBlock = _.sample(me.getRemainingBlocks());
			var randomPermutation = _.sample(randomBlock.getPermutations());

			var randomMove = [];
			var randomValidCell = _.sample(validCorners);
			var offsetX = randomValidCell[0] - (Math.random() * 5 >> 0);
			var offsetY = randomValidCell[1] - (Math.random() * 5 >> 0);
			for (var x = 0; x < randomPermutation.length; x++) {
				for (var y = 0; y < randomPermutation[x].length; y++) {
					if (randomPermutation[x][y]) {
						randomMove.push([x + offsetX >> 0, y + offsetY >> 0]);
					}
				}
			}
			if (++count > 5000) {
				return false;
			}
		} while (!game.isValidMove(randomMove, me));

		return randomMove;
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
						if (inBounds(edgeCell[0], edgeCell[1], game.BOARD_LENGTH) && board[edgeCell[0]][edgeCell[1]]) {
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