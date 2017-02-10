function Player(id, name, startCell, turn) {
	var blocks = getAllBlocks();

	var getScore = function() {
		var score = 0;
		_.each(blocks, function(block) {
			score += block.length;
		});
		return 89 - score;
	}

	var getBlocks = function() {
		return blocks;
	}

	// Remove a block from remainingBlocks
	var useBlock = function(blockId) {
		delete blocks[blockId];
	}

	// Returns an immutable stub of a player
	var getStub = function() {
		return {
			id: id,
			name: name,
			blocks: _.clone(getBlocks()),
			startCell: startCell
		}
	}

	return {
		id: id,
		name: name,
		getScore: getScore,
		getBlocks: getBlocks,
		startCell: startCell, 
		turn: turn,
		useBlock: useBlock,
		getStub: getStub
	}
}

