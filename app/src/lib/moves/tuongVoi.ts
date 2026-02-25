import type { Piece, Position } from '@/types/game'
import { isOnBoard, pieceAt, hasCrossedRiver } from './helpers'

const DIAGONALS = [
  [2, 2, 1, 1],
  [2, -2, 1, -1],
  [-2, 2, -1, 1],
  [-2, -2, -1, -1],
] as const // [destDCol, destDRow, eyeDCol, eyeDRow]

/** Elephant: 2 steps diagonal, eye-block rule, cannot cross river */
export function getTuongVoiMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = []
  const { col, row } = piece.position

  for (const [ddc, ddr, edc, edr] of DIAGONALS) {
    const destCol = col + ddc
    const destRow = row + ddr
    if (!isOnBoard(destCol, destRow)) continue

    // Cannot cross river
    if (hasCrossedRiver(destRow, piece.side)) continue

    // Eye block check
    const eyeCol = col + edc
    const eyeRow = row + edr
    if (pieceAt(pieces, eyeCol, eyeRow)) continue

    const occupant = pieceAt(pieces, destCol, destRow)
    if (occupant && occupant.side === piece.side) continue

    moves.push({ col: destCol, row: destRow })
  }

  return moves
}
