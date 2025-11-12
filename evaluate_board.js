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

    // Combine features into a heuristic score
    return 0
        // - 0.51 * (aggregateHeight - (1.5 ** completeLines))
        - 0.51 * (aggregateHeight - (8 * completeLines))
        + 0.76 * (2 ** (completeLines))
        - 0.36 * holes * maxHeight
        - 0.18 * bumpiness
        - 0.1 * (wellSum)
    ;
}