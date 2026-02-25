import type { Piece, Position } from '@/types/game'
import { isInPalace, pieceAt } from './helpers'

const DIAGONALS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const

/** Advisor: one step diagonal, confined to palace */
export function getSiMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = []
  const { col, row } = piece.position

  for (const [dc, dr] of DIAGONALS) {
    const c = col + dc
    const r = row + dr
    if (!isInPalace(c, r, piece.side)) continue
    const occupant = pieceAt(pieces, c, r)
    if (occupant && occupant.side === piece.side) continue
    moves.push({ col: c, row: r })
  }

  return moves
}
