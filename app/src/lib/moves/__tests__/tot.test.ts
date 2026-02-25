import { describe, it, expect } from 'vitest'
import { getTotMoves } from '../tot'
import type { Piece } from '@/types/game'

const tot = (col: number, row: number, side: 'red' | 'black' = 'red'): Piece => ({
  type: 'tot',
  side,
  position: { col, row },
})

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getTotMoves', () => {
  it('red soldier before river moves forward only', () => {
    const piece = tot(4, 3)
    const moves = getTotMoves(piece, [piece])
    expect(moves).toHaveLength(1)
    expect(moves).toContainEqual({ col: 4, row: 4 })
  })

  it('red soldier after river has forward + sideways', () => {
    const piece = tot(4, 6)
    const moves = getTotMoves(piece, [piece])
    expect(moves).toHaveLength(3)
    expect(moves).toContainEqual({ col: 4, row: 7 }) // forward
    expect(moves).toContainEqual({ col: 3, row: 6 }) // left
    expect(moves).toContainEqual({ col: 5, row: 6 }) // right
  })

  it('red soldier at top edge cannot move forward', () => {
    const piece = tot(4, 9)
    const moves = getTotMoves(piece, [piece])
    // Only sideways (crossed river, row 9 = top)
    expect(moves).toHaveLength(2)
    expect(moves).toContainEqual({ col: 3, row: 9 })
    expect(moves).toContainEqual({ col: 5, row: 9 })
  })

  it('black soldier before river moves forward (down)', () => {
    const piece = tot(4, 6, 'black')
    const moves = getTotMoves(piece, [piece])
    expect(moves).toHaveLength(1)
    expect(moves).toContainEqual({ col: 4, row: 5 })
  })

  it('black soldier after river has forward + sideways', () => {
    const piece = tot(4, 3, 'black')
    const moves = getTotMoves(piece, [piece])
    expect(moves).toHaveLength(3)
    expect(moves).toContainEqual({ col: 4, row: 2 })
    expect(moves).toContainEqual({ col: 3, row: 3 })
    expect(moves).toContainEqual({ col: 5, row: 3 })
  })

  it('captures enemy piece', () => {
    const piece = tot(4, 3)
    const enemy = mkPiece('tot', 'black', 4, 4)
    const moves = getTotMoves(piece, [piece, enemy])
    expect(moves).toContainEqual({ col: 4, row: 4 })
  })

  it('blocked by friendly piece', () => {
    const piece = tot(4, 3)
    const friendly = mkPiece('tot', 'red', 4, 4)
    const moves = getTotMoves(piece, [piece, friendly])
    expect(moves).toHaveLength(0)
  })

  it('edge column after river only has 2 moves', () => {
    const piece = tot(0, 6)
    const moves = getTotMoves(piece, [piece])
    expect(moves).toHaveLength(2) // forward + right only
    expect(moves).toContainEqual({ col: 0, row: 7 })
    expect(moves).toContainEqual({ col: 1, row: 6 })
  })
})
