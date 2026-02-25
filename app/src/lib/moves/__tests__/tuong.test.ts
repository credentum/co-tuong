import { describe, it, expect } from 'vitest'
import { getTuongMoves } from '../tuong'
import type { Piece } from '@/types/game'

const tuong = (col: number, row: number, side: 'red' | 'black' = 'red'): Piece => ({
  type: 'tuong',
  side,
  position: { col, row },
})

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getTuongMoves', () => {
  it('has 4 moves from palace center (red)', () => {
    const piece = tuong(4, 1)
    const moves = getTuongMoves(piece, [piece])
    expect(moves).toHaveLength(4)
  })

  it('has 2 moves from corner (red)', () => {
    const piece = tuong(3, 0)
    const moves = getTuongMoves(piece, [piece])
    expect(moves).toHaveLength(2)
    expect(moves).toContainEqual({ col: 4, row: 0 })
    expect(moves).toContainEqual({ col: 3, row: 1 })
  })

  it('has 4 moves from palace center (black)', () => {
    const piece = tuong(4, 8, 'black')
    const moves = getTuongMoves(piece, [piece])
    expect(moves).toHaveLength(4)
  })

  it('cannot leave palace', () => {
    const piece = tuong(3, 2)
    const moves = getTuongMoves(piece, [piece])
    expect(moves.every((m) => m.col >= 3 && m.col <= 5 && m.row >= 0 && m.row <= 2)).toBe(true)
  })

  it('can capture enemy in palace', () => {
    const piece = tuong(4, 1)
    const enemy = mkPiece('tot', 'black', 4, 2)
    const moves = getTuongMoves(piece, [piece, enemy])
    expect(moves).toContainEqual({ col: 4, row: 2 })
  })

  it('blocked by friendly piece', () => {
    const piece = tuong(4, 1)
    const friendly = mkPiece('si', 'red', 4, 2)
    const moves = getTuongMoves(piece, [piece, friendly])
    expect(moves).not.toContainEqual({ col: 4, row: 2 })
  })
})
