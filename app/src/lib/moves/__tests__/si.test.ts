import { describe, it, expect } from 'vitest'
import { getSiMoves } from '../si'
import type { Piece } from '@/types/game'

const si = (col: number, row: number, side: 'red' | 'black' = 'red'): Piece => ({
  type: 'si',
  side,
  position: { col, row },
})

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getSiMoves', () => {
  it('has 4 moves from palace center (red)', () => {
    const piece = si(4, 1)
    const moves = getSiMoves(piece, [piece])
    expect(moves).toHaveLength(4)
    expect(moves).toContainEqual({ col: 3, row: 0 })
    expect(moves).toContainEqual({ col: 5, row: 0 })
    expect(moves).toContainEqual({ col: 3, row: 2 })
    expect(moves).toContainEqual({ col: 5, row: 2 })
  })

  it('has 1 move from corner', () => {
    const piece = si(3, 0)
    const moves = getSiMoves(piece, [piece])
    expect(moves).toHaveLength(1)
    expect(moves).toContainEqual({ col: 4, row: 1 })
  })

  it('blocked by friendly piece', () => {
    const piece = si(4, 1)
    const friendly = mkPiece('tuong', 'red', 3, 0)
    const moves = getSiMoves(piece, [piece, friendly])
    expect(moves).not.toContainEqual({ col: 3, row: 0 })
    expect(moves).toHaveLength(3)
  })

  it('captures enemy piece', () => {
    const piece = si(4, 1)
    const enemy = mkPiece('tot', 'black', 3, 0)
    const moves = getSiMoves(piece, [piece, enemy])
    expect(moves).toContainEqual({ col: 3, row: 0 })
  })

  it('stays within black palace', () => {
    const piece = si(4, 8, 'black')
    const moves = getSiMoves(piece, [piece])
    expect(moves).toHaveLength(4)
    expect(moves.every((m) => m.col >= 3 && m.col <= 5 && m.row >= 7 && m.row <= 9)).toBe(true)
  })
})
