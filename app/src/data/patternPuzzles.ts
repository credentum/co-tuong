import type { Piece } from '@/types/game'
import type { PracticePuzzleDef } from '@/types/practice'

const p = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

// ==================== PATTERN 1: Opening Cannon Trap ====================
// Spot It — 3 puzzles

export const PAT_01_S1: PracticePuzzleDef = {
  puzzleId: 'PAT_01_S1',
  title: 'Block the Cannon Screen',
  difficulty: 'easy',
  prompt: 'Your Horse is targeted by the Cannon. Move your Horse to safety.',
  concept: 'cannon_screen',
  hint: "Move the Horse off the Cannon's attack line.",
  setup: {
    playerSide: 'black',
    // Red phao(7,2) fires through tot(7,4) at black ma(7,7).
    // Generals on different columns to avoid flying generals issues.
    // Black can move ma(7,7) to safety.
    // ma(7,7): legs: (7,6) up, (7,8) down, (6,7) left, (8,7) right.
    // Up leg (7,6) clear: → (6,5) or (8,5).
    // Down leg (7,8) clear: → (6,9) or (8,9).
    // Left leg (6,7) clear: → (5,6) or (5,8).
    // Right leg (8,7) clear: → can't go to (9,_) — off board.
    // All these get ma off col 7.
    pieces: [
      p('tuong', 'red', 4, 0),
      p('phao', 'red', 7, 2),
      p('tot', 'red', 7, 5), // screen (crossed river)
      p('tuong', 'black', 5, 9),
      p('ma', 'black', 7, 7), // target
      p('tuongVoi', 'black', 2, 9),
      p('tuongVoi', 'black', 6, 9),
      p('si', 'black', 4, 8),
    ],
  },
  solution: [
    // Move Horse to safety: ma(7,7) to (6,5)
    { playerMove: { from: { col: 7, row: 7 }, to: { col: 6, row: 5 } } },
  ],
}

export const PAT_01_S2: PracticePuzzleDef = {
  puzzleId: 'PAT_01_S2',
  title: 'Remove the Screen',
  difficulty: 'easy',
  prompt: 'The Cannon threatens your Horse. Capture its screen piece.',
  concept: 'cannon_screen',
  hint: 'If you capture the screen, the Cannon loses its attack.',
  setup: {
    playerSide: 'black',
    // Red phao(2,0) on col 2. Screen: red tot(2,4). Target: black ma(2,7).
    // Generals on different columns to avoid flying generals.
    // Black xe at (2,5) can capture the screen at (2,4).
    pieces: [
      p('tuong', 'red', 5, 0),
      p('phao', 'red', 2, 0), // cannon aiming down col 2
      p('tot', 'red', 2, 4), // screen
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 2, 7), // target
      p('xe', 'black', 2, 5), // can capture the screen at (2,4)
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
    ],
  },
  solution: [
    // Capture the screen: xe(2,5) captures tot(2,4)
    { playerMove: { from: { col: 2, row: 5 }, to: { col: 2, row: 4 } } },
  ],
}

export const PAT_01_S3: PracticePuzzleDef = {
  puzzleId: 'PAT_01_S3',
  title: 'Defend or Counter',
  difficulty: 'medium',
  prompt: 'The Cannon attacks your Horse through a screen. Find the best defense.',
  concept: 'cannon_screen',
  hint: "Can you move a piece to add a second blocker on the Cannon's line?",
  setup: {
    playerSide: 'black',
    // Red: gen(5,0), phao(7,1) aiming down col 7. Screen: red tot(7,4). Target: black ma(7,8).
    // Black tuongVoi at (5,9) can go to (7,7) — eye at (6,8), if empty.
    // After tuongVoi to (7,7): col 7 has phao(7,1), tot(7,4), tuongVoi(7,7), ma(7,8).
    // Two pieces between cannon and target = cannon can't fire. Defense!
    pieces: [
      p('tuong', 'red', 5, 0),
      p('phao', 'red', 7, 1),
      p('tot', 'red', 7, 5), // screen (crossed river)
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 7, 8), // target
      p('tuongVoi', 'black', 5, 9), // can interpose at (7,7)
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
    ],
  },
  solution: [
    // Interpose elephant: tuongVoi(5,9) to (7,7)
    { playerMove: { from: { col: 5, row: 9 }, to: { col: 7, row: 7 } } },
  ],
}

// Survive It — 2 puzzles

