import type { Piece, Position } from '@/types/game'
import { getXeMoves } from './xe'
import { getTuongMoves } from './tuong'
import { getSiMoves } from './si'
import { getTotMoves } from './tot'
import { getPhaoMoves } from './phao'
import { getMaMoves } from './ma'
import { getTuongVoiMoves } from './tuongVoi'

/** Returns pseudo-legal moves for the given piece. */
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
    case 'phao':
      return getPhaoMoves(piece, pieces)
    case 'ma':
      return getMaMoves(piece, pieces)
    case 'tuongVoi':
      return getTuongVoiMoves(piece, pieces)
  }
}
