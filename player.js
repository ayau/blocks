function Player(id, name, startCell, turn) {
	var blocks = getAllBlocks();

	var getScore = function() {
		var score = 0;
		_.each(blocks, function(block) {
			score += block.length;
		});
		return 89 - score;
	}

	var getRemainingBlocks = function() {
		return blocks;
	}

	// Remove a block from remainingBlocks
	var useBlock = function(blockId) {
		delete blocks[blockId];
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

