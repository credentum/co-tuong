import type { Piece } from '@/types/game'
import type { PracticePuzzleDef, PracticeDifficulty } from '@/types/practice'

const p = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

// ==================== EASY -- 1-move puzzles ====================

export const PR_E1: PracticePuzzleDef = {
  puzzleId: 'PR_E1',
  title: 'Chariot Checkmate',
  difficulty: 'easy',
  prompt: 'Checkmate in 1 -- Red to move',
  concept: 'checkmate_in_1',
  hint: 'Slide the Chariot along the column to give check. The flying generals rule traps the General.',
  setup: {
    playerSide: 'red',
    // Red gen(4,0), Xe(0,7). Black gen(3,9).
    // Xe(0,7)->(3,7) check col 3. Gen can't go to (3,8) (Xe attacks),
    // (4,9) or (4,8) would cause flying generals with red gen on col 4.
    pieces: [p('tuong', 'red', 4, 0), p('xe', 'red', 0, 7), p('tuong', 'black', 3, 9)],
  },
  solution: [{ playerMove: { from: { col: 0, row: 7 }, to: { col: 3, row: 7 } } }],
}

export const PR_E2: PracticePuzzleDef = {
  puzzleId: 'PR_E2',
  title: 'Cannon Capture',
  difficulty: 'easy',
  prompt: 'Win material -- Red to move',
  concept: 'cannon_screen',
  hint: 'Fire the Cannon through the screen to capture the unprotected Chariot.',
  setup: {
    playerSide: 'red',
    // Phao(0,5) fires through tot(5,5) to capture Xe(8,5).
    pieces: [
      p('tuong', 'red', 4, 0),
      p('phao', 'red', 0, 5),
      p('tuong', 'black', 3, 9),
      p('xe', 'black', 8, 5),
      p('tot', 'black', 5, 5),
    ],
  },
  solution: [{ playerMove: { from: { col: 0, row: 5 }, to: { col: 8, row: 5 } } }],
}

export const PR_E3: PracticePuzzleDef = {
  puzzleId: 'PR_E3',
  title: 'Horse Fork',
  difficulty: 'easy',
  prompt: 'Win material with a Horse fork -- Red to move',
  concept: 'horse_fork',
  hint: 'The Horse can attack two pieces at once.',
  setup: {
    playerSide: 'red',
    // Ma(3,5)->(4,7): forks gen(5,9) and Xe(6,8).
    pieces: [
      p('tuong', 'red', 4, 0),
      p('ma', 'red', 3, 5),
      p('tuong', 'black', 5, 9),
      p('xe', 'black', 6, 8),
      p('si', 'black', 4, 8),
    ],
  },
  solution: [{ playerMove: { from: { col: 3, row: 5 }, to: { col: 4, row: 7 } } }],
}

export const PR_E4: PracticePuzzleDef = {
  puzzleId: 'PR_E4',
  title: 'Free Capture',
  difficulty: 'easy',
  prompt: 'Win material -- Red to move',
  concept: 'material_gain',
  hint: "One of Black's pieces is unprotected.",
  setup: {
    playerSide: 'red',
    // Xe(0,7) captures unprotected Phao(6,7).
    pieces: [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 0, 7),
      p('tuong', 'black', 5, 9),
      p('phao', 'black', 6, 7),
      p('si', 'black', 4, 8),
    ],
  },
  solution: [{ playerMove: { from: { col: 0, row: 7 }, to: { col: 6, row: 7 } } }],
}

export const PR_E5: PracticePuzzleDef = {
  puzzleId: 'PR_E5',
  title: 'Soldier Strike',
  difficulty: 'easy',
  prompt: 'Capture with the Soldier -- Red to move',
  concept: 'material_gain',
  hint: 'The Soldier has crossed the river and can move sideways.',
  setup: {
    playerSide: 'red',
    // Tot(5,7) captures unprotected Ma(6,7) sideways.
    pieces: [
      p('tuong', 'red', 4, 0),
      p('tot', 'red', 5, 7),
      p('tuong', 'black', 3, 9),
      p('ma', 'black', 6, 7),
      p('si', 'black', 4, 9),
    ],
  },
  solution: [{ playerMove: { from: { col: 5, row: 7 }, to: { col: 6, row: 7 } } }],
}

