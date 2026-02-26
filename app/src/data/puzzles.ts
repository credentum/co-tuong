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
      p('phao', 'red', 4, 6), // blocks col 4 north
      p('ma', 'red', 4, 2), // blocks col 4 south
      p('ma', 'black', 6, 4), // blocks row 4 east (capture)
      p('tot', 'black', 2, 4), // blocks row 4 west (capture)
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed dynamically — 6 targets
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
    // Any move along row 4 escapes col 3 and threatens/captures Ma at (7,4)
    moves: [
      { from: { col: 3, row: 4 }, to: { col: 0, row: 4 } },
      { from: { col: 3, row: 4 }, to: { col: 1, row: 4 } },
      { from: { col: 3, row: 4 }, to: { col: 2, row: 4 } },
      { from: { col: 3, row: 4 }, to: { col: 4, row: 4 } },
      { from: { col: 3, row: 4 }, to: { col: 5, row: 4 } },
      { from: { col: 3, row: 4 }, to: { col: 6, row: 4 } },
      { from: { col: 3, row: 4 }, to: { col: 7, row: 4 } }, // captures Ma
    ],
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
  prompt:
    'Can the Horse reach each highlighted intersection? Remember: if a piece blocks the first step of the L-shape, the Horse cannot jump that direction.',
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
  tfExplanations: [
    'No — the Soldier above the Horse blocks the north leg. The Horse cannot jump upward.',
    'No — same leg block. The Soldier above still blocks any jump that starts by going north.',
    'Yes — nothing blocks the south leg. The Horse steps down first, then diagonally to reach this square.',
    'No — the black Soldier to the right blocks the east leg. The Horse cannot jump rightward.',
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
      p('ma', 'red', 3, 6), // protects (4,8) via north leg — gen can't capture Xe
      p('tuong', 'red', 3, 0),
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 3, 9), // blocks gen left
      p('ma', 'black', 5, 9), // blocks gen right
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Xe to e9 — checkmate (gen trapped by Ma, Xe protected by Ma)
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

// ==================== LESSON 4: Tượng (Elephant) ====================