export const PAT_01_D1: PracticePuzzleDef = {
  puzzleId: 'PAT_01_D1',
  title: 'Horse Lost — Counter-Attack',
  difficulty: 'medium',
  prompt: 'Your Horse is already lost. Find the counter-attack that wins material back.',
  concept: 'cannon_screen',
  hint: 'Look for an undefended enemy piece you can capture.',
  setup: {
    playerSide: 'black',
    // Black lost a Horse. Red xe(8,3) is undefended. Black xe(8,7) can capture on col 8.
    // Generals on different columns to avoid flying generals.
    pieces: [
      p('tuong', 'red', 5, 0),
      p('phao', 'red', 1, 2),
      p('xe', 'red', 8, 3), // undefended
      p('tuong', 'black', 4, 9),
      p('xe', 'black', 8, 7), // can capture on col 8
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
      p('tuongVoi', 'black', 2, 7),
    ],
  },
  solution: [
    // Capture undefended Xe: xe(8,7) -> xe(8,3)
    { playerMove: { from: { col: 8, row: 7 }, to: { col: 8, row: 3 } } },
  ],
}

export const PAT_01_D2: PracticePuzzleDef = {
  puzzleId: 'PAT_01_D2',
  title: 'Reorganize After Loss',
  difficulty: 'medium',
  prompt: 'Your left Horse is gone. Protect the right Horse from the same Cannon trap.',
  concept: 'cannon_screen',
  hint: "Develop a piece to block the Cannon's line to your remaining Horse.",
  setup: {
    playerSide: 'black',
    // Red phao(7,2) aiming at col 7 with screen tot(7,4). Black ma(7,9) is the target.
    // tuongVoi(5,9) can interpose at (7,7) eye(6,8).
    // Generals on different columns.
    pieces: [
      p('tuong', 'red', 5, 0),
      p('phao', 'red', 7, 2),
      p('tot', 'red', 7, 5), // screen (crossed river)
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 7, 9), // target — remaining horse
      p('tuongVoi', 'black', 5, 9), // can interpose at (7,7)
      p('si', 'black', 3, 8),
    ],
  },
  solution: [
    // Interpose elephant: tuongVoi(5,9) to (7,7)
    { playerMove: { from: { col: 5, row: 9 }, to: { col: 7, row: 7 } } },
  ],
}

// ==================== PATTERN 2: Accidental Screen ====================
// Spot It — 3 puzzles

export const PAT_02_S1: PracticePuzzleDef = {
  puzzleId: 'PAT_02_S1',
  title: 'Safe Development',
  difficulty: 'easy',
  prompt: 'You want to develop your Horse. Find the square that does NOT create a Cannon screen.',
  concept: 'cannon_screen',
  hint: 'Check if the destination puts your Horse between the enemy Cannon and your General.',
  setup: {
    playerSide: 'red',
    // Black phao at (4,7) aiming at red gen(4,0) on col 4.
    // Red ma at (3,0). Leg (3,1) clear: -> (2,2) or (4,2).
    // (4,2) creates screen on col 4. (2,2) is safe.
    // Left leg (2,0) clear: -> (1,1). Safe.
    // Right leg (4,0): gen is there -> blocked.
    pieces: [
      p('tuong', 'red', 4, 0),
      p('ma', 'red', 3, 0),
      p('si', 'red', 5, 0),
      p('tuong', 'black', 4, 9),
      p('phao', 'black', 4, 7), // aiming at gen through col 4
    ],
  },
  solution: [
    // Safe move: ma(3,0) to (2,2) — doesn't create screen on col 4
    {
      playerMove: { from: { col: 3, row: 0 }, to: { col: 2, row: 2 } },
      alternativeMoves: [
        { from: { col: 3, row: 0 }, to: { col: 1, row: 1 } }, // also safe
      ],
    },
  ],
}

export const PAT_02_S2: PracticePuzzleDef = {
  puzzleId: 'PAT_02_S2',
  title: 'Spot the Danger',
  difficulty: 'easy',
  prompt: 'The enemy Cannon threatens your General. Move a piece WITHOUT creating a screen.',
  concept: 'cannon_screen',
  hint: 'Avoid putting pieces on the same file as the Cannon and your General.',
  setup: {
    playerSide: 'red',
    // Black phao at (3,8) on col 3. Red gen at (3,0). No screen yet.
    // Red has si at (4,1). Diagonals: (3,0)=gen, (5,0), (3,2), (5,2).
    // (3,2) is ON col 3 = creates screen. Bad.
    // (5,0) and (5,2) are safe.
    // Removed the second si at (5,0) so alt move (5,0) is valid.
    pieces: [
      p('tuong', 'red', 3, 0),
      p('si', 'red', 4, 1),
      p('tuong', 'black', 4, 9),
      p('phao', 'black', 3, 8),
    ],
  },
  solution: [
    // Safe: si(4,1) to (5,2) — not on col 3
    {
      playerMove: { from: { col: 4, row: 1 }, to: { col: 5, row: 2 } },
      alternativeMoves: [
        { from: { col: 4, row: 1 }, to: { col: 5, row: 0 } }, // also safe
      ],
    },
  ],
}