// ==================== MEDIUM -- 2-move puzzles ====================

export const PR_M1: PracticePuzzleDef = {
  puzzleId: 'PR_M1',
  title: 'Double Chariot Mate',
  difficulty: 'medium',
  prompt: 'Checkmate in 2 -- Red to move',
  concept: 'checkmate_in_2',
  hint: 'Check from one Chariot to force the General to the side, then deliver mate with the other.',
  setup: {
    playerSide: 'red',
    // Xe(8,8)->(4,8) check. Gen(4,9) must go to (5,9) [flying blocks (3,9)].
    // Xe(8,7)->(5,7) checkmate: col 5 controls (5,8)+(5,9), col 4 controls (4,9).
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 8, 8),
      p('xe', 'red', 8, 7),
      p('tuong', 'black', 4, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 8, row: 8 }, to: { col: 4, row: 8 } },
      opponentResponse: { from: { col: 4, row: 9 }, to: { col: 5, row: 9 } },
    },
    {
      playerMove: { from: { col: 8, row: 7 }, to: { col: 5, row: 7 } },
    },
  ],
}

export const PR_M2: PracticePuzzleDef = {
  puzzleId: 'PR_M2',
  title: 'Chariot Staircase',
  difficulty: 'medium',
  prompt: 'Checkmate in 2 -- Red to move',
  concept: 'checkmate_in_2',
  hint: 'Use both Chariots to create a staircase pattern that traps the General.',
  setup: {
    playerSide: 'red',
    // Xe(0,8)->(4,8) check. Gen can go to (5,9) [flying blocks (3,9)].
    // Xe(0,7)->(5,7) checkmate.
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 0, 8),
      p('xe', 'red', 0, 7),
      p('tuong', 'black', 4, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 0, row: 8 }, to: { col: 4, row: 8 } },
      opponentResponse: { from: { col: 4, row: 9 }, to: { col: 5, row: 9 } },
    },
    {
      playerMove: { from: { col: 0, row: 7 }, to: { col: 5, row: 7 } },
    },
  ],
}

export const PR_M3: PracticePuzzleDef = {
  puzzleId: 'PR_M3',
  title: 'Horse Discovery',
  difficulty: 'medium',
  prompt: 'Win material with a discovered check -- Red to move',
  concept: 'discovered_check',
  hint: 'Move the Horse to uncover a Chariot attack on the General.',
  setup: {
    playerSide: 'red',
    // Ma(5,6) blocks Xe(5,3) from checking gen(5,9) on col 5.
    // Step 1: Ma(5,6)->(7,5) uncovers check. Gen forced to (4,9).
    // Step 2: Ma(7,5)->(8,7) captures unprotected Phao.
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 5, 3),
      p('ma', 'red', 5, 6),
      p('tuong', 'black', 5, 9),
      p('si', 'black', 4, 8),
      p('phao', 'black', 8, 7),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 5, row: 6 }, to: { col: 7, row: 5 } },
      opponentResponse: { from: { col: 5, row: 9 }, to: { col: 4, row: 9 } },
    },
    {
      playerMove: { from: { col: 7, row: 5 }, to: { col: 8, row: 7 } },
    },
  ],
}

export const PR_M4: PracticePuzzleDef = {
  puzzleId: 'PR_M4',
  title: 'Pin and Win',
  difficulty: 'medium',
  prompt: 'Win material in 2 -- Red to move',
  concept: 'pin',
  hint: 'Pin a piece against the General on a column, then capture it.',
  setup: {
    playerSide: 'red',
    // Xe(0,5)->(3,5) pins Ma(3,7) against gen(3,9) on col 3.
    // Ma can't move off col 3 without exposing gen.
    // Opponent plays Si. Then Xe captures pinned Ma.
    pieces: [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 0, 5),
      p('tuong', 'black', 3, 9),
      p('ma', 'black', 3, 7),
      p('si', 'black', 4, 8),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 0, row: 5 }, to: { col: 3, row: 5 } },
      opponentResponse: { from: { col: 4, row: 8 }, to: { col: 5, row: 7 } },
    },
    {
      playerMove: { from: { col: 3, row: 5 }, to: { col: 3, row: 7 } },
    },
  ],
}

