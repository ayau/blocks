var game = {};

/**
 * Gameplay logic
 *
 * Players are assigned a random id between 1 - 4, which determines order
 * of turn and starting location on the board
 */
(function(game) {

	var NUM_PLAYERS = 4;
	var NUM_CELLS_PER_PLAYER = 89;
	var BOARD_LENGTH = 20;
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

	var registeredBots = {};
	var players = {};
	var playerScores = {};
	var botsInPlay = {}; // to make bot names unique (bot1, bot2..)
	var board = [];
	var consecutivePasses = 0;
	var currentPlayerId = 1;
	var winner;
	var turnDelayMs = 0;
	var nextTimeout;
	var gamesRemaining = 0;

	// Drawing
	var $board = $('#board');
	var $message = $('#message');
	var $scoreTable = $('#score-table');
	var canvasContext;
	var cellWidth;
	var cellHeight;
	var boardPadding;

	game.registerBot = function(name, turn) {
		if (!registeredBots[name]) {
			registeredBots[name] = turn;
		}
	}

	function addPlayerToGame(name) {
		var turn = registeredBots[name];
		if (!turn || _.keys(players).length >= 4) {
			return null;
		}
		var id;
		while (players[id = _.random(1, 4)]);
		var startCell = START_CELLS[id - 1];
		var playerName = name + (botsInPlay[name] || '');
		botsInPlay[name] = (botsInPlay[name] || 0) + 1;
		var player = new Player(id, playerName, startCell, turn);
		players[id] = player;
		printPlayers();
		return player.id;
	}

	function printPlayers() {
		var html = '';
		for (var playerId in players) {
			var player = players[playerId];
			html += '<p><span style="color:' + PLAYER_COLORS[player.id - 1] + '">Player ' + player.id + ': ' + player.name + '</span></p>';
		}
		$('.player-list').html(html);
	}

	function runGames(n) {
		turnDelayMs = $('#turn-delay').val();
		gamesRemaining = n;
		start();
	}

	// returns true if game is over
	function run() {
		var playerId = currentPlayerId;
		currentPlayerId = currentPlayerId === NUM_PLAYERS ? 1 : (currentPlayerId + 1);
		var player = players[playerId];
		var playerStubs = _.mapValues(players, function(p) { return p.getStub(); });
		var t = +new Date;
		var move = player.turn(board, playerId, playerStubs, isValidMove);
		player.executionTime += +new Date - t;
		if (!move || !isValidMove(move, playerId)) {
			consecutivePasses++;
			return consecutivePasses >= 4; // game over if all 4 players passed
		}
		consecutivePasses = 0;
		applyMove(move, player);
		if (turnDelayMs > 0) {
			draw();
		}
		if (_.isEmpty(player.blocks)) {
			winner = player;
			return true;
		}
	}

	function start() {
		if (nextTimeout !== undefined) {
			clearTimeout(nextTimeout);
		}

		// TODO Check to see if enough players joined
		init();

		// View Mode: pause in between each turn so moves can be visualized
		if (turnDelayMs > 0) {
			next();
			return;
		}

		// Fast Mode: execute all turns in loop
		var gameOver = false;
		while (!gameOver) {
			gameOver = run();
		}
		finish();
	}

	function finish() {
		if (!winner) {
			// find winner
			var maxScore = 0;
			_.each(players, function(player) {
				// TODO handle ties
				if (player.getScore() > maxScore) {
					maxScore = player.getScore();
					winner = player;
				}
			});
		}
		for (var playerId in players) {
			var player = players[playerId];
			playerScores[player.name] = playerScores[player.name] || {
				name: player.name,
				gamesPlayed: 0,
				scoreSum: 0,
				executionTimeSum: 0,
			};
			playerScores[player.name].gamesPlayed++;
			playerScores[player.name].latestScore = NUM_CELLS_PER_PLAYER - player.getScore();
			playerScores[player.name].latestExecutionTime = player.executionTime;
			playerScores[player.name].scoreSum += playerScores[player.name].latestScore;
			playerScores[player.name].executionTimeSum += player.executionTime;
		}
		$message.html('Winner is: <span style="color:' + PLAYER_COLORS[winner.id - 1] + '">' + winner.name + '</span>! (' + winner.getScore() + ')');
		printScores();
		draw();
		gamesRemaining--;
		if (gamesRemaining > 0) {
			setTimeout(start, turnDelayMs);
		}
	}

	function printScores() {
		var html = '';
		html += '<thead><tr>';
		html += '<th>Player</th><th>Games Played</th><th>Avg Score</th><th>Latest Score</th><th>Avg Time</th><th>Latest Time</th>';
		html += '</tr></thead>';
		html += '<tbody>';
		for (var name in playerScores) {
			var player = playerScores[name];
			if (player.gamesPlayed > 0) {
				html += '<tr>';
				html += '<td>' + player.name + '</td>';
				html += '<td>' + player.gamesPlayed + '</td>';
				html += '<td>' + Math.round(player.scoreSum / player.gamesPlayed * 10) / 10 + '</td>';
				html += '<td>' + (player.latestScore) + '</td>';
				html += '<td>' + Math.round(player.executionTimeSum / player.gamesPlayed) + 'ms</td>';
				html += '<td>' + (player.latestExecutionTime) + 'ms</td>';
				html += '</tr>';
			}
		}
		html += '</tbody>';
		$scoreTable.html(html);
	}

	function next() {
		var gameOver = run();
		if (gameOver) {
			finish();
		} else {
			nextTimeout = setTimeout(next, turnDelayMs);
		}
	}

	function init() {
		// Reset game state
		players = {};
		botsInPlay = {};
		currentPlayerId = 1;
		winner = undefined;
		consecutivePasses = 0;

		addPlayerToGame('RandomBot');
		addPlayerToGame('RandomBot');
		addPlayerToGame('RandomBot');
		addPlayerToGame('RandomBot');

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

		var blockId = getBlock(move);
		if (blockId) { // TODO check if player has the block
			player.useBlock(blockId);
		}
	}

	var isValidMove = function(move, playerId) {
		var player = players[playerId];
		// Check to see if player has the block
		if (!player.blocks[getBlock(move)]) {
			return false;
		}
		for (var i = 0; i < move.length; i++) {
			var cell = move[i];
			// Out of bounds
			if (!inBounds(cell)) {
				return false;
			}
			// Already occupied
			if (board[cell[0]][cell[1]]) {
				return false;
			}
			// Edges cannot touch
			var edgeCells = getEdgeCells(cell);
			for (var j = 0; j < edgeCells.length; j++) {
				var edgeCell = edgeCells[j];
				if (board[edgeCell[0]][edgeCell[1]] === player.id) {
					return false;
				}
			}
		}

		// Needs to touch one of your corners
		for (var i = 0; i < move.length; i++) {
			var cell = move[i];
			// First move
			if (player.startCell[0] === cell[0] && player.startCell[1] === cell[1]) {
				return true;
			}
			var cornerCells = getCornerCells(cell);
			for (var j = 0; j < cornerCells.length; j++) {
				var cornerCell = cornerCells[j];
				if (board[cornerCell[0]][cornerCell[1]] === player.id) {
					return true;
				}
			}
		}
		return false;
	}

	function inBounds(cell) {
		return cell[0] >= 0 && cell[0] < BOARD_LENGTH && cell[1] >= 0 && cell[1] < BOARD_LENGTH;
	}

	function getEdgeCells(cell) {
		return _.filter([[cell[0]-1, cell[1]], [cell[0]+1, cell[1]], [cell[0], cell[1]-1], [cell[0], cell[1]+1]], inBounds);
	}

	function getCornerCells(cell) {
		return _.filter([[cell[0]-1, cell[1]-1], [cell[0]+1, cell[1]+1], [cell[0]-1, cell[1]+1], [cell[0]+1, cell[1]-1]], inBounds);
	}

	// Should be triggered by a button
	setTimeout(function() {
		init();
	}, 250);

	$(document).on('click', '.run-once', function() {
		runGames(1);
	});

	$(document).on('click', '.run-multiple', function() {
		runGames(Math.max(1, $('#num-games').val()));
	});

})(game);