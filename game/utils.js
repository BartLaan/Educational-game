let exampleRepr = [
	[1,1,1,0,0],
	[0,0,1,0,0],
	[0,1,0,0,0],
	[0,2,0,0,0],
]

// WIDTH/COLUMNS FIRST
function coordToStr(x, y) {
	return x.toString() + ':' + y.toString();
}

function strToCoord(coordStr) {
	let coords = coordStr.split(':');
	let x = parseInt(coords[0], 10);
	let y = parseInt(coords[1], 10);
	return [x, y];
}

function boardToNodes(board) {
	let nodes = {};

	for (y of board) {
		for (x of row) {
			let nodeName = coordToStr(x, y);
			let node = {};

			if (y > 0) {
				node.north = coordToStr(x, y - 1);
			}
			if (y - 1 < board.length) {
				node.south = coordToStr(x, y + 1);
			}
			if (x > 0) {
				node.west = coordToStr(x - 1, y);
			}
			if (x - 1 < row.length) {
				node.east = coordToStr(x + 1, y);
			}

			nodes[nodeName] = node;
		}
	}
	return nodes;
}

function resizeBoard(board, minSize) {

	let size = [board.length > 0 ? board[0].length : 0, board.length];

	while (minSize[1] > size[1]) {
		board.push[[]];
		size[1] = size[1] + 1;
		while (board[size[1]].length < size[0]) {
			board[size[1]].push([1]);
		}
	}
	while (minSize[0] > size[0]) {
		size[0] = size[0] + 1;
		for (row in board) {
			board[row].push([0])
		}
	}
}

function nodesToBoard(nodes) {
	let board = [[0]];
	for (node of nodes) {
		let tile = strToCoord(node);
		// Resize board if necessary
		board = resizeBoard(board, tile);
		board[tile[1]][tile[0]] = 1;
	}
	return board;
}