export const PR_M5: PracticePuzzleDef = {
  puzzleId: 'PR_M5',
  title: 'Horse Check Fork',
  difficulty: 'medium',
  prompt: 'Win material in 2 -- Red to move',
  concept: 'horse_fork',
  hint: 'Check the General with the Horse while forking a valuable piece.',
  setup: {
    playerSide: 'red',
    // Ma(3,5)->(4,7) checks gen(3,9) via attack on (3,9) and forks Xe(5,9).
    // Gen must flee (3,8). Then Ma captures the Xe.
    pieces: [
      p('tuong', 'red', 4, 0),
      p('ma', 'red', 3, 5),
      p('tuong', 'black', 3, 9),
      p('xe', 'black', 5, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 3, row: 5 }, to: { col: 4, row: 7 } },
      opponentResponse: { from: { col: 3, row: 9 }, to: { col: 3, row: 8 } },
    },
    {
      playerMove: { from: { col: 4, row: 7 }, to: { col: 5, row: 9 } },
    },
  ],
}

// ==================== HARD -- 3-move puzzles ====================

export const PR_H1: PracticePuzzleDef = {
  puzzleId: 'PR_H1',
  title: 'Chariot-Cannon Battery',
  difficulty: 'hard',
  prompt: 'Checkmate in 3 -- Red to move',
  concept: 'checkmate_in_3',
  hint: 'Drive the General back and forth with the Chariot, then fire the Cannon through a screen.',
  setup: {
    playerSide: 'red',
    // Xe checks on col 4 and col 5 alternately, driving gen between (4,9) and (5,9).
    // Then Phao fires through tot screen on col 4 for checkmate.
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 0, 7),
      p('phao', 'red', 0, 2),
      p('tot', 'red', 4, 5),
      p('tuong', 'black', 4, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 0, row: 7 }, to: { col: 4, row: 7 } },
      opponentResponse: { from: { col: 4, row: 9 }, to: { col: 5, row: 9 } },
    },
    {
      playerMove: { from: { col: 4, row: 7 }, to: { col: 5, row: 7 } },
      opponentResponse: { from: { col: 5, row: 9 }, to: { col: 4, row: 9 } },
    },
    {
      playerMove: { from: { col: 0, row: 2 }, to: { col: 4, row: 2 } },
    },
  ],
}

export const PR_H2: PracticePuzzleDef = {
  puzzleId: 'PR_H2',
  title: 'Chariot Chase',
  difficulty: 'hard',
  prompt: 'Checkmate in 3 -- Red to move',
  concept: 'checkmate_in_3',
  hint: 'Use both Chariots to chase the General across the palace, then close the net.',
  setup: {
    playerSide: 'red',
    // Xe(8,8) checks col 4, gen to (5,9). Xe follows to (5,8) check col 5, gen back to (4,9).
    // Second Xe(8,6) delivers mate on col 4 from distance.
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 8, 8),
      p('xe', 'red', 8, 6),
      p('tuong', 'black', 4, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 8, row: 8 }, to: { col: 4, row: 8 } },
      opponentResponse: { from: { col: 4, row: 9 }, to: { col: 5, row: 9 } },
    },
    {
      playerMove: { from: { col: 4, row: 8 }, to: { col: 5, row: 8 } },
      opponentResponse: { from: { col: 5, row: 9 }, to: { col: 4, row: 9 } },
    },
    {
      playerMove: { from: { col: 8, row: 6 }, to: { col: 4, row: 6 } },
    },
  ],
}

