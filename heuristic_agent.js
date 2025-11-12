// Heuristic evaluation function
function evaluateBoard(board) {
    let aggregateHeight = 0;
    let completeLines = 0;
    let maxHeight = 0;
    let minHeight = ny;
    let holes = 1;
    let bumpiness = 0;
    let columnHeights = new Array(nx).fill(0);
    let wellSum = 0;

    // Calculate aggregate height and column heights
    for (let x =   0; x < nx; x++) {
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0 && board[x][y] !== null) {
                columnHeights[x] = ny - y;
                // columnHeights[x] = 2.1**(ny - y);
                if (columnHeights[x] > maxHeight) maxHeight = columnHeights[x];
                if (columnHeights[x] < minHeight) minHeight = columnHeights[x];
                aggregateHeight += columnHeights[x];
                break;
            }
        }
    }

    // Calculate complete lines
    for (let y = 0; y < ny; y++) {
        var complete = true;
        for (let x = 0; x < nx; x++) {
            if (board[x][y] === 0 || board[x][y] === null) {
                complete = false;

                break;
            }
        }
        if (complete)
            // if (completeLines === 0) completeLines++;
            // else completeLines *= 2;
            completeLines++;
    }

    // Calculate holes
    for (let x = 0; x < nx; x++) {
        let blockFound = false;
        let hole = 0;
        let hole_depth = 0;
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0 && board[x][y] !== null) {
                blockFound = true;
                holes += (1.5**hole_depth)*hole;
                hole = 0;
                hole_depth++;
            } else if (blockFound && (board[x][y] === 0 || board[x][y] === null)) {
                // if (hole === 0) hole = 1
                // else hole += 0.3;
                holes++;
            }
        }
        holes += (1.3**hole_depth)*hole;
    }

    // Calculate bumpiness
    for (let x = 0; x < nx - 1; x++) {
        bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1] );
    }

    for (let x = 0; x < nx; x++) {
        const left  = (x === 0)      ? Infinity : columnHeights[x - 1];
        const right = (x === nx - 1) ? Infinity : columnHeights[x + 1];
        const wellDepth = Math.max(0, Math.min(left, right) - columnHeights[x]);
        wellSum += (wellDepth * (wellDepth + 1)) / 2;
    }

    // console.log(aggregateHeight)

    // Combine features into a heuristic score
    return 0
        // - 0.51 * (aggregateHeight - (1.5 ** completeLines))
        - 0.51 * (aggregateHeight - (6 * completeLines))
        + 0.76 * (2 ** (completeLines))
        - 1.36 * holes * maxHeight
        - 0.18 * bumpiness
        - 0.2 * (wellSum)
        // - 5.3 * maxHeight
        // - 5.2 *  (maxHeight / minHeight)
        ;
}

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
            if (y < 3) {
                // console.log("blocked", x, y);
            }
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
        // console.log("board", move.board);
        // console.log("score", score);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
            // console.log("best move", move.x, move.y, move.dir, score);
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
