// Function to deep copy the blocks array
function copyBlocks(blocks) {
    let new_blocks = [];
    for (let x = 0; x < nx; x++) {
        new_blocks[x] = [];
        for (let y = 0; y < ny; y++) {
            new_blocks[x][y] = blocks[x][y];
        }
    }
    return new_blocks;
}

function in_bounds(type, x, y, dir) {
    var result = true
    eachblock(type, x, y, dir, function(x, y) {
        if ((x < 0) || (x >= nx) || (y < 0) || (y >= ny))
            result = false;
    });
    return result;
}

// Generate all possible moves for the current piece
function getPossibleMoves(piece) {
    let moves = [];
    // For each rotation of the piece
    for (let dir = 0; dir < 4; dir++) {
        // For each horizontal position
        for (let x = -1; x < nx; x++) {
            if (!in_bounds(piece.type, x, 5, dir)) continue;
            let y = getDropPosition(piece.type, x, dir);
            let new_blocks = copyBlocks(blocks);
            if (occupied(piece.type, x, y, dir)) continue;
            eachblock(piece.type, x, y, dir, function(ix, iy) {
                new_blocks[ix][iy] = piece.type;
            });
            moves.push({type: piece.type, dir: dir, x: x, y: y, board: new_blocks});
        }
    }
    return moves;
}

// Select the best move based on heuristic evaluation
function selectBestMove(piece, board) {
    let moves = getPossibleMoves(piece);
    let bestMove = null;
    let bestScore = -Infinity;
    moves.forEach(move => {
        let score = evaluateBoard(move.board);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    return bestMove;
}

// Function to get the drop position of the piece
function getDropPosition(type, x, dir) {
    let y = 0;
    while (!occupied(type, x, y + 1, dir)) {
        y++;
    }
    return y;
}
