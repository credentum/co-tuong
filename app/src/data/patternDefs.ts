import type { Piece } from '@/types/game'
import type { PatternDef } from '@/types/patterns'

const p = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

/**
 * Pattern curriculum definitions.
 * Patterns 1-10: Survival (defensive)
 * Patterns 11-20: Attack (offensive)
 *
 * Currently implementing patterns 1-3, remaining patterns TBD.
 */
export const PATTERN_DEFS: PatternDef[] = [
  {
    patternId: 1,
    name: 'Opening Cannon Trap',
    vietnamese: 'Bẫy Pháo Khai Cuộc',
    category: 'opening',
    concept:
      'Cannons can attack your Horses from move one using a piece as a screen. This is the most common way beginners lose material in the opening.',
    level: 'survival',
    seeIt: {
      startingPieces: [
        // Red starts with cannon on col 1 and will swing it to col 7.
        // Soldier already on col 7 as a screen. Horse on col 7 is the target.
        // Generals on different columns to avoid flying-generals issues throughout.
        p('tuong', 'red', 4, 0),
        p('si', 'red', 3, 0),
        p('si', 'red', 5, 0),
        p('phao', 'red', 1, 2), // cannon starts here
        p('tot', 'red', 7, 5), // soldier as screen on col 7 (crossed river)
        p('ma', 'red', 1, 0),
        p('tuong', 'black', 5, 9),
        p('si', 'black', 4, 9),
        p('si', 'black', 4, 8),
        p('ma', 'black', 7, 9), // target horse on col 7
        p('tuongVoi', 'black', 2, 9),
        p('tuongVoi', 'black', 6, 9),
        p('phao', 'black', 1, 7),
      ],
      playerSide: 'black',
      moves: [
        // Move 1: Red swings Cannon to col 7 — screen already in place
        { from: { col: 1, row: 2 }, to: { col: 7, row: 2 } },
        // Move 2: Black develops Cannon centrally, ignoring the threat
        { from: { col: 1, row: 7 }, to: { col: 4, row: 7 } },
        // Move 3: Red Cannon captures Horse through screen!
        { from: { col: 7, row: 2 }, to: { col: 7, row: 9 } },
        // Move 4: Black develops Elephant — too late, Horse is gone
        { from: { col: 6, row: 9 }, to: { col: 8, row: 7 } },
      ],
      annotations: [
        {
          text: "Red swings the Cannon to col 7. The Soldier on row 5 is already a screen — Black's Horse is in the crosshairs!",
        },
        {
          text: "Black develops the Cannon centrally, ignoring the threat. The Horse is still sitting on the Cannon's attack line.",
        },
        {
          text: 'The Cannon fires through the Soldier screen and captures the Horse for free!',
        },
        {
          text: 'Too late to react — a Horse is lost in the opening. Always check for Cannon lines when developing!',
        },
      ],
    },
    puzzleIds: ['PAT_01_S1', 'PAT_01_S2', 'PAT_01_S3', 'PAT_01_D1', 'PAT_01_D2'],
    coachingLink: {
      patternTrackerId: 'early_horse_loss',
      trigger: 'Horse captured in moves 1-6',
    },
  },
  {
    patternId: 2,
    name: 'Accidental Screen',
    vietnamese: 'Tạo Bệ Pháo Nhầm',
    category: 'midgame',
    concept:
      "You move a piece into a line between the opponent's Cannon and your General, accidentally creating a screen for the Cannon to capture through.",
    level: 'survival',
    seeIt: {
      startingPieces: [
        // Red gen at (5,0) so col 4 is safe for horse to move through.
        // Black phao at (4,7) aims down col 4.
        // Red ma at (2,2) will move to (4,3) which creates a screen on col 4
        // between the phao and... red si at (4,1). The cannon fires through ma(4,3) at si(4,1).
        // This is NOT self-check because gen is at (5,0), not on col 4.
        p('tuong', 'red', 5, 0),
        p('si', 'red', 4, 1),
        p('si', 'red', 3, 1),
        p('ma', 'red', 2, 2), // will move to create screen
        p('tuong', 'black', 4, 9),
        p('phao', 'black', 4, 7), // aiming at col 4
        p('xe', 'black', 0, 5),
      ],
      playerSide: 'red',
      moves: [
        // Move 1: Red moves Horse to strong-looking central position (BAD — creates screen)
        { from: { col: 2, row: 2 }, to: { col: 4, row: 3 } },
        // Move 2: Black Cannon fires through the Horse-screen to capture Advisor
        { from: { col: 4, row: 7 }, to: { col: 4, row: 1 } },
        // Move 3: Red responds by developing
        { from: { col: 5, row: 0 }, to: { col: 4, row: 0 } },
        // Move 4: Black Chariot attacks
        { from: { col: 0, row: 5 }, to: { col: 0, row: 0 } },
      ],
      annotations: [
        {
          text: "Red moves the Horse to a central square for development. Looks strong — but it's now sitting between the Cannon and the Advisor on col 4!",
        },
        {
          text: "The Cannon fires through the Horse! It's a screen — the Cannon jumps over the Horse to capture the Advisor.",
        },
        {
          text: 'Red is forced to reposition. Material is lost and the position is compromised.',
        },
        {
          text: 'Always check: does my move put a piece between an enemy Cannon and a valuable piece?',
        },
      ],
    },
    puzzleIds: ['PAT_02_S1', 'PAT_02_S2', 'PAT_02_S3', 'PAT_02_D1', 'PAT_02_D2'],
    coachingLink: {
      patternTrackerId: 'cannon_screen_missed',
      trigger: "Player moves a piece that becomes an opponent's Cannon screen",
    },
  },
  {
    patternId: 3,
    name: 'Flying General Pin',
    vietnamese: 'Ghim Đối Mặt Tướng',
    category: 'midgame',
    concept:
      "A piece standing on the file between the two Generals cannot move — it's pinned by the Flying General rule. Moving it would leave the Generals facing each other, which is illegal.",
    level: 'survival',
    seeIt: {
      startingPieces: [
        p('tuong', 'red', 4, 0),
        p('si', 'red', 3, 1),
        p('ma', 'red', 4, 5), // will become pinned
        p('tuong', 'black', 4, 9),
        p('si', 'black', 3, 8),
        p('xe', 'black', 0, 5), // will capture the pinned piece
      ],
      playerSide: 'red',
      moves: [
        // Move 1: Black Chariot moves closer to the same rank
        { from: { col: 0, row: 5 }, to: { col: 2, row: 5 } },
        // Move 2: Red realizes Horse is pinned, tries to save it by moving General
        { from: { col: 4, row: 0 }, to: { col: 3, row: 0 } },
        // Move 3: But Black Chariot captures the now-free Horse
        { from: { col: 2, row: 5 }, to: { col: 4, row: 5 } },
      ],
      annotations: [
        {
          text: "Both Generals are on the same file (col 4). Red's Horse is the only piece between them — it's PINNED.",
        },
        {
          text: 'Red tries to unpin by moving the General sideways.',
        },
        {
          text: "Too late — Black's Chariot was already threatening the Horse. It captures for free. The pin cost Red a Horse!",
        },
      ],
    },
    puzzleIds: ['PAT_03_S1', 'PAT_03_S2', 'PAT_03_S3', 'PAT_03_D1', 'PAT_03_D2'],
    coachingLink: {
      patternTrackerId: 'flying_general_pins_missed',
      trigger: 'Player attempts to move a piece pinned by Flying General rule',
    },
  },
]

/** Look up a pattern by ID */
export function getPatternById(id: number): PatternDef | undefined {
  return PATTERN_DEFS.find((p) => p.patternId === id)
}

/** Get patterns for a given level */
export function getPatternsByLevel(level: 'survival' | 'attack'): PatternDef[] {
  return PATTERN_DEFS.filter((p) => p.level === level)
}
