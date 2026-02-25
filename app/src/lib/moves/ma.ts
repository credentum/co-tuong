import type { Piece, Position } from '@/types/game'
import { isOnBoard, pieceAt } from './helpers'

// Each move: [legDCol, legDRow, destDCol, destDRow]
// The leg is the orthogonal step; if blocked, the move is illegal
const MOVES = [
  [0, 1, 1, 2],
  [0, 1, -1, 2],
  [0, -1, 1, -2],
  [0, -1, -1, -2],
  [1, 0, 2, 1],
  [1, 0, 2, -1],
  [-1, 0, -2, 1],
  [-1, 0, -2, -1],
] as const

/** Horse: L-shape move with leg-block rule */
export function getMaMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = []
  const { col, row } = piece.position

  for (const [ldc, ldr, ddc, ddr] of MOVES) {
    // Check leg block
    const legCol = col + ldc
    const legRow = row + ldr
    if (pieceAt(pieces, legCol, legRow)) continue

    // Check destination
    const destCol = col + ddc
    const destRow = row + ddr
    if (!isOnBoard(destCol, destRow)) continue

    const occupant = pieceAt(pieces, destCol, destRow)
    if (occupant && occupant.side === piece.side) continue

    moves.push({ col: destCol, row: destRow })
  }

  return moves
}