export const PAT_02_S3: PracticePuzzleDef = {
  puzzleId: 'PAT_02_S3',
  title: 'Elephant Without Screen',
  difficulty: 'medium',
  prompt: "Develop your Elephant safely. One diagonal creates a screen, the other doesn't.",
  concept: 'cannon_screen',
  hint: 'Check which Elephant destination is on the same file as the enemy Cannon.',
  setup: {
    playerSide: 'red',
    // Red tuongVoi at (4,2). Generals on different columns to avoid flying generals.
    // Elephant from (4,2): can go to (2,0) eye(3,1), (6,0) eye(5,1), (2,4) eye(3,3), (6,4) eye(5,3).
    // Black phao at (6,8) on col 6. Red xe at (6,0) on col 6.
    // Elephant to (6,4) creates screen: phao(6,8) fires through tuongVoi(6,4) at xe(6,0)!
    // Elephant to (2,4) is safe.
    // Gen at (5,0) is not on col 4, so tuongVoi moving off col 4 is fine.
    pieces: [
      p('tuong', 'red', 5, 0),
      p('tuongVoi', 'red', 4, 2),
      p('xe', 'red', 6, 0), // valuable piece on col 6
      p('si', 'red', 3, 1),
      p('tuong', 'black', 4, 9),
      p('phao', 'black', 6, 8), // aims at col 6
    ],
  },
  solution: [
    // Safe: tuongVoi(4,2) to (2,4) eye at (3,3) clear.
    { playerMove: { from: { col: 4, row: 2 }, to: { col: 2, row: 4 } } },
  ],
}

// Survive It — 2 puzzles

export const PAT_02_D1: PracticePuzzleDef = {
  puzzleId: 'PAT_02_D1',
  title: 'Screen Created — Escape!',
  difficulty: 'medium',
  prompt: 'You accidentally created a screen. The Cannon will capture next move. Find the escape.',
  concept: 'cannon_screen',
  hint: "Move the piece that's acting as the screen off the file.",
  setup: {
    playerSide: 'red',
    // Red gen(5,0) off col 7. Red ma accidentally moved to (7,3) — now a screen on col 7.
    // Black phao(7,8) fires through ma(7,3) at red xe(7,0). That's an attack on xe, not gen.
    // But wait — is this immediate? phao(7,8) through ma(7,3) at xe(7,0): one screen (ma), so yes.
    // But this is just a material threat, not check. Red gen is at (5,0), not in danger.
    // Red must move ma off col 7 to stop the cannon capturing xe.
    // ma(7,3): legs: (7,2) down, (7,4) up, (6,3) left, (8,3) right.
    // Down leg (7,2) clear: -> (6,1) or (8,1). Off col 7.
    // Up leg (7,4) clear: -> (6,5) or (8,5). Off col 7.
    // Left leg (6,3) clear: -> (5,2) or (5,4). Off col 7.
    // Right leg (8,3) clear: -> (can't go col 9) -> only valid if on board.
    // (8,3) right leg -> dest (9,2) and (9,4) = off board (col 9 invalid).
    pieces: [
      p('tuong', 'red', 5, 0),
      p('xe', 'red', 7, 0), // valuable piece threatened
      p('ma', 'red', 7, 3), // accidental screen
      p('si', 'red', 4, 1),
      p('tuong', 'black', 3, 9),
      p('phao', 'black', 7, 8), // threatens through screen at xe
    ],
  },
  solution: [
    // Move ma off col 7. Best: (6,5) — active square, breaks screen.
    {
      playerMove: { from: { col: 7, row: 3 }, to: { col: 6, row: 5 } },
      alternativeMoves: [
        { from: { col: 7, row: 3 }, to: { col: 8, row: 5 } },
        { from: { col: 7, row: 3 }, to: { col: 6, row: 1 } },
        { from: { col: 7, row: 3 }, to: { col: 8, row: 1 } },
        { from: { col: 7, row: 3 }, to: { col: 5, row: 2 } },
        { from: { col: 7, row: 3 }, to: { col: 5, row: 4 } },
      ],
    },
  ],
}

