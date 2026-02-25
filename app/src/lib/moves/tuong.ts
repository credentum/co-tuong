import type { Piece, Position } from '@/types/game'
import { isInPalace, pieceAt } from './helpers'

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
] as const

/** General/King: one step orthogonal, confined to palace */
export function getTuongMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = []
  const { col, row } = piece.position

  for (const [dc, dr] of DIRECTIONS) {
    const c = col + dc
    const r = row + dr
    if (!isInPalace(c, r, piece.side)) continue
    const occupant = pieceAt(pieces, c, r)
    if (occupant && occupant.side === piece.side) continue
    moves.push({ col: c, row: r })
  }

  return moves
}
