import type { Piece, Position, Side } from '@/types/game'
import {
  COLS,
  ROWS,
  PALACE_COLS,
  PALACE_ROWS_RED,
  PALACE_ROWS_BLACK,
  RIVER_ROW_TOP,
} from '@/constants/board'

export function posEq(a: Position, b: Position): boolean {
  return a.col === b.col && a.row === b.row
}

export function isOnBoard(col: number, row: number): boolean {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS
}

export function pieceAt(pieces: Piece[], col: number, row: number): Piece | undefined {
  return pieces.find((p) => p.position.col === col && p.position.row === row)
}

export function isInPalace(col: number, row: number, side: Side): boolean {
  const palaceRows = side === 'red' ? PALACE_ROWS_RED : PALACE_ROWS_BLACK
  return (
    (PALACE_COLS as readonly number[]).includes(col) &&
    (palaceRows as readonly number[]).includes(row)
  )
}

export function hasCrossedRiver(row: number, side: Side): boolean {
  // Red pieces start at rows 0-4, so crossing river means row >= RIVER_ROW_TOP (5)
  // Black pieces start at rows 5-9, so crossing river means row < RIVER_ROW_TOP (5)
  return side === 'red' ? row >= RIVER_ROW_TOP : row < RIVER_ROW_TOP
}
