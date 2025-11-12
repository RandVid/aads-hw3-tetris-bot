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
            if (y < 3) {
                // console.log("blocked", x, y);
            }
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

function expectedNextUnknown(board) {
    const types = [i, j, l, o, s, t, z];
    let sum = 0, n = 0;

    for (const typ of types) {
        const dummy = { type: typ, dir: 0, x: 0, y: 0 };
        const ms = getPossibleMoves(dummy, board);
        if (!ms.length) continue;

        let best = -Infinity;
        for (const m of ms) {
            const s = evaluateBoard(m.board);
            if (s > best) best = s;
        }
        sum += best;
        n++;
    }
    return n ? (sum / n) : -1e9;
}

const BEAM_WIDTH = 12;
const EXPECT_WEIGHT = 0.25;

function selectBestMove(piece, next, board = blocks) {
    const firstMoves = getPossibleMoves(piece, board);
    if (!firstMoves.length) return null;

    let beam = firstMoves
        .map(m => ({
            first: { type: piece.type, dir: m.dir, x: m.x, y: m.y },
            board: m.board,
            score0: evaluateBoard(m.board)
        }))
        .sort((a, b) => b.score0 - a.score0)
        .slice(0, Math.min(BEAM_WIDTH, firstMoves.length));

    let expanded = [];
    for (const state of beam) {
        const nextMoves = getPossibleMoves(next, state.board);
        if (!nextMoves.length) {
            expanded.push({ ...state, score1: state.score0, boardAfterNext: state.board });
            continue;
        }
        for (const nm of nextMoves) {
            expanded.push({
                first: state.first,
                board: nm.board,
                boardAfterNext: nm.board,
                score0: state.score0,
                score1: evaluateBoard(nm.board)
            });
        }
    }

    expanded.sort((a, b) => b.score1 - a.score1);
    let beam2 = expanded.slice(0, Math.min(BEAM_WIDTH, expanded.length));

    for (const s of beam2) {
        s.expect = expectedNextUnknown(s.boardAfterNext);
        s.total  = s.score1 + EXPECT_WEIGHT * s.expect;
    }

    beam2.sort((a, b) => b.total - a.total);
    const best = beam2[0] || beam[0];

    return {
        type: best.first.type,
        dir:  best.first.dir,
        x:    best.first.x,
        y:    best.first.y,
        board: best.boardAfterNext || best.board
    };
}

// Function to get the drop position of the piece
function getDropPosition(type, x, dir, board=blocks) {
    let y = 0;
    while (!occupied(type, x, y + 1, dir, board)) {
        y++;
    }
    return y;
}
