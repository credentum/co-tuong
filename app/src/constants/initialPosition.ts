import type { Piece } from '@/types/game'

// Standard Cờ tướng starting position
// Row 0 = Red's back rank (bottom), Row 9 = Black's back rank (top)
// Col 0 = leftmost column (from Red's perspective)
export const INITIAL_POSITION: Piece[] = [
  // === Red pieces (rows 0-4) ===

  // Back rank (row 0)
  { type: 'xe', side: 'red', position: { col: 0, row: 0 } },
  { type: 'ma', side: 'red', position: { col: 1, row: 0 } },
  { type: 'tuongVoi', side: 'red', position: { col: 2, row: 0 } },
  { type: 'si', side: 'red', position: { col: 3, row: 0 } },
  { type: 'tuong', side: 'red', position: { col: 4, row: 0 } },
  { type: 'si', side: 'red', position: { col: 5, row: 0 } },
  { type: 'tuongVoi', side: 'red', position: { col: 6, row: 0 } },
  { type: 'ma', side: 'red', position: { col: 7, row: 0 } },
  { type: 'xe', side: 'red', position: { col: 8, row: 0 } },

  // Cannons (row 2)
  { type: 'phao', side: 'red', position: { col: 1, row: 2 } },
  { type: 'phao', side: 'red', position: { col: 7, row: 2 } },

  // Soldiers (row 3)
  { type: 'tot', side: 'red', position: { col: 0, row: 3 } },
  { type: 'tot', side: 'red', position: { col: 2, row: 3 } },
  { type: 'tot', side: 'red', position: { col: 4, row: 3 } },
  { type: 'tot', side: 'red', position: { col: 6, row: 3 } },
  { type: 'tot', side: 'red', position: { col: 8, row: 3 } },

  // === Black pieces (rows 5-9) ===

  // Soldiers (row 6)
  { type: 'tot', side: 'black', position: { col: 0, row: 6 } },
  { type: 'tot', side: 'black', position: { col: 2, row: 6 } },
  { type: 'tot', side: 'black', position: { col: 4, row: 6 } },
  { type: 'tot', side: 'black', position: { col: 6, row: 6 } },
  { type: 'tot', side: 'black', position: { col: 8, row: 6 } },

  // Cannons (row 7)
  { type: 'phao', side: 'black', position: { col: 1, row: 7 } },
  { type: 'phao', side: 'black', position: { col: 7, row: 7 } },

  // Back rank (row 9)
  { type: 'xe', side: 'black', position: { col: 0, row: 9 } },
  { type: 'ma', side: 'black', position: { col: 1, row: 9 } },
  { type: 'tuongVoi', side: 'black', position: { col: 2, row: 9 } },
  { type: 'si', side: 'black', position: { col: 3, row: 9 } },
  { type: 'tuong', side: 'black', position: { col: 4, row: 9 } },
  { type: 'si', side: 'black', position: { col: 5, row: 9 } },
  { type: 'tuongVoi', side: 'black', position: { col: 6, row: 9 } },
  { type: 'ma', side: 'black', position: { col: 7, row: 9 } },
  { type: 'xe', side: 'black', position: { col: 8, row: 9 } },
]
