import { describe, it, expect } from 'vitest'
import {
  flyingGenerals,
  isInCheck,
  getFullyLegalMoves,
  getGameResult,
  hasLegalMoves,
} from '../legality'
import type { Piece } from '@/types/game'

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('flyingGenerals', () => {
  it('detects flying generals on same column with nothing between', () => {
    const pieces: Piece[] = [mkPiece('tuong', 'red', 4, 0), mkPiece('tuong', 'black', 4, 9)]
    expect(flyingGenerals(pieces)).toBe(true)
  })

  it('no flying generals when piece is between them', () => {
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 4, 9),
      mkPiece('tot', 'red', 4, 3),
    ]
    expect(flyingGenerals(pieces)).toBe(false)
  })

  it('no flying generals when on different columns', () => {
    const pieces: Piece[] = [mkPiece('tuong', 'red', 3, 0), mkPiece('tuong', 'black', 4, 9)]
    expect(flyingGenerals(pieces)).toBe(false)
  })
})

describe('isInCheck', () => {
  it('detects check by enemy Xe', () => {
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 4, 9),
      mkPiece('xe', 'black', 0, 0), // Black Xe attacks red king on row 0
    ]
    expect(isInCheck(pieces, 'red')).toBe(true)
  })

  it('no check when king is safe', () => {
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('xe', 'black', 0, 5),
    ]
    expect(isInCheck(pieces, 'red')).toBe(false)
  })

  it('detects check by Pháo with screen', () => {
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('phao', 'black', 4, 9),
      mkPiece('tot', 'red', 4, 3), // Screen between phao and king
    ]
    expect(isInCheck(pieces, 'red')).toBe(true)
  })
})

describe('getFullyLegalMoves', () => {
  it('filters moves that would leave king in check', () => {
    // Red king at 4,0, Black Xe at 4,9, Red Si at 4,1 blocks
    // If Si moves away from col 4, king is exposed to Xe
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('si', 'red', 4, 1),
      mkPiece('xe', 'black', 4, 9),
    ]
    const si = pieces[2]!
    const moves = getFullyLegalMoves(si, pieces)
    // Si at 4,1 can go to 3,0 or 5,0 or 3,2 or 5,2 (pseudo-legal)
    // But all moves expose the king to Xe on col 4
    expect(moves).toHaveLength(0)
  })

  it('filters moves that create flying generals', () => {
    // Red king at 4,0, Black king at 4,9, Red Tot at 4,3 blocks
    // If Tot moves sideways, kings face each other
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 4, 9),
      mkPiece('tot', 'red', 4, 3),
    ]
    const tot = pieces[2]!
    const moves = getFullyLegalMoves(tot, pieces)
    // Tot at 4,3 can go forward (4,4) or stay on col 4 — but sideways (3,3 or 5,3) would create flying generals
    // Forward (4,4) keeps tot on col 4, still blocking → legal
    expect(moves).toContainEqual({ col: 4, row: 4 })
    // Sideways would expose kings
    expect(moves).not.toContainEqual({ col: 3, row: 3 })
    expect(moves).not.toContainEqual({ col: 5, row: 3 })
  })

  it('allows king to move out of check', () => {
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 4, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('xe', 'black', 4, 9), // Checking red king on col 4
    ]
    const king = pieces[0]!
    const moves = getFullyLegalMoves(king, pieces)
    // King must move off col 4 to escape check
    expect(moves.every((m) => m.col !== 4)).toBe(true)
    expect(moves.length).toBeGreaterThan(0)
  })
})

describe('hasLegalMoves', () => {
  it('returns true when moves available', () => {
    const pieces: Piece[] = [mkPiece('tuong', 'red', 4, 0), mkPiece('tuong', 'black', 3, 9)]
    expect(hasLegalMoves(pieces, 'red')).toBe(true)
  })

  it('returns false when checkmated', () => {
    // Red king trapped in corner, checked with no escape
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 3, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('xe', 'black', 3, 5), // Controls col 3
      mkPiece('xe', 'black', 0, 1), // Controls row 1
      mkPiece('xe', 'black', 8, 0), // Controls row 0
    ]
    expect(hasLegalMoves(pieces, 'red')).toBe(false)
  })
})

describe('getGameResult', () => {
  it('returns ongoing when moves available', () => {
    const pieces: Piece[] = [mkPiece('tuong', 'red', 4, 0), mkPiece('tuong', 'black', 3, 9)]
    expect(getGameResult(pieces, 'red')).toBe('ongoing')
  })

  it('returns black_wins when red has no legal moves', () => {
    const pieces: Piece[] = [
      mkPiece('tuong', 'red', 3, 0),
      mkPiece('tuong', 'black', 3, 9),
      mkPiece('xe', 'black', 3, 5),
      mkPiece('xe', 'black', 0, 1),
      mkPiece('xe', 'black', 8, 0),
    ]
    expect(getGameResult(pieces, 'red')).toBe('black_wins')
  })
})
