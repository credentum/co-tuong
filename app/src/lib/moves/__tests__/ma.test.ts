import { describe, it, expect } from 'vitest'
import { getMaMoves } from '../ma'
import type { Piece } from '@/types/game'

const ma = (col: number, row: number, side: 'red' | 'black' = 'red'): Piece => ({
  type: 'ma',
  side,
  position: { col, row },
})

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getMaMoves', () => {
  it('has 8 moves from center of empty board', () => {
    const piece = ma(4, 5)
    const moves = getMaMoves(piece, [piece])
    expect(moves).toHaveLength(8)
  })

  it('has 2 moves from corner', () => {
    const piece = ma(0, 0)
    const moves = getMaMoves(piece, [piece])
    expect(moves).toHaveLength(2)
    expect(moves).toContainEqual({ col: 1, row: 2 })
    expect(moves).toContainEqual({ col: 2, row: 1 })
  })

  it('leg block prevents move', () => {
    const piece = ma(4, 5)
    // Block the upward leg (4,6)
    const blocker = mkPiece('tot', 'red', 4, 6)
    const moves = getMaMoves(piece, [piece, blocker])
    // Two upward L-moves blocked: (3,7) and (5,7)
    expect(moves).not.toContainEqual({ col: 3, row: 7 })
    expect(moves).not.toContainEqual({ col: 5, row: 7 })
    expect(moves).toHaveLength(6)
  })

  it('captures enemy piece', () => {
    const piece = ma(4, 5)
    const enemy = mkPiece('tot', 'black', 5, 7)
    const moves = getMaMoves(piece, [piece, enemy])
    expect(moves).toContainEqual({ col: 5, row: 7 })
  })

  it('blocked by friendly at destination', () => {
    const piece = ma(4, 5)
    const friendly = mkPiece('tot', 'red', 5, 7)
    const moves = getMaMoves(piece, [piece, friendly])
    expect(moves).not.toContainEqual({ col: 5, row: 7 })
    expect(moves).toHaveLength(7)
  })

  it('fully blocked by 4 leg blockers has 0 moves', () => {
    const piece = ma(4, 5)
    const blockers: Piece[] = [
      mkPiece('tot', 'red', 4, 6), // up leg
      mkPiece('tot', 'red', 4, 4), // down leg
      mkPiece('tot', 'red', 5, 5), // right leg
      mkPiece('tot', 'red', 3, 5), // left leg
    ]
    const moves = getMaMoves(piece, [piece, ...blockers])
    expect(moves).toHaveLength(0)
  })
})
