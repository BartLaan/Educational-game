Utils = {};

Utils.deepCopy = function(object) {
	let result = {};
	// array
	if (object.length !== undefined) {
		result = [];
		for (let item of object) {
			let newItem = (typeof item == 'object') ? Utils.deepCopy(item) : item;
			result.push(newItem)
		}
		return result;
	}

	for (let key in object) {
		let item = object[key];
		let newItem = (typeof item == 'object') ? Utils.deepCopy(item) : item;
		result[key] = newItem;
	}
	return result;
}

// WIDTH/COLUMNS FIRST, START AT 0,0
Utils.coordToStr = function(x, y) {
	return x.toString() + ',' + y.toString();
}

Utils.strToCoord = function(coordStr) {
	let coords = coordStr.split(',');
	return {
		x: parseInt(coords[0], 10),
		y: parseInt(coords[1], 10),
	}
}

Utils.boardToNodes = function(board) {
	let nodes = {};
	console.log(board);
	for (let y in board) {
		y = parseInt(y, 10);
		for (let x in board[y]) {
			x = parseInt(x, 10);
			if (board[y][x] == 0) {
				continue;
			}
			let nodeName = Utils.coordToStr(x, y);
			let node = {};

			if (y > 0 && board[y - 1][x] != 0) {
				node.north = Utils.coordToStr(x, y - 1);
			}
			if (y + 1 < board.length && board[y + 1][x] != 0) {
				node.south = Utils.coordToStr(x, y + 1);
			}
			if (x > 0 && board[y][x - 1] != 0) {
				node.west = Utils.coordToStr(x - 1, y);
			}
			if (x + 1 < board[y].length && board[y][x + 1] != 0) {
				node.east = Utils.coordToStr(x + 1, y);
			}
			if (board[y][x] == 2) {
				node.goal = true;
			}

			nodes[nodeName] = node;
		}
	}
	return nodes;
}

Utils.resizeBoard = function(board, minSize) {

	let size = {
		x: board[0].length - 1,
		y: board.length - 1
	};

	while (minSize[1] > size.y) {
		board.push[[]];
		size.y = size.y + 1;
		while (board[size.y].length < size.x) {
			board[size.y].push([0]);
		}
	}
	while (minSize[0] > size[0]) {
		size.x = size.x + 1;
		for (row in board) {
			board[row].push([0])
		}
	}

	return board;
}

Utils.nodesToBoard = function(nodes) {
	let board = [[0]];
	for (node of nodes) {
		let tile = Utils.strToCoord(node);
		// Resize board if necessary
		board = Utils.resizeBoard(board, tile);
		board[tile[1]][tile[0]] = 1;
	}
	return board;
}
