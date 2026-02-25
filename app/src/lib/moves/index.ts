import type { Piece, Position } from '@/types/game'
import { getXeMoves } from './xe'
import { getTuongMoves } from './tuong'
import { getSiMoves } from './si'
import { getTotMoves } from './tot'

/** Returns pseudo-legal moves for the given piece. Unimplemented types return []. */
export function getLegalMoves(piece: Piece, pieces: Piece[]): Position[] {
  switch (piece.type) {
    case 'xe':
      return getXeMoves(piece, pieces)
    case 'tuong':
      return getTuongMoves(piece, pieces)
    case 'si':
      return getSiMoves(piece, pieces)
    case 'tot':
      return getTotMoves(piece, pieces)
    default:
      return []
  }
}
