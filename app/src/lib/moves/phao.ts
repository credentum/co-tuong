import type { Piece, Position } from '@/types/game'
import { isOnBoard, pieceAt } from './helpers'

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
] as const

/** Cannon: slides orthogonally for non-capture. Captures by jumping exactly one piece (screen). */
export function getPhaoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = []
  const { col, row } = piece.position

  for (const [dc, dr] of DIRECTIONS) {
    let c = col + dc
    let r = row + dr
    let screenFound = false

    while (isOnBoard(c, r)) {
      const occupant = pieceAt(pieces, c, r)

      if (!screenFound) {
        if (occupant) {
          // First piece encountered becomes the screen
          screenFound = true
        } else {
          // Empty square before screen — can move here (non-capture)
          moves.push({ col: c, row: r })
        }
      } else {
        // After screen — can only land on enemy piece (capture)
        if (occupant) {
          if (occupant.side !== piece.side) {
            moves.push({ col: c, row: r })
          }
          break // Whether capture or friendly, stop scanning
        }
      }

      c += dc
      r += dr
    }
  }

  return moves
}