export const PR_H3: PracticePuzzleDef = {
  puzzleId: 'PR_H3',
  title: 'Zigzag Mate',
  difficulty: 'hard',
  prompt: 'Checkmate in 3 -- Red to move',
  concept: 'checkmate_in_3',
  hint: 'Check from alternating sides to herd the General into a final trap using flying generals.',
  setup: {
    playerSide: 'red',
    // Xe(0,8) checks col 4, gen to (3,9) [flying blocks (5,9)].
    // Xe follows to (3,8) check col 3, gen back to (4,9).
    // Second Xe(0,6) delivers mate on col 4.
    pieces: [
      p('tuong', 'red', 5, 0),
      p('xe', 'red', 0, 8),
      p('xe', 'red', 0, 6),
      p('tuong', 'black', 4, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 0, row: 8 }, to: { col: 4, row: 8 } },
      opponentResponse: { from: { col: 4, row: 9 }, to: { col: 3, row: 9 } },
    },
    {
      playerMove: { from: { col: 4, row: 8 }, to: { col: 3, row: 8 } },
      opponentResponse: { from: { col: 3, row: 9 }, to: { col: 4, row: 9 } },
    },
    {
      playerMove: { from: { col: 0, row: 6 }, to: { col: 4, row: 6 } },
    },
  ],
}

export const PR_H4: PracticePuzzleDef = {
  puzzleId: 'PR_H4',
  title: 'Cannon Crossfire',
  difficulty: 'hard',
  prompt: 'Checkmate in 3 -- Red to move',
  concept: 'checkmate_in_3',
  hint: 'Drive the General onto the Cannon firing line using the Chariot.',
  setup: {
    playerSide: 'red',
    // Xe checks col 5 then col 4, driving gen between (4,9) and (5,9).
    // Phao then fires through tot screen on col 5 for checkmate.
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 0, 8),
      p('phao', 'red', 0, 3),
      p('tot', 'red', 5, 6),
      p('tuong', 'black', 5, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 0, row: 8 }, to: { col: 5, row: 8 } },
      opponentResponse: { from: { col: 5, row: 9 }, to: { col: 4, row: 9 } },
    },
    {
      playerMove: { from: { col: 5, row: 8 }, to: { col: 4, row: 8 } },
      opponentResponse: { from: { col: 4, row: 9 }, to: { col: 5, row: 9 } },
    },
    {
      playerMove: { from: { col: 0, row: 3 }, to: { col: 5, row: 3 } },
    },
  ],
}

export const PR_H5: PracticePuzzleDef = {
  puzzleId: 'PR_H5',
  title: 'Horse Finishing Blow',
  difficulty: 'hard',
  prompt: 'Checkmate in 3 -- Red to move',
  concept: 'checkmate_in_3',
  hint: 'Use the Chariot to drive the General into the Horse attack range.',
  setup: {
    playerSide: 'red',
    // Xe checks col 4 then col 5, driving gen to (4,9).
    // Horse delivers checkmate from (6,8).
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 0, 8),
      p('ma', 'red', 8, 7),
      p('tuong', 'black', 4, 9),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 0, row: 8 }, to: { col: 4, row: 8 } },
      opponentResponse: { from: { col: 4, row: 9 }, to: { col: 5, row: 9 } },
    },
    {
      playerMove: { from: { col: 4, row: 8 }, to: { col: 5, row: 8 } },
      opponentResponse: { from: { col: 5, row: 9 }, to: { col: 4, row: 9 } },
    },
    {
      playerMove: { from: { col: 8, row: 7 }, to: { col: 6, row: 8 } },
    },
  ],
}

// ==================== REGISTRY ====================

export const ALL_PRACTICE_PUZZLES: Record<string, PracticePuzzleDef> = {
  PR_E1,
  PR_E2,
  PR_E3,
  PR_E4,
  PR_E5,
  PR_M1,
  PR_M2,
  PR_M3,
  PR_M4,
  PR_M5,
  PR_H1,
  PR_H2,
  PR_H3,
  PR_H4,
  PR_H5,
}

export const PRACTICE_PUZZLES_BY_DIFFICULTY: Record<PracticeDifficulty, string[]> = {
  easy: ['PR_E1', 'PR_E2', 'PR_E3', 'PR_E4', 'PR_E5'],
  medium: ['PR_M1', 'PR_M2', 'PR_M3', 'PR_M4', 'PR_M5'],
  hard: ['PR_H1', 'PR_H2', 'PR_H3', 'PR_H4', 'PR_H5'],
}
