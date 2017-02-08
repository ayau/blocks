function Player(id, name, startCell, turn) {
	var blocks = generateBlocks();

	var getScore = function() {
		var score = 0;
		for (var i = 0; i < blocks.length; i++) {
			score += blocks[i].size;
		}
		return score;
	}

	var getRemainingBlocks = function() {
		return blocks;
	}

	// Remove a block from remainingBlocks
	var useBlock = function(block) {
		for (var i = 0; i < blocks.length; i++) {
			if (block.id === blocks[i].id) {
				blocks.splice(i, 1);
				return;
			}
		}
	}

	return {
		id: id,
		name: name,
		getScore: getScore,
		getRemainingBlocks: getRemainingBlocks,
		startCell: startCell, 
		turn: turn,
		useBlock: useBlock
	}
}

