import { describe, it, expect } from 'vitest'
import { posEq, isOnBoard, pieceAt, isInPalace, hasCrossedRiver } from '../helpers'
import type { Piece } from '@/types/game'

describe('posEq', () => {
  it('returns true for equal positions', () => {
    expect(posEq({ col: 3, row: 5 }, { col: 3, row: 5 })).toBe(true)
  })

  it('returns false for different positions', () => {
    expect(posEq({ col: 3, row: 5 }, { col: 4, row: 5 })).toBe(false)
    expect(posEq({ col: 3, row: 5 }, { col: 3, row: 6 })).toBe(false)
  })
})

describe('isOnBoard', () => {
  it('returns true for valid positions', () => {
    expect(isOnBoard(0, 0)).toBe(true)
    expect(isOnBoard(8, 9)).toBe(true)
    expect(isOnBoard(4, 5)).toBe(true)
  })

  it('returns false for out-of-bounds', () => {
    expect(isOnBoard(-1, 0)).toBe(false)
    expect(isOnBoard(9, 0)).toBe(false)
    expect(isOnBoard(0, -1)).toBe(false)
    expect(isOnBoard(0, 10)).toBe(false)
  })
})

describe('pieceAt', () => {
  const pieces: Piece[] = [
    { type: 'xe', side: 'red', position: { col: 0, row: 0 } },
    { type: 'tuong', side: 'black', position: { col: 4, row: 9 } },
  ]

  it('finds a piece at a position', () => {
    expect(pieceAt(pieces, 0, 0)).toBe(pieces[0])
  })

  it('returns undefined when empty', () => {
    expect(pieceAt(pieces, 1, 1)).toBeUndefined()
  })
})

describe('isInPalace', () => {
  it('returns true for red palace positions', () => {
    expect(isInPalace(3, 0, 'red')).toBe(true)
    expect(isInPalace(4, 1, 'red')).toBe(true)
    expect(isInPalace(5, 2, 'red')).toBe(true)
  })

  it('returns false for red outside palace', () => {
    expect(isInPalace(2, 0, 'red')).toBe(false)
    expect(isInPalace(4, 3, 'red')).toBe(false)
  })

  it('returns true for black palace positions', () => {
    expect(isInPalace(3, 7, 'black')).toBe(true)
    expect(isInPalace(4, 8, 'black')).toBe(true)
    expect(isInPalace(5, 9, 'black')).toBe(true)
  })

  it('returns false for black outside palace', () => {
    expect(isInPalace(4, 6, 'black')).toBe(false)
  })
})

describe('hasCrossedRiver', () => {
  it('red has not crossed at row 4', () => {
    expect(hasCrossedRiver(4, 'red')).toBe(false)
  })

  it('red has crossed at row 5', () => {
    expect(hasCrossedRiver(5, 'red')).toBe(true)
  })

  it('black has not crossed at row 5', () => {
    expect(hasCrossedRiver(5, 'black')).toBe(false)
  })

  it('black has crossed at row 4', () => {
    expect(hasCrossedRiver(4, 'black')).toBe(true)
  })
})
