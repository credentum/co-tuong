import type { PuzzleDef } from '@/types/learning'
import type { Piece } from '@/types/game'

const p = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

// ==================== LESSON 1: Xe (Chariot) ====================

export const L1_P1: PuzzleDef = {
  puzzleId: 'L1_P1',
  title: "Chariot's Reach",
  type: 'tap_all_targets',
  prompt: 'Tap all intersections the red Chariot can reach in one move.',
  setup: {
    pieces: [
      p('xe', 'red', 4, 4),
      p('ma', 'black', 4, 7),
      p('phao', 'red', 2, 4),
      p('tot', 'black', 4, 1),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed dynamically
  teaches: 'Chariot moves along ranks and files, stops at first piece',
}

export const L1_P2: PuzzleDef = {
  puzzleId: 'L1_P2',
  title: 'Capture in One',
  type: 'find_the_move',
  prompt: 'The black Chariot is unprotected. Capture it in one move.',
  setup: {
    pieces: [
      p('xe', 'red', 0, 0),
      p('xe', 'black', 0, 6),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    moves: [{ from: { col: 0, row: 0 }, to: { col: 0, row: 6 } }],
  },
}

export const L1_P3: PuzzleDef = {
  puzzleId: 'L1_P3',
  title: 'Blocked Path',
  type: 'find_the_move',
  prompt: "Can the red Chariot capture the black Chariot? Find a path — you'll need two moves.",
  setup: {
    pieces: [
      p('xe', 'red', 0, 0),
      p('tot', 'black', 0, 3),
      p('xe', 'black', 0, 7),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Move sideways first to get around the blocker
    moves: [
      { from: { col: 0, row: 0 }, to: { col: 1, row: 0 } },
      { from: { col: 0, row: 0 }, to: { col: 2, row: 0 } },
      { from: { col: 0, row: 0 }, to: { col: 3, row: 0 } },
    ],
  },
  teaches: 'Chariot cannot jump over pieces — find an alternate route',
}

export const L1_P4: PuzzleDef = {
  puzzleId: 'L1_P4',
  title: 'Fork the Pieces',
  type: 'find_best_move',
  prompt: 'Move the Chariot to threaten two enemy pieces at once.',
  setup: {
    pieces: [
      p('xe', 'red', 4, 0),
      p('ma', 'black', 0, 4),
      p('phao', 'black', 4, 8),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_best_move',
    // Move to e5 — threatens both a5 Horse and e9 Cannon
    moves: [{ from: { col: 4, row: 0 }, to: { col: 4, row: 4 } }],
  },
  teaches: 'A Chariot on an open file can threaten multiple pieces',
}

export const L1_P5: PuzzleDef = {
  puzzleId: 'L1_P5',
  title: 'Escape Route',
  type: 'find_the_move',
  prompt: 'Your Chariot is under attack. Move it to safety while threatening an enemy piece.',
  setup: {
    pieces: [
      p('xe', 'red', 3, 4),
      p('xe', 'black', 3, 8),
      p('ma', 'black', 7, 4),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 4, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Move to h5 — escapes black Xe and threatens the Horse
    moves: [{ from: { col: 3, row: 4 }, to: { col: 7, row: 4 } }],
  },
  teaches: 'Retreat with a counter-threat',
}

// ==================== LESSON 2: Ma (Horse) ====================

export const L2_P1: PuzzleDef = {
  puzzleId: 'L2_P1',
  title: 'Where Can It Jump?',
  type: 'tap_all_targets',
  prompt: 'Tap all intersections this Horse can legally reach.',
  setup: {
    pieces: [
      p('ma', 'red', 4, 4),
      p('tot', 'red', 4, 5), // blocks north leg
      p('tot', 'black', 3, 4), // blocks west leg
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed from getFullyLegalMoves
  teaches: 'Identifying legal vs blocked jumps',
}

export const L2_P2: PuzzleDef = {
  puzzleId: 'L2_P2',
  title: 'Blocked or Free?',
  type: 'true_false_series',
  prompt: 'Can the Horse reach each highlighted intersection? (Yes/No)',
  setup: {
    pieces: [
      p('ma', 'red', 4, 4),
      p('tot', 'red', 4, 5), // blocks north leg
      p('tot', 'black', 5, 4), // blocks east leg
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  highlightPositions: [
    { col: 3, row: 6 }, // north blocked → No
    { col: 5, row: 6 }, // north blocked → No
    { col: 3, row: 2 }, // south free → Yes
    { col: 6, row: 5 }, // east blocked → No
  ],
  answer: {
    type: 'true_false_series',
    booleans: [false, false, true, false],
  },
  teaches: 'Rapid leg-block recognition',
}

export const L2_P3: PuzzleDef = {
  puzzleId: 'L2_P3',
  title: 'Horse Capture',
  type: 'find_the_move',
  prompt: 'Capture the unprotected Chariot with your Horse.',
  setup: {
    pieces: [
      p('ma', 'red', 2, 0),
      p('xe', 'black', 3, 2),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    moves: [{ from: { col: 2, row: 0 }, to: { col: 3, row: 2 } }],
  },
}

export const L2_P4: PuzzleDef = {
  puzzleId: 'L2_P4',
  title: 'Unblock the Horse',
  type: 'find_the_move',
  prompt: "Move your Chariot to unblock your Horse's path to capture.",
  setup: {
    pieces: [
      p('ma', 'red', 4, 4),
      p('xe', 'red', 4, 5), // blocks Horse's north leg
      p('phao', 'black', 5, 6), // target for Horse at f7
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Move Xe away from e6 to unblock Horse's north direction — any Xe move works
    moves: [
      // Along row 5 (left)
      { from: { col: 4, row: 5 }, to: { col: 0, row: 5 } },
      { from: { col: 4, row: 5 }, to: { col: 1, row: 5 } },
      { from: { col: 4, row: 5 }, to: { col: 2, row: 5 } },
      { from: { col: 4, row: 5 }, to: { col: 3, row: 5 } },
      // Along row 5 (right — (5,5) is illegal: Phao pins through Xe to gen)
      { from: { col: 4, row: 5 }, to: { col: 6, row: 5 } },
      { from: { col: 4, row: 5 }, to: { col: 7, row: 5 } },
      { from: { col: 4, row: 5 }, to: { col: 8, row: 5 } },
      // Along col 4 (up — Ma at (4,4) blocks downward)
      { from: { col: 4, row: 5 }, to: { col: 4, row: 6 } },
      { from: { col: 4, row: 5 }, to: { col: 4, row: 7 } },
      { from: { col: 4, row: 5 }, to: { col: 4, row: 8 } },
      { from: { col: 4, row: 5 }, to: { col: 4, row: 9 } },
    ],
  },
  teaches: 'Piece coordination — clearing blocking pieces',
}

export const L2_P5: PuzzleDef = {
  puzzleId: 'L2_P5',
  title: 'Horse vs Chariot',
  type: 'find_the_move',
  prompt:
    'Your Horse is attacked by a Chariot. Find the safe square that also threatens the Chariot.',
  setup: {
    pieces: [
      p('ma', 'red', 4, 4),
      p('xe', 'black', 4, 8),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Jump to f7 — threatens the Xe on e9 from diagonal
    moves: [
      { from: { col: 4, row: 4 }, to: { col: 5, row: 6 } },
      { from: { col: 4, row: 4 }, to: { col: 3, row: 6 } },
    ],
  },
  teaches: 'Counter-attack with the Horse',
}

// ==================== LESSON 3: Tướng + Sĩ (General + Advisor) ====================

export const L3_P1: PuzzleDef = {
  puzzleId: 'L3_P1',
  title: 'Escape Check',
  type: 'find_the_move',
  prompt: 'Your General is in check. Find the safe move.',
  setup: {
    pieces: [
      p('tuong', 'red', 4, 0),
      p('si', 'red', 3, 1),
      p('si', 'red', 5, 1),
      p('xe', 'black', 4, 6),
      p('tuong', 'black', 4, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // General must move off the e-file
    moves: [
      { from: { col: 4, row: 0 }, to: { col: 3, row: 0 } },
      { from: { col: 4, row: 0 }, to: { col: 5, row: 0 } },
    ],
  },
  teaches: 'Responding to check by moving the General',
}

export const L3_P2: PuzzleDef = {
  puzzleId: 'L3_P2',
  title: 'Block the Check',
  type: 'find_the_move',
  prompt: 'Your General is in check. Use an Advisor to block.',
  setup: {
    pieces: [
      p('tuong', 'red', 4, 0),
      p('si', 'red', 3, 0),
      p('si', 'red', 5, 0),
      p('xe', 'black', 4, 6),
      p('tuong', 'black', 4, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Advisor moves to e2 to block
    moves: [
      { from: { col: 3, row: 0 }, to: { col: 4, row: 1 } },
      { from: { col: 5, row: 0 }, to: { col: 4, row: 1 } },
    ],
  },
  teaches: 'Responding to check by blocking with Advisor',
}

export const L3_P3: PuzzleDef = {
  puzzleId: 'L3_P3',
  title: 'Palace Boundaries',
  type: 'tap_all_targets',
  prompt: 'Tap all intersections the Advisor can legally reach.',
  setup: {
    pieces: [p('si', 'red', 4, 1), p('tuong', 'red', 4, 0), p('tuong', 'black', 3, 9)],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed
  teaches: 'Advisor stays on diagonals within palace',
}

export const L3_P4: PuzzleDef = {
  puzzleId: 'L3_P4',
  title: 'Checkmate in One',
  type: 'find_the_move',
  prompt: 'Deliver checkmate using your Chariot.',
  setup: {
    pieces: [
      p('xe', 'red', 0, 8),
      p('tuong', 'red', 4, 0),
      p('tuong', 'black', 4, 9),
      p('si', 'black', 3, 9),
      p('si', 'black', 5, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Xe to e9 — checkmate
    moves: [{ from: { col: 0, row: 8 }, to: { col: 4, row: 8 } }],
  },
  teaches: 'Chariot delivers checkmate in the palace',
}

export const L3_P5: PuzzleDef = {
  puzzleId: 'L3_P5',
  title: 'Fortress Coordination',
  type: 'find_best_move',
  prompt: 'Position your Advisor to protect the General AND block the diagonal.',
  setup: {
    pieces: [
      p('tuong', 'red', 4, 0),
      p('si', 'red', 3, 0),
      p('xe', 'black', 3, 5),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_best_move',
    // Move Advisor to d2 — protects general and blocks d-file approach
    moves: [{ from: { col: 3, row: 0 }, to: { col: 4, row: 1 } }],
  },
  teaches: 'Advisor positioning for defense',
}

// ==================== Puzzle registry ====================

export const ALL_PUZZLES: Record<string, PuzzleDef> = {
  L1_P1,
  L1_P2,
  L1_P3,
  L1_P4,
  L1_P5,
  L2_P1,
  L2_P2,
  L2_P3,
  L2_P4,
  L2_P5,
  L3_P1,
  L3_P2,
  L3_P3,
  L3_P4,
  L3_P5,
}
