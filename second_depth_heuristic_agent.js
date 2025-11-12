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
function getPossibleMoves(piece, board=blocks) {
    let moves = [];
    // For each rotation of the piece
    for (let dir = 0; dir < 4; dir++) {
        // For each horizontal position
        for (let x = -1; x < nx; x++) {
            if (!in_bounds(piece.type, x, 5, dir)) continue;
            let y = getDropPosition(piece.type, x, dir, board);
            let new_blocks = copyBlocks(board);
            if (occupied(piece.type, x, y, dir, board)) continue;
            eachblock(piece.type, x, y, dir, function(ix, iy) {
                new_blocks[ix][iy] = piece.type;
            });
            moves.push({type: piece.type, dir: dir, x: x, y: y, board: new_blocks});
        }
    }
    return moves;
}

// Select the best move based on heuristic evaluation
function selectBestMove(piece, next, board) {
    let moves = getPossibleMoves(piece);
    let moves2 = []
    for (let i = 0; i < moves.length; i++) {
        let moves_temp = getPossibleMoves(next, moves[i].board);
        for (let j = 0; j < moves_temp.length; j++) {
            moves2.push({type: moves[i].type,
                dir: moves[i].dir,
                x: moves[i].x,
                y: moves[i].y,
                board: moves_temp[j].board
            });
        }
    }
    let bestMove = null;
    let bestScore = -Infinity;
    moves2.forEach(move => {
        let score = evaluateBoard(move.board);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    return bestMove;
}

// Function to get the drop position of the piece
function getDropPosition(type, x, dir, board=blocks) {
    let y = 0;
    while (!occupied(type, x, y + 1, dir, board)) {
        y++;
    }
    return y;
}
