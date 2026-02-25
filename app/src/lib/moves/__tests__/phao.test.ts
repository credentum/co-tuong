import { describe, it, expect } from 'vitest'
import { getPhaoMoves } from '../phao'
import type { Piece } from '@/types/game'

const phao = (col: number, row: number, side: 'red' | 'black' = 'red'): Piece => ({
  type: 'phao',
  side,
  position: { col, row },
})

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('getPhaoMoves', () => {
  it('slides freely on empty board (no captures)', () => {
    const piece = phao(4, 5)
    const moves = getPhaoMoves(piece, [piece])
    // Same as Xe on empty board: 4+4+5+4 = 17
    expect(moves).toHaveLength(17)
  })

  it('captures enemy behind a screen', () => {
    const piece = phao(0, 0)
    const screen = mkPiece('tot', 'red', 0, 3)
    const target = mkPiece('tot', 'black', 0, 7)
    const moves = getPhaoMoves(piece, [piece, screen, target])
    // Up: 0,1 and 0,2 (non-capture), screen at 0,3, then capture at 0,7
    expect(moves).toContainEqual({ col: 0, row: 7 })
    // Cannot land on empty squares after screen (0,4 through 0,6)
    expect(moves).not.toContainEqual({ col: 0, row: 4 })
    expect(moves).not.toContainEqual({ col: 0, row: 5 })
  })

  it('cannot capture without a screen', () => {
    const piece = phao(0, 0)
    const target = mkPiece('tot', 'black', 0, 5)
    const moves = getPhaoMoves(piece, [piece, target])
    // Target is the first piece — becomes screen, not capturable
    expect(moves).not.toContainEqual({ col: 0, row: 5 })
  })

  it('cannot capture friendly piece behind screen', () => {
    const piece = phao(0, 0)
    const screen = mkPiece('tot', 'black', 0, 3)
    const friendly = mkPiece('tot', 'red', 0, 7)
    const moves = getPhaoMoves(piece, [piece, screen, friendly])
    expect(moves).not.toContainEqual({ col: 0, row: 7 })
  })

  it('stops scanning after capture behind screen', () => {
    const piece = phao(0, 0)
    const screen = mkPiece('tot', 'red', 0, 2)
    const enemy1 = mkPiece('tot', 'black', 0, 5)
    const enemy2 = mkPiece('tot', 'black', 0, 8)
    const moves = getPhaoMoves(piece, [piece, screen, enemy1, enemy2])
    // Captures first enemy after screen, does NOT reach second
    expect(moves).toContainEqual({ col: 0, row: 5 })
    expect(moves).not.toContainEqual({ col: 0, row: 8 })
  })

  it('non-capture moves stop at screen', () => {
    const piece = phao(0, 0)
    const screen = mkPiece('tot', 'red', 0, 3)
    const moves = getPhaoMoves(piece, [piece, screen])
    // Can move to 0,1 and 0,2 but not 0,3 (screen) or beyond without target
    expect(moves).toContainEqual({ col: 0, row: 1 })
    expect(moves).toContainEqual({ col: 0, row: 2 })
    expect(moves).not.toContainEqual({ col: 0, row: 3 })
  })
})