export const PAT_02_D2: PracticePuzzleDef = {
  puzzleId: 'PAT_02_D2',
  title: 'Break the Screen Line',
  difficulty: 'medium',
  prompt: 'Your Advisor became a screen for the Cannon. Move it to safety.',
  concept: 'cannon_screen',
  hint: 'The Advisor can move diagonally within the palace to get off the dangerous file.',
  setup: {
    playerSide: 'red',
    // Red gen(5,0) OFF col 3. Red si at (3,1) is a screen on col 3.
    // Black phao(3,8) fires through si(3,1) at... what's on col 3 below si?
    // Nothing at (3,0). So phao(3,8) through si(3,1) hits (3,0) = empty. No attack.
    // Need a target on col 3. Red xe at (3,0).
    // phao(3,8) through si(3,1) at xe(3,0). One screen = cannon fires!
    // But gen is at (5,0), not in check. This is a material threat.
    // Red must move si off col 3 to break the screen.
    // si(3,1) in palace: diagonals (4,0), (4,2). Only those within palace (cols 3-5, rows 0-2).
    // Also (2,0) is col 2 row 0 — but (2,0) is NOT in palace (col 2 < 3). Invalid.
    // Also (2,2) is col 2 — not in palace. Invalid.
    // So si(3,1) can go to (4,0) or (4,2). Both get si off col 3.
    pieces: [
      p('tuong', 'red', 5, 0),
      p('si', 'red', 3, 1), // screen on col 3
      p('xe', 'red', 3, 0), // target on col 3
      p('tuong', 'black', 4, 9),
      p('phao', 'black', 3, 8), // threatens through screen at xe
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 3, row: 1 }, to: { col: 4, row: 2 } },
      alternativeMoves: [{ from: { col: 3, row: 1 }, to: { col: 4, row: 0 } }],
    },
  ],
}

// ==================== PATTERN 3: Flying General Pin ====================
// Spot It — 3 puzzles

export const PAT_03_S1: PracticePuzzleDef = {
  puzzleId: 'PAT_03_S1',
  title: 'Capture the Pinned Piece',
  difficulty: 'easy',
  prompt: 'An enemy piece is pinned by the Flying General rule. Capture it for free.',
  concept: 'pin',
  hint: 'Find the piece on the same file as both Generals that cannot move.',
  setup: {
    playerSide: 'red',
    // Both generals on col 4. Red gen(4,0), black gen(4,9).
    // Black ma at (4,5) is pinned — only piece between generals on col 4.
    // Red xe at (0,5) can capture it: xe(0,5) -> (4,5) along row 5.
    pieces: [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 0, 5),
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 4, 5), // pinned by flying generals
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
    ],
  },
  solution: [
    // Capture pinned ma: xe(0,5) -> (4,5)
    { playerMove: { from: { col: 0, row: 5 }, to: { col: 4, row: 5 } } },
  ],
}

export const PAT_03_S2: PracticePuzzleDef = {
  puzzleId: 'PAT_03_S2',
  title: 'Find the Pinned Piece',
  difficulty: 'easy',
  prompt: 'Which piece is pinned? Capture it.',
  concept: 'pin',
  hint: 'Look at the file where both Generals stand.',
  setup: {
    playerSide: 'red',
    // Both generals on col 3. Red gen(3,0), black gen(3,9).
    // Black phao at (3,6) is pinned — between generals.
    // Red xe at (8,6) can capture: xe(8,6) -> (3,6) along row 6.
    pieces: [
      p('tuong', 'red', 3, 0),
      p('xe', 'red', 8, 6),
      p('si', 'red', 4, 1),
      p('tuong', 'black', 3, 9),
      p('phao', 'black', 3, 6), // pinned
      p('si', 'black', 4, 8),
    ],
  },
  solution: [{ playerMove: { from: { col: 8, row: 6 }, to: { col: 3, row: 6 } } }],
}

