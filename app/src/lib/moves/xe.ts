import type { Piece, Position } from '@/types/game'
import { isOnBoard, pieceAt } from './helpers'

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
] as const

/** Chariot: slide orthogonally, stop on first occupant (capture if enemy) */
export function getXeMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = []
  const { col, row } = piece.position

  for (const [dc, dr] of DIRECTIONS) {
    let c = col + dc
    let r = row + dr
    while (isOnBoard(c, r)) {
      const occupant = pieceAt(pieces, c, r)
      if (occupant) {
        if (occupant.side !== piece.side) {
          moves.push({ col: c, row: r })
        }
        break
      }
      moves.push({ col: c, row: r })
      c += dc
      r += dr
    }
  }

  return moves
}
