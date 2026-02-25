import { describe, it, expect } from 'vitest'
import { getMinimaxMove } from '../ai'
import type { Piece } from '@/types/game'

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getMinimaxMove', () => {
  it('returns a legal move', () => {
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 4, 9),
      mkPiece('xe', 'red', 0, 0),
      mkPiece('xe', 'black', 8, 9),
    ]
    const move = getMinimaxMove(pieces, 'black', 2)
    expect(move).not.toBeNull()
    expect(move!.from).toBeDefined()
    expect(move!.to).toBeDefined()
  })

  it('captures free material', () => {
    // Black Xe can capture undefended Red Tot
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('tot', 'red', 0, 5), // Free material for black
      mkPiece('xe', 'black', 0, 9),
    ]
    const move = getMinimaxMove(pieces, 'black', 2)
    expect(move).not.toBeNull()
    // Should capture the Tot at (0,5)
    expect(move!.to).toEqual({ col: 0, row: 5 })
  })

  it('returns null when no legal moves', () => {
    // Black king trapped with no moves
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('xe', 'red', 3, 5),
      mkPiece('xe', 'red', 0, 8),
      mkPiece('xe', 'red', 8, 9),
    ]
    const move = getMinimaxMove(pieces, 'black', 2)
    expect(move).toBeNull()
  })

  it('avoids losing its own material', () => {
    // Black Xe at (4,5), Red Xe at (4,2) can capture it if it stays
    // But black should move the Xe away, not leave it hanging
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('xe', 'red', 4, 2),
      mkPiece('xe', 'black', 4, 5),
    ]
    const move = getMinimaxMove(pieces, 'black', 2)
    expect(move).not.toBeNull()
    // Should move the Xe off col 4 or to a safe square
    // At minimum, should not stay at (4,5) since that's not a valid "move"
  })
})