export const L4_P1: PuzzleDef = {
  puzzleId: 'L4_P1',
  title: "Elephant's Reach",
  type: 'tap_all_targets',
  prompt: 'Tap all intersections the red Elephant can reach in one move.',
  setup: {
    pieces: [p('tuongVoi', 'red', 4, 2), p('tuong', 'red', 5, 0), p('tuong', 'black', 3, 9)],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed — should be 4 targets: (2,0), (6,0), (2,4), (6,4)
  teaches: 'Elephant moves exactly 2 steps diagonally and stays on its own side of the river',
}

export const L4_P2: PuzzleDef = {
  puzzleId: 'L4_P2',
  title: 'Eye Block',
  type: 'true_false_series',
  prompt:
    'Can the Elephant reach each highlighted square? Remember: a piece on the diagonal midpoint blocks the Elephant.',
  setup: {
    pieces: [
      p('tuongVoi', 'red', 4, 2),
      p('ma', 'red', 3, 1), // blocks southwest eye
      p('tot', 'black', 5, 3), // blocks northeast eye
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  highlightPositions: [
    { col: 2, row: 0 }, // southwest — blocked by Tot at (3,1) → No
    { col: 6, row: 4 }, // northeast — blocked by Tot at (5,3) → No
    { col: 6, row: 0 }, // southeast — eye at (5,1) is clear → Yes
    { col: 2, row: 4 }, // northwest — eye at (3,3) is clear → Yes
  ],
  tfExplanations: [
    'No — the red Soldier at the diagonal midpoint blocks this path. The Elephant cannot jump over it.',
    'No — the black Soldier at the diagonal midpoint blocks this direction.',
    'Yes — the diagonal midpoint is clear. The Elephant can reach this square.',
    'Yes — nothing blocks the midpoint. The Elephant moves freely in this direction.',
  ],
  answer: {
    type: 'true_false_series',
    booleans: [false, false, true, true],
  },
  teaches: 'The eye-block rule: a piece on the midpoint diagonal blocks the Elephant',
}

export const L4_P3: PuzzleDef = {
  puzzleId: 'L4_P3',
  title: 'Elephant Capture',
  type: 'find_the_move',
  prompt: 'Capture the unprotected black Horse with your Elephant.',
  setup: {
    pieces: [
      p('tuongVoi', 'red', 2, 2),
      p('ma', 'black', 4, 4),
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    moves: [{ from: { col: 2, row: 2 }, to: { col: 4, row: 4 } }],
  },
  teaches: 'Elephant captures by landing on an enemy piece',
}

export const L4_P4: PuzzleDef = {
  puzzleId: 'L4_P4',
  title: 'Defensive Wall',
  type: 'find_best_move',
  prompt: 'Position your Elephant to block the enemy Chariot from entering your side.',
  setup: {
    pieces: [
      p('tuongVoi', 'red', 6, 0),
      p('xe', 'black', 2, 5), // threatening to come down col 2
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_best_move',
    // Move to (4,2) — controls center and blocks approach
    moves: [{ from: { col: 6, row: 0 }, to: { col: 4, row: 2 } }],
  },
  teaches: 'Elephants are defensive pieces — use them to guard your side of the river',
}

export const L4_P5: PuzzleDef = {
  puzzleId: 'L4_P5',
  title: 'Clear the Eye',
  type: 'find_the_move',
  prompt:
    'Your Elephant needs to reach the corner, but its eye is blocked. Move a piece to clear the path.',
  setup: {
    pieces: [
      p('tuongVoi', 'red', 2, 2),
      p('ma', 'red', 1, 1), // blocks southwest eye
      p('ma', 'black', 0, 0), // target for elephant
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Horse at (1,1) blocks the elephant eye — move it anywhere to clear the path
    moves: [
      { from: { col: 1, row: 1 }, to: { col: 2, row: 3 } },
      { from: { col: 1, row: 1 }, to: { col: 0, row: 3 } },
      { from: { col: 1, row: 1 }, to: { col: 3, row: 2 } },
      { from: { col: 1, row: 1 }, to: { col: 3, row: 0 } },
    ],
  },
  teaches: 'Clear the eye-blocking piece to open the Elephant path',
}

// ==================== LESSON 5: Pháo (Cannon) ====================

export const L5_P1: PuzzleDef = {
  puzzleId: 'L5_P1',
  title: "Cannon's Range",
  type: 'tap_all_targets',
  prompt: 'Tap all intersections the red Cannon can reach (move or capture) in one move.',
  setup: {
    pieces: [
      p('phao', 'red', 4, 4),
      p('tot', 'red', 4, 6), // screen going north
      p('ma', 'black', 4, 8), // capture target behind screen
      p('tot', 'black', 7, 4), // screen going east
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed dynamically
  teaches: 'Cannon slides freely for movement, but needs exactly one screen piece to capture',
}

export const L5_P2: PuzzleDef = {
  puzzleId: 'L5_P2',
  title: 'Screen or No Screen?',
  type: 'true_false_series',
  prompt:
    'Can the Cannon capture each highlighted piece? Remember: it needs exactly one piece between them.',
  setup: {
    pieces: [
      p('phao', 'red', 4, 0),
      p('tot', 'red', 4, 3), // screen on col 4
      p('xe', 'black', 4, 7), // target — 1 screen (Tot) → Yes
      p('ma', 'black', 0, 0), // target — no screen on row 0 → No
      p('si', 'black', 8, 0), // target — no screen on row 0 → No
      p('tuong', 'red', 5, 1),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  highlightPositions: [
    { col: 4, row: 7 }, // 1 screen (Tot at 4,3) → Yes
    { col: 0, row: 0 }, // no screen between (4,0) and (0,0) on row 0 → No
    { col: 8, row: 0 }, // no screen between (4,0) and (8,0) on row 0 → No
  ],
  tfExplanations: [
    'Yes — the red Soldier at (4,3) serves as the screen. The Cannon jumps over it to capture the Chariot.',
    'No — there is no piece between the Cannon and this Horse on the same row. The Cannon needs a screen to capture.',
    'No — no piece sits between the Cannon and this Advisor along the row. Without a screen, the Cannon cannot capture.',
  ],
  answer: {
    type: 'true_false_series',
    booleans: [true, false, false],
  },
  teaches: 'The Cannon needs exactly one screen to capture — no screen, no capture',
}

export const L5_P3: PuzzleDef = {
  puzzleId: 'L5_P3',
  title: 'Cannon Capture',
  type: 'find_the_move',
  prompt: 'Use the Cannon to capture the unprotected black Chariot.',
  setup: {
    pieces: [
      p('phao', 'red', 1, 0),
      p('tot', 'red', 1, 5), // screen (crossed river)
      p('xe', 'black', 1, 7), // target
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    moves: [{ from: { col: 1, row: 0 }, to: { col: 1, row: 7 } }],
  },
  teaches: 'Cannon jumps over one screen piece to capture',
}

export const L5_P4: PuzzleDef = {
  puzzleId: 'L5_P4',
  title: 'Create a Screen',
  type: 'find_the_move',
  prompt: 'Move a piece between the Cannon and the enemy Horse to create a screen for capture.',
  setup: {
    pieces: [
      p('phao', 'red', 4, 0),
      p('xe', 'red', 7, 3), // can move to (4,3) to become screen
      p('ma', 'black', 4, 7), // target
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    moves: [{ from: { col: 7, row: 3 }, to: { col: 4, row: 3 } }],
  },
  teaches: 'Setting up a screen piece enables the Cannon capture',
}

export const L5_P5: PuzzleDef = {
  puzzleId: 'L5_P5',
  title: 'Double Threat',
  type: 'find_best_move',
  prompt:
    'Move the Cannon to a square where it threatens two enemy pieces using different screens.',
  setup: {
    pieces: [
      p('phao', 'red', 2, 2),
      p('ma', 'red', 6, 2), // screen on row 2 when cannon moves to (4,2)
      p('tot', 'red', 4, 5), // screen on col 4 when cannon moves to (4,2)
      p('xe', 'black', 8, 2), // target on row 2
      p('ma', 'black', 4, 8), // target on col 4
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_best_move',
    // Move cannon to (4,2): threatens Xe(8,2) via screen Tot(6,2) on row, and Ma(4,8) via screen Tot(4,5) on col
    moves: [{ from: { col: 2, row: 2 }, to: { col: 4, row: 2 } }],
  },
  teaches: 'Position your Cannon where screens enable captures along multiple lines',
}

// ==================== LESSON 6: Tốt (Soldier) ====================

export const L6_P1: PuzzleDef = {
  puzzleId: 'L6_P1',
  title: 'Before the River',
  type: 'tap_all_targets',
  prompt: 'Tap all intersections this Soldier can reach. (It has not crossed the river yet.)',
  setup: {
    pieces: [p('tot', 'red', 4, 4), p('tuong', 'red', 5, 0), p('tuong', 'black', 3, 9)],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed — 1 move: forward to (4,5)
  teaches: 'Before crossing the river, a Soldier can only move one step forward',
}

export const L6_P2: PuzzleDef = {
  puzzleId: 'L6_P2',
  title: 'After the River',
  type: 'tap_all_targets',
  prompt: 'Tap all intersections this Soldier can reach. (It has crossed the river.)',
  setup: {
    pieces: [
      p('tot', 'red', 4, 5), // crossed river (row >= 5 for red)
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: { type: 'tap_all_targets' }, // computed — 3 moves: forward (4,6), left (3,5), right (5,5)
  teaches: 'After crossing the river, a Soldier gains sideways movement — forward, left, or right',
}

export const L6_P3: PuzzleDef = {
  puzzleId: 'L6_P3',
  title: 'River Rules',
  type: 'true_false_series',
  prompt:
    'Can this Soldier reach the highlighted square in one move? Think about which side of the river it is on.',
  setup: {
    pieces: [
      p('tot', 'red', 4, 4), // NOT crossed river yet (row 4 < 5)
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  highlightPositions: [
    { col: 4, row: 5 }, // forward → Yes
    { col: 3, row: 4 }, // left — not crossed river → No
    { col: 5, row: 4 }, // right — not crossed river → No
    { col: 4, row: 3 }, // backward → No (never)
  ],
  tfExplanations: [
    'Yes — Soldiers always move forward one step.',
    'No — this Soldier has not crossed the river yet. Sideways movement only unlocks after crossing.',
    'No — same reason. The Soldier must cross the river first to gain left/right movement.',
    'No — Soldiers never move backward, even after crossing the river.',
  ],
  answer: {
    type: 'true_false_series',
    booleans: [true, false, false, false],
  },
  teaches: 'Soldiers gain sideways movement after crossing the river, but never move backward',
}

export const L6_P4: PuzzleDef = {
  puzzleId: 'L6_P4',
  title: 'Sideways Capture',
  type: 'find_the_move',
  prompt: 'Use your crossed-river Soldier to capture the enemy piece.',
  setup: {
    pieces: [
      p('tot', 'red', 4, 6), // crossed river
      p('phao', 'black', 3, 6), // capturable sideways
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    moves: [{ from: { col: 4, row: 6 }, to: { col: 3, row: 6 } }],
  },
  teaches: 'A crossed-river Soldier can capture sideways',
}

export const L6_P5: PuzzleDef = {
  puzzleId: 'L6_P5',
  title: 'Cross and Threaten',
  type: 'find_best_move',
  prompt: 'Advance your Soldier across the river to threaten an enemy piece.',
  setup: {
    pieces: [
      p('tot', 'red', 4, 4), // one step from crossing
      p('ma', 'black', 3, 5), // will be threatened sideways after crossing
      p('tuong', 'red', 5, 0),
      p('tuong', 'black', 3, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_best_move',
    // Cross river to (4,5), now threatens Ma at (3,5) sideways
    moves: [{ from: { col: 4, row: 4 }, to: { col: 4, row: 5 } }],
  },
  teaches: 'Pushing a Soldier across the river creates immediate threats',
}

// ==================== LESSON 7: Flying Generals + All Pieces ====================

export const L7_P1: PuzzleDef = {
  puzzleId: 'L7_P1',
  title: 'Flying Generals',
  type: 'true_false_series',
  prompt:
    'The Chariot sits between the two Generals on column 4. Can it reach each highlighted square? (Flying Generals rule: generals cannot face each other on an open column.)',
  setup: {
    pieces: [
      p('xe', 'red', 4, 3), // pinned between generals on col 4 — focus piece
      p('tuong', 'red', 4, 0),
      p('tuong', 'black', 4, 9),
    ],
    playerSide: 'red',
  },
  highlightPositions: [
    { col: 3, row: 3 }, // off col 4 → exposes flying generals → No
    { col: 4, row: 4 }, // stays on col 4, still blocks → Yes
    { col: 4, row: 2 }, // stays on col 4, still blocks → Yes
    { col: 5, row: 3 }, // off col 4 → exposes flying generals → No
  ],
  tfExplanations: [
    'No — moving the Chariot off column 4 leaves the two Generals facing each other. The Flying Generals rule forbids this.',
    'Yes — the Chariot stays on column 4, still blocking the Generals from seeing each other.',
    'Yes — still on column 4. The Chariot blocks the flying generals regardless of which row it is on.',
    'No — leaving column 4 exposes the Generals to each other. The Chariot is pinned to this column.',
  ],
  answer: {
    type: 'true_false_series',
    booleans: [false, true, true, false],
  },
  teaches: 'Any piece between the Generals on the same column is effectively pinned',
}

export const L7_P2: PuzzleDef = {
  puzzleId: 'L7_P2',
  title: 'Exploit the Pin',
  type: 'find_the_move',
  prompt:
    'The black Chariot is pinned between the Generals on column 4 — it cannot leave. Capture it with your Horse.',
  setup: {
    pieces: [
      p('tuong', 'red', 4, 0),
      p('ma', 'red', 3, 3), // can jump to (4,5) to capture pinned Xe
      p('xe', 'black', 4, 5), // pinned on col 4 between generals
      p('tuong', 'black', 4, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Horse at (3,3): leg at (3,4) clear, jumps to (4,5) capturing pinned Xe
    moves: [{ from: { col: 3, row: 3 }, to: { col: 4, row: 5 } }],
  },
  teaches: 'A piece pinned between the Generals cannot flee — attack it freely',
}

export const L7_P3: PuzzleDef = {
  puzzleId: 'L7_P3',
  title: 'Pinned Piece',
  type: 'find_the_move',
  prompt:
    'Your Chariot is pinned between the Generals — it cannot leave column 4. Use your Horse instead to capture the enemy Cannon.',
  setup: {
    pieces: [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 4, 3), // pinned on col 4
      p('ma', 'red', 3, 2),
      p('phao', 'black', 2, 4), // target for Horse
      p('tuong', 'black', 4, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Horse at (3,2) can reach (2,4) — L-shape: right 1 step blocked? No. south-1-then-west-1: (3,2)→leg(3,3)→(2,4)
    // Actually: Ma at (3,2): candidates are:
    // (1,1), (1,3), (2,0), (2,4), (4,0)—blocked by tuong, (4,4), (5,1), (5,3)
    // Capture at (2,4) — leg check: vertical leg to (3,3) clear? Yes.
    moves: [{ from: { col: 3, row: 2 }, to: { col: 2, row: 4 } }],
  },
  teaches: 'A pinned piece cannot move — find another piece to accomplish the goal',
}

export const L7_P4: PuzzleDef = {
  puzzleId: 'L7_P4',
  title: 'Create the Pin',
  type: 'find_best_move',
  prompt:
    'Move your General to column 4 to pin the enemy Cannon between the Generals. Your Chariot on row 6 will then threaten it.',
  setup: {
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 8, 6), // threatens (4,6) along row 6 once Phao is pinned
      p('phao', 'black', 4, 6), // will be pinned on col 4 after gen moves
      p('tuong', 'black', 4, 9),
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_best_move',
    // Move general to (4,0): aligns with black gen on col 4, pinning Phao at (4,6)
    moves: [{ from: { col: 3, row: 0 }, to: { col: 4, row: 0 } }],
  },
  teaches: 'Move your General to create a pin along the shared column',
}

export const L7_P5: PuzzleDef = {
  puzzleId: 'L7_P5',
  title: 'Final Checkmate',
  type: 'find_the_move',
  prompt: 'Deliver checkmate in one move. Use everything you have learned.',
  setup: {
    pieces: [
      p('xe', 'red', 0, 8),
      p('ma', 'red', 3, 6), // protects (4,8) — gen can't capture Xe
      p('tuong', 'red', 3, 0),
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 3, 9), // blocks gen escape left
      p('ma', 'black', 5, 9), // blocks gen escape right
    ],
    playerSide: 'red',
  },
  answer: {
    type: 'find_the_move',
    // Xe to (4,8): checks gen at (4,9). Gen can't go (3,9) own Ma, (5,9) own Ma,
    // (4,8) protected by Ma at (3,6). Checkmate.
    moves: [{ from: { col: 0, row: 8 }, to: { col: 4, row: 8 } }],
  },
  teaches: 'Combining pieces from all lessons for a checkmate',
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
  L4_P1,
  L4_P2,
  L4_P3,
  L4_P4,
  L4_P5,
  L5_P1,
  L5_P2,
  L5_P3,
  L5_P4,
  L5_P5,
  L6_P1,
  L6_P2,
  L6_P3,
  L6_P4,
  L6_P5,
  L7_P1,
  L7_P2,
  L7_P3,
  L7_P4,
  L7_P5,
}
