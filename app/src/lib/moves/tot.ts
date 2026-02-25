import type { Piece, Position } from '@/types/game'
import { isOnBoard, pieceAt, hasCrossedRiver } from './helpers'

/** Soldier: forward one step; after crossing river, also left/right. Never backward. */
export function getTotMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = []
  const { col, row } = piece.position
  const forward = piece.side === 'red' ? 1 : -1

  // Always: one step forward
  const candidates: [number, number][] = [[col, row + forward]]

  // After crossing river: also left and right
  if (hasCrossedRiver(row, piece.side)) {
    candidates.push([col - 1, row], [col + 1, row])
  }

  for (const [c, r] of candidates) {
    if (!isOnBoard(c, r)) continue
    const occupant = pieceAt(pieces, c, r)
    if (occupant && occupant.side === piece.side) continue
    moves.push({ col: c, row: r })
  }

  return moves
}
