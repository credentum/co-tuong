import { describe, it, expect } from 'vitest'
import { getLegalMoves } from '../index'
import type { Piece } from '@/types/game'

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getLegalMoves', () => {
  it('dispatches xe moves', () => {
    const piece = mkPiece('xe', 'red', 0, 0)
    const moves = getLegalMoves(piece, [piece])
    expect(moves.length).toBeGreaterThan(0)
  })

  it('dispatches tuong moves', () => {
    const piece = mkPiece('tuong', 'red', 4, 1)
    const moves = getLegalMoves(piece, [piece])
    expect(moves).toHaveLength(4)
  })

  it('dispatches si moves', () => {
    const piece = mkPiece('si', 'red', 4, 1)
    const moves = getLegalMoves(piece, [piece])
    expect(moves).toHaveLength(4)
  })

  it('dispatches tot moves', () => {
    const piece = mkPiece('tot', 'red', 4, 3)
    const moves = getLegalMoves(piece, [piece])
    expect(moves).toHaveLength(1)
  })

  it('returns empty for unimplemented phao', () => {
    const piece = mkPiece('phao', 'red', 1, 2)
    expect(getLegalMoves(piece, [piece])).toEqual([])
  })

  it('returns empty for unimplemented ma', () => {
    const piece = mkPiece('ma', 'red', 1, 0)
    expect(getLegalMoves(piece, [piece])).toEqual([])
  })

  it('returns empty for unimplemented tuongVoi', () => {
    const piece = mkPiece('tuongVoi', 'red', 2, 0)
    expect(getLegalMoves(piece, [piece])).toEqual([])
  })
})
