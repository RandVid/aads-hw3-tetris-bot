# Tetris Bot Report

## 1. Bugs fixed

While reviewing the project, I found and fixed several issues:

* `evaluate_board.js:13–14`
  The nested `for` loops were swapped, so the board was scanned in the wrong direction.
  **Fix:** swap the loop order.

* `evaluate_board.js:15` (and a few other spots)
  The `if` checked only `cell === 0` and ignored `null`, which also represents empty.
  **Fix:** include an explicit `null` check.

* `heuristic_agent.js:28`
  The loop skipped the edge columns.
  **Fix:** extend the range to `[-1, 10]` and add a helper that verifies the piece is fully inside the board before evaluating.

* `heuristic_agent.js:39`
  A reference to the piece object was pushed into the moves array. Because of that, only one rotation was actually used later in `game.js:agent()`.
  **Fix:** return the piece **type** and **rotation** separately instead of returning a mutable reference.

---

## 2. Heuristic improvements

### 2.1 Well detection

I added a check for “wells”, i.e., vertical pits between columns. These are risky because if the top gets blocked, clearing them becomes very hard, which quickly leads to a top-out.

### 2.2 Weight tuning

Most weights were already reasonable, so I only introduced a new weight for the well feature. After this change, the heuristic agent produced the following distribution:

![image](src/First%20Depth%20Heuristic%20-%20Score%20Distribution.png)

Average score: **33,641.5**
Average rows deleted: **260.5**

### 2.3 Second-depth heuristic

To look further ahead, I added an exhaustive search over all valid moves for both the **current** and **next** piece. This noticeably improved results while still keeping the game at **120 fps** on my machine (MacBook Pro 14", M2 Max, 64 GB RAM):

| Score     | Rows Deleted |
| --------- | ------------ |
| 12,220    | 90           |
| 666,950   | 5,282        |
| 1,923,100 | 15,222       |
| 272,610   | 2,158        |
| 500,820   | 3,970        |
| 1,863,080 | 14,712       |
| 178,950   | 1,413        |
| 3,263,140 | 25,812       |

Average score: **1,085,109**
Average rows deleted: **8,582**

---

## 3. Beam Search Agent

I implemented beam search with depth **3** and beam width **12**. It selects the best moves for the current and next piece, and then estimates the expected value for the piece after that by considering the best move per piece type from depth 2.

This version performed very well. Two runs:

| Score      | Rows Deleted |
| ---------- | ------------ |
| 3,489,190  | 27,711       |
| 10,515,710 | 83,491       |

The second run came close to the (human) world record of **16,248,080** by Alex Thach. Pushing depth further probably won’t help much: beyond this point the randomness dominates, and each extra depth increases checks by about **7×**, which hurts performance.

---

## 4. Conclusion

I tested three agents:

* **Baseline heuristic:** average score **33,641.5**
* **Second-depth heuristic:** average score **1,085,109**
* **Beam search (depth 3, width 12):** average score **7,002,450**

All versions run at **120 fps** on my machine. The second-depth lookahead gives a big jump for cheap, and beam search delivers the best results before performance costs start to outweigh the gains.
