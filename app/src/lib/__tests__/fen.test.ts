import { describe, it, expect } from 'vitest'
import { boardToFen, fenToBoard } from '../fen'
import { INITIAL_POSITION } from '@/constants/initialPosition'
import type { Piece } from '@/types/game'

describe('boardToFen', () => {
  it('encodes initial position', () => {
    const fen = boardToFen(INITIAL_POSITION, 'red')
    // Row 9 (black back rank): rneckenr → rneakaenr (but our pieces use different letters)
    expect(fen).toContain(' r')
    expect(fen.split('/').length).toBe(10)
  })

  it('round-trips with fenToBoard', () => {
    const fen = boardToFen(INITIAL_POSITION, 'red')
    const { pieces, currentTurn } = fenToBoard(fen)
    expect(currentTurn).toBe('red')
    expect(pieces.length).toBe(32)

    // Verify each piece exists
    for (const orig of INITIAL_POSITION) {
      const found = pieces.find(
        (p) =>
          p.type === orig.type &&
          p.side === orig.side &&
          p.position.col === orig.position.col &&
          p.position.row === orig.position.row,
      )
      expect(found).toBeDefined()
    }
  })
})

describe('fenToBoard', () => {
  it('parses a simple position', () => {
    // Just two kings
    const fen = '4k4/9/9/9/9/9/9/9/9/4K4 r'
    const { pieces, currentTurn } = fenToBoard(fen)
    expect(currentTurn).toBe('red')
    expect(pieces.length).toBe(2)
    expect(pieces.find((p) => p.side === 'red' && p.type === 'tuong')).toBeDefined()
    expect(pieces.find((p) => p.side === 'black' && p.type === 'tuong')).toBeDefined()
  })

  it('parses black turn', () => {
    const fen = '4k4/9/9/9/9/9/9/9/9/4K4 b'
    const { currentTurn } = fenToBoard(fen)
    expect(currentTurn).toBe('black')
  })

  it('round-trips a custom position', () => {
    const pieces: Piece[] = [
      { type: 'tuong', side: 'red', position: { col: 4, row: 0 } },
      { type: 'tuong', side: 'black', position: { col: 3, row: 9 } },
      { type: 'xe', side: 'red', position: { col: 0, row: 5 } },
    ]
    const fen = boardToFen(pieces, 'black')
    const result = fenToBoard(fen)
    expect(result.currentTurn).toBe('black')
    expect(result.pieces.length).toBe(3)
  })
})
