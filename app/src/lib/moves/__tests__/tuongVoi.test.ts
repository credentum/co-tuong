import { describe, it, expect } from 'vitest'
import { getTuongVoiMoves } from '../tuongVoi'
import type { Piece } from '@/types/game'

const tuongVoi = (col: number, row: number, side: 'red' | 'black' = 'red'): Piece => ({
  type: 'tuongVoi',
  side,
  position: { col, row },
})

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getTuongVoiMoves', () => {
  it('has 4 moves from center of own half', () => {
    const piece = tuongVoi(4, 2)
    const moves = getTuongVoiMoves(piece, [piece])
    expect(moves).toHaveLength(4)
    expect(moves).toContainEqual({ col: 2, row: 0 })
    expect(moves).toContainEqual({ col: 6, row: 0 })
    expect(moves).toContainEqual({ col: 2, row: 4 })
    expect(moves).toContainEqual({ col: 6, row: 4 })
  })

  it('cannot cross river (red)', () => {
    const piece = tuongVoi(4, 4) // Red at row 4, edge of own half
    const moves = getTuongVoiMoves(piece, [piece])
    // Row 4+2=6 crosses river for red (>= 5)
    // Only row 4-2=2 is valid vertically
    expect(moves.every((m) => m.row < 5)).toBe(true)
  })

  it('cannot cross river (black)', () => {
    const piece = tuongVoi(4, 5, 'black') // Black at row 5, edge of own half
    const moves = getTuongVoiMoves(piece, [piece])
    // Row 5-2=3 crosses river for black (< 5)
    expect(moves.every((m) => m.row >= 5)).toBe(true)
  })

  it('eye block prevents move', () => {
    const piece = tuongVoi(4, 2)
    // Block eye at (5,3) — prevents move to (6,4)
    const blocker = mkPiece('tot', 'red', 5, 3)
    const moves = getTuongVoiMoves(piece, [piece, blocker])
    expect(moves).not.toContainEqual({ col: 6, row: 4 })
    expect(moves).toHaveLength(3)
  })

  it('captures enemy piece', () => {
    const piece = tuongVoi(4, 2)
    const enemy = mkPiece('tot', 'black', 6, 4)
    const moves = getTuongVoiMoves(piece, [piece, enemy])
    expect(moves).toContainEqual({ col: 6, row: 4 })
  })

  it('blocked by friendly at destination', () => {
    const piece = tuongVoi(4, 2)
    const friendly = mkPiece('tot', 'red', 6, 4)
    const moves = getTuongVoiMoves(piece, [piece, friendly])
    expect(moves).not.toContainEqual({ col: 6, row: 4 })
  })

  it('corner position has limited moves', () => {
    const piece = tuongVoi(0, 0)
    const moves = getTuongVoiMoves(piece, [piece])
    // Only (2,2) is on board and own half
    expect(moves).toHaveLength(1)
    expect(moves).toContainEqual({ col: 2, row: 2 })
  })

  it('black elephant in center of own half', () => {
    const piece = tuongVoi(4, 7, 'black')
    const moves = getTuongVoiMoves(piece, [piece])
    expect(moves).toHaveLength(4)
    expect(moves).toContainEqual({ col: 2, row: 5 })
    expect(moves).toContainEqual({ col: 6, row: 5 })
    expect(moves).toContainEqual({ col: 2, row: 9 })
    expect(moves).toContainEqual({ col: 6, row: 9 })
  })
})
