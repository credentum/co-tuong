import { describe, it, expect } from 'vitest'
import { analyzeGame } from '../analysis'
import type { EvalSnapshot } from '@/types/analysis'

describe('analyzeGame', () => {
  it('returns clean game for empty snapshots', () => {
    const result = analyzeGame([])
    expect(result.isCleanGame).toBe(true)
    expect(result.mistakes).toHaveLength(0)
  })

  it('returns clean game when no significant drops', () => {
    const snapshots: EvalSnapshot[] = [
      {
        moveNumber: 1,
        fenBefore: 'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR r',
        fenAfter: 'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR r',
        evalBefore: 0,
        evalAfter: -5,
        evalDrop: 5,
        pieceType: 'phao',
        from: { col: 1, row: 2 },
        to: { col: 4, row: 2 },
      },
    ]
    const result = analyzeGame(snapshots)
    expect(result.isCleanGame).toBe(true)
  })

  it('finds mistakes when eval drops exceed threshold', () => {
    const snapshots: EvalSnapshot[] = [
      {
        moveNumber: 1,
        fenBefore: 'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR r',
        fenAfter: 'rheakaehr/9/1c5c1/p1p1p1p1p/9/4P4/P1P3P1P/1C5C1/9/RHEAKAEHR r',
        evalBefore: 0,
        evalAfter: -20,
        evalDrop: 20,
        pieceType: 'tot',
        from: { col: 4, row: 3 },
        to: { col: 4, row: 4 },
      },
    ]
    const result = analyzeGame(snapshots)
    expect(result.isCleanGame).toBe(false)
    expect(result.mistakes.length).toBeGreaterThan(0)
    expect(result.mistakes[0]!.rank).toBe(1)
    expect(result.mistakes[0]!.category).toBeDefined()
    expect(result.mistakes[0]!.description).toBeDefined()
    expect(result.mistakes[0]!.highlightSquares).toBeDefined()
  })

  it('limits to max 3 mistakes', () => {
    const base: EvalSnapshot = {
      moveNumber: 1,
      fenBefore: 'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR r',
      fenAfter: 'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR r',
      evalBefore: 0,
      evalAfter: -20,
      evalDrop: 20,
      pieceType: 'tot',
      from: { col: 0, row: 3 },
      to: { col: 0, row: 4 },
    }
    const snapshots = Array.from({ length: 5 }, (_, i) => ({
      ...base,
      moveNumber: i + 1,
      evalDrop: 20 + i * 5,
    }))
    const result = analyzeGame(snapshots)
    expect(result.mistakes.length).toBeLessThanOrEqual(3)
  })
})
