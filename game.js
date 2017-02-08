var game = {};

/**
 * Gameplay logic
 *
 * Players are assigned a random id between 1 - 4, which determines order
 * of turn and starting location on the board
 */
(function(game) {

	var BOARD_LENGTH = 20;
	var GRID_COLOR = 'black';
	var PLAYER_COLORS = [
		'#4285F4', // player 1
		'#0F9D58', // player 2
		'#F4B400', // player 3
		'#DB4437'  // player 4
	];

	var START_CELLS = [
		[0, 0],
		[BOARD_LENGTH - 1, 0],
		[BOARD_LENGTH - 1, BOARD_LENGTH - 1],
		[0, BOARD_LENGTH - 1]
	];

	var players = {};
	var board = [];
	var winner;

	// Drawing
	var $board = $('#board');
	var $message = $('#message');
	var canvasContext;
	var cellWidth;
	var cellHeight;
	var boardPadding;

	game.BOARD_LENGTH = BOARD_LENGTH;
	game.addPlayer = function(name, turn) {
		// Max players reached
		if (_.keys(players).length >= 4) {
			return null;
		}
		var id = _.keys(players).length + 1;
		var startCell = START_CELLS[id - 1]; // Randomize order
		var player = new Player(id, name, startCell, turn);
		players[id] = player;
		return player.id;
	}

	// returns true if game is over
	function run() {
		var numMoves = 0;
		for (var playerId in players) {
			var player = players[playerId];
			var move = player.turn(board, playerId, players);
			if (!move || !game.isValidMove(move, player)) {
				continue; // treats as player passing
			}
			applyMove(move, player);
			draw();
			numMoves++;
			if (_.isEmpty(player.getRemainingBlocks())) {
				winner = player;
				return true;
			}
		}
		if (numMoves === 0) {
			return true;
		}
	}

	function start() {
		// TODO Check to see if enough players joined
		init();
		var gameOver = false;
		while (!gameOver) {
			gameOver = run();
		}
		if (!winner) {
			// find winner
			var lowestScore = Infinity;
			_.each(players, function(player) {
				// TODO handle ties
				if (player.getScore() < lowestScore) {
					lowestScore = player.getScore();
					winner = player;
				}
			});
		}
		$message.html('Winner is: <span style="color:' + PLAYER_COLORS[winner.id - 1] + '">' + winner.name + '</span>!');
	}

	function init() {
		canvasContext = $board[0].getContext('2d');
		boardPadding = $board.width() / 40;
		cellWidth = ($board.width() - boardPadding) / BOARD_LENGTH >> 0;
		cellHeight = ($board.height() - boardPadding) / BOARD_LENGTH >> 0;
		board = createBoard();
		draw();
	}

	function createBoard() {
		return  _.times(BOARD_LENGTH, function () {
			return _.times(BOARD_LENGTH, function() {
				return 0;
			})
		});
	}

	function draw() {
		// Draw pieces
		for (var x = 0; x < BOARD_LENGTH; x++) {
			for (var y = 0; y < BOARD_LENGTH; y++) {
				if (board[x][y] === 0) {
					canvasContext.fillStyle = 'white';
				} else {
					canvasContext.fillStyle = PLAYER_COLORS[board[x][y] - 1];
				}
				canvasContext.fillRect(
					boardPadding + x * cellWidth,
					boardPadding + y * cellHeight,
					cellWidth,
					cellHeight
				);
			}
		}

		// Draw board
		for (var x = 0; x <= BOARD_LENGTH; x++) {
			canvasContext.moveTo(boardPadding + x * cellWidth, boardPadding);
			canvasContext.lineTo(boardPadding + x * cellWidth, boardPadding + cellHeight * BOARD_LENGTH);
		}
		for (var y = 0; y <= BOARD_LENGTH; y++) {
			canvasContext.moveTo(boardPadding, boardPadding + y * cellHeight);
			canvasContext.lineTo(boardPadding + cellWidth * BOARD_LENGTH, boardPadding + y * cellHeight);
		}
		canvasContext.strokeStyle = '#4d4d4d';
		canvasContext.stroke();
	}

	function applyMove(move, player) {
		_.each(move, function(cell) {
			board[cell[0]][cell[1]] = player.id;
		});

		var moveHash = getCellsHash(move);
		var remainingBlocks = player.getRemainingBlocks();
		for (var i = 0; i < remainingBlocks.length; i++) {
			var block = remainingBlocks[i];
			if (block.getPermutations()[moveHash]) {
				player.useBlock(block);
				return;
			}
		}
	}

	game.isValidMove = function(move, player) {
		var isTouchingCorner = false;
		// TODO check whether the player has this block
		for (var i = 0; i < move.length; i++) {
			var cell = move[i];
			// Out of bounds
			if (!inBounds(cell[0], cell[1], BOARD_LENGTH)) {
				return false;
			}
			// Already occupied
			if (board[cell[0]][cell[1]]) {
				return false;
			}
			// Edges cannot touch
			var edgeCells = getEdgeCells(cell[0], cell[1]);
			for (var j = 0; j < edgeCells.length; j++) {
				var edgeCell = edgeCells[j];
				if (inBounds(edgeCell[0], edgeCell[1], BOARD_LENGTH) &&
					board[edgeCell[0]][edgeCell[1]] === player.id) {
					return false;
				}
			}
			if (isTouchingCorner) {
				continue;
			}
			// First move
			if (player.startCell[0] === cell[0] && player.startCell[1] === cell[1]) {
				isTouchingCorner = true;
				continue;
			}
			var cornerCells = getCornerCells(cell[0], cell[1]);
			for (var j = 0; j < cornerCells.length; j++) {
				var cornerCell = cornerCells[j];
				if (inBounds(cornerCell[0], cornerCell[1], BOARD_LENGTH) &&
					board[cornerCell[0]][cornerCell[1]] === player.id) {
					isTouchingCorner = true;
				}
			}
		}
		return isTouchingCorner;
	}

	// Should be triggered by a button
	setTimeout(function() {
		start();
	}, 500);
})(game);