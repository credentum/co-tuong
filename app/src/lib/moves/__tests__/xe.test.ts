import { describe, it, expect } from 'vitest'
import { getXeMoves } from '../xe'
import type { Piece } from '@/types/game'

const xe = (col: number, row: number, side: 'red' | 'black' = 'red'): Piece => ({
  type: 'xe',
  side,
  position: { col, row },
})

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getXeMoves', () => {
  it('generates full cross on empty board', () => {
    const piece = xe(4, 5)
    const moves = getXeMoves(piece, [piece])
    // 4 left + 4 right + 5 up + 4 down = 17
    expect(moves).toHaveLength(17)
  })

  it('generates correct moves from corner', () => {
    const piece = xe(0, 0)
    const moves = getXeMoves(piece, [piece])
    // 8 right + 9 up = 17
    expect(moves).toHaveLength(17)
  })

  it('stops at friendly piece', () => {
    const piece = xe(0, 0)
    const blocker = mkPiece('tot', 'red', 0, 3)
    const moves = getXeMoves(piece, [piece, blocker])
    // Up: rows 1,2 (2). Right: cols 1-8 (8). Down: none. Left: none = 10
    expect(moves.some((m) => m.col === 0 && m.row === 3)).toBe(false)
    expect(moves.some((m) => m.col === 0 && m.row === 2)).toBe(true)
  })

  it('captures enemy piece', () => {
    const piece = xe(0, 0)
    const enemy = mkPiece('tot', 'black', 0, 3)
    const moves = getXeMoves(piece, [piece, enemy])
    // Up: rows 1,2,3 (capture at 3) = 3
    expect(moves.some((m) => m.col === 0 && m.row === 3)).toBe(true)
    expect(moves.some((m) => m.col === 0 && m.row === 4)).toBe(false)
  })

  it('fully blocked returns no moves', () => {
    const piece = xe(4, 5)
    const blockers: Piece[] = [
      mkPiece('tot', 'red', 3, 5),
      mkPiece('tot', 'red', 5, 5),
      mkPiece('tot', 'red', 4, 4),
      mkPiece('tot', 'red', 4, 6),
    ]
    const moves = getXeMoves(piece, [piece, ...blockers])
    expect(moves).toHaveLength(0)
  })
})