export const PAT_03_S3: PracticePuzzleDef = {
  puzzleId: 'PAT_03_S3',
  title: 'Unpin Your Piece',
  difficulty: 'medium',
  prompt: 'Your Cannon is pinned on the e-file. Move your General sideways to unpin it.',
  concept: 'pin',
  hint: 'If the Generals are no longer on the same file, the pin is broken.',
  setup: {
    playerSide: 'red',
    // Red gen(4,0), red phao at (4,4) pinned. Black gen(4,9).
    // Black xe at (4,6) threatens to capture phao(4,4) which can't move.
    // Solution: move gen(4,0) to (3,0) or (5,0) — unpin the cannon.
    pieces: [
      p('tuong', 'red', 4, 0),
      p('phao', 'red', 4, 4), // pinned by flying generals
      p('si', 'red', 3, 1),
      p('tuong', 'black', 4, 9),
      p('xe', 'black', 4, 6), // threatens pinned cannon
      p('si', 'black', 3, 8),
    ],
  },
  solution: [
    // Move general sideways to unpin: gen(4,0) to (3,0) or (5,0)
    {
      playerMove: { from: { col: 4, row: 0 }, to: { col: 3, row: 0 } },
      alternativeMoves: [{ from: { col: 4, row: 0 }, to: { col: 5, row: 0 } }],
    },
  ],
}

// Survive It — 2 puzzles

export const PAT_03_D1: PracticePuzzleDef = {
  puzzleId: 'PAT_03_D1',
  title: 'Release the Pin',
  difficulty: 'medium',
  prompt: 'Your Horse is pinned and under attack. Move your General to release it.',
  concept: 'pin',
  hint: 'Move the General off the shared file to break the Flying General pin.',
  setup: {
    playerSide: 'red',
    // Red gen(5,0), red ma at (5,4) pinned on col 5. Black gen(5,9).
    // Black xe at (5,7) will capture ma next move.
    // From (5,0): left (4,0), up (5,1). Both valid.
    pieces: [
      p('tuong', 'red', 5, 0),
      p('ma', 'red', 5, 4), // pinned
      p('si', 'red', 4, 1),
      p('tuong', 'black', 5, 9),
      p('xe', 'black', 5, 7), // threatens pinned horse
      p('si', 'black', 4, 8),
    ],
  },
  solution: [
    {
      playerMove: { from: { col: 5, row: 0 }, to: { col: 4, row: 0 } },
      alternativeMoves: [{ from: { col: 5, row: 0 }, to: { col: 5, row: 1 } }],
    },
  ],
}

export const PAT_03_D2: PracticePuzzleDef = {
  puzzleId: 'PAT_03_D2',
  title: 'Break the Double Pin',
  difficulty: 'hard',
  prompt: "Two pieces are on the Generals' shared file. Move one to unblock the other.",
  concept: 'pin',
  hint: 'One of the pinned pieces can move off the file — which one has a legal escape?',
  setup: {
    playerSide: 'red',
    // Red gen(4,0). Black gen(4,9). Col 4 has red tot(4,3) and red phao(4,5).
    // Both between generals. Neither individually pinned (2 pieces between).
    // Black xe at (4,7) threatening down col 4.
    // Red should move phao off col 4 (tot can't move sideways, hasn't crossed river).
    pieces: [
      p('tuong', 'red', 4, 0),
      p('tot', 'red', 4, 3), // can't move sideways (hasn't crossed river)
      p('phao', 'red', 4, 5), // can move along rank 5
      p('si', 'red', 3, 1),
      p('tuong', 'black', 4, 9),
      p('xe', 'black', 4, 7), // threatening down col 4
      p('si', 'black', 3, 8),
    ],
  },
  solution: [
    // Move phao off col 4. Tot stays protected by flying generals.
    {
      playerMove: { from: { col: 4, row: 5 }, to: { col: 0, row: 5 } },
      alternativeMoves: [
        { from: { col: 4, row: 5 }, to: { col: 1, row: 5 } },
        { from: { col: 4, row: 5 }, to: { col: 2, row: 5 } },
        { from: { col: 4, row: 5 }, to: { col: 3, row: 5 } },
        { from: { col: 4, row: 5 }, to: { col: 5, row: 5 } },
        { from: { col: 4, row: 5 }, to: { col: 6, row: 5 } },
        { from: { col: 4, row: 5 }, to: { col: 7, row: 5 } },
        { from: { col: 4, row: 5 }, to: { col: 8, row: 5 } },
      ],
    },
  ],
}

// ==================== Puzzle Index ====================

export const ALL_PATTERN_PUZZLES: Record<string, PracticePuzzleDef> = {
  PAT_01_S1,
  PAT_01_S2,
  PAT_01_S3,
  PAT_01_D1,
  PAT_01_D2,
  PAT_02_S1,
  PAT_02_S2,
  PAT_02_S3,
  PAT_02_D1,
  PAT_02_D2,
  PAT_03_S1,
  PAT_03_S2,
  PAT_03_S3,
  PAT_03_D1,
  PAT_03_D2,
}
