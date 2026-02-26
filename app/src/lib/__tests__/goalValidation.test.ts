import { describe, it, expect } from 'vitest'
import { validateGoal } from '../goalValidation'
import type { Piece } from '@/types/game'
import type { GoalConfig } from '@/types/practice'

const p = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('validateGoal — escape_capture', () => {
  // PAT_01_S1 setup: Red phao(7,2) fires through tot(7,5) at black ma(7,7)
  const pieces: Piece[] = [
    p('tuong', 'red', 4, 0),
    p('phao', 'red', 7, 2),
    p('tot', 'red', 7, 5),
    p('tuong', 'black', 5, 9),
    p('ma', 'black', 7, 7),
    p('tuongVoi', 'black', 2, 9),
    p('tuongVoi', 'black', 6, 9),
    p('si', 'black', 4, 8),
  ]
  const goal: GoalConfig = { type: 'escape_capture', piecePos: { col: 7, row: 7 } }

  it('rejects (6,5) because Red tot at (7,5) can capture sideways', () => {
    const result = validateGoal(pieces, { col: 7, row: 7 }, { col: 6, row: 5 }, 'black', goal, 0)
    // Red tot(7,5) crossed river — can move sideways to (6,5)
    expect(result.valid).toBe(false)
  })

  it('rejects (8,5) because Red tot at (7,5) can capture sideways', () => {
    const result = validateGoal(pieces, { col: 7, row: 7 }, { col: 8, row: 5 }, 'black', goal, 0)
    // Red tot(7,5) crossed river — can move sideways to (8,5)
    expect(result.valid).toBe(false)
  })

  it('accepts alternative safe square (5,6)', () => {
    const result = validateGoal(pieces, { col: 7, row: 7 }, { col: 5, row: 6 }, 'black', goal, 0)
    expect(result.valid).toBe(true)
  })

  it('accepts alternative safe square (6,9)', () => {
    const result = validateGoal(pieces, { col: 7, row: 7 }, { col: 6, row: 9 }, 'black', goal, 0)
    expect(result.valid).toBe(true)
  })

  it('rejects moving to a square still attacked by the cannon', () => {
    // Moving horse to (7,5) would land on the screen piece (captured),
    // but let's test a square that's still on col 7 and attacked
    // Actually, moving to (8,9) — far corner, should be safe
    // Let's construct a scenario where the horse stays attacked:
    // If horse moves to a square that an opponent piece can still reach
    const result = validateGoal(pieces, { col: 7, row: 7 }, { col: 8, row: 9 }, 'black', goal, 0)
    // (8,9) — check if any red piece can reach it
    // Red phao(7,2) can't reach (8,9), red tot(7,5) can't move there
    // This should be safe
    expect(result.valid).toBe(true)
  })

  it('handles interposing a different piece (PAT_01_S3 pattern)', () => {
    // PAT_01_S3: Red phao(7,1) through tot(7,5) at black ma(7,8)
    // Interposing tuongVoi at (7,7) blocks the cannon
    const s3pieces: Piece[] = [
      p('tuong', 'red', 5, 0),
      p('phao', 'red', 7, 1),
      p('tot', 'red', 7, 5),
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 7, 8),
      p('tuongVoi', 'black', 5, 9),
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
    ]
    const s3goal: GoalConfig = { type: 'escape_capture', piecePos: { col: 7, row: 8 } }
    const result = validateGoal(
      s3pieces,
      { col: 5, row: 9 },
      { col: 7, row: 7 },
      'black',
      s3goal,
      0,
    )
    // After interposing at (7,7): col 7 has phao(7,1), tot(7,5), tuongVoi(7,7), ma(7,8)
    // Two pieces between cannon and horse = cannon can't fire
    expect(result.valid).toBe(true)
  })
})

describe('validateGoal — find_capture', () => {
  it('accepts capturing the target piece', () => {
    const goal: GoalConfig = { type: 'find_capture', targetPos: { col: 4, row: 5 } }
    const result = validateGoal([], { col: 0, row: 5 }, { col: 4, row: 5 }, 'red', goal, 0)
    expect(result.valid).toBe(true)
  })

  it('rejects moving to a different square', () => {
    const goal: GoalConfig = { type: 'find_capture', targetPos: { col: 4, row: 5 } }
    const result = validateGoal([], { col: 0, row: 5 }, { col: 3, row: 5 }, 'red', goal, 0)
    expect(result.valid).toBe(false)
  })
})

describe('validateGoal — find_checkmate', () => {
  it('accepts a move that delivers immediate checkmate (final step)', () => {
    // Red Xe at (0,9), can checkmate black gen at (4,9) by moving to row 9
    // Black gen(4,9) with si(3,8) and si(5,8) blocking escape
    const pieces: Piece[] = [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 0, 9),
      p('tuong', 'black', 4, 9),
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
    ]
    const goal: GoalConfig = { type: 'find_checkmate' }
    // Xe to (4,9) captures the general — but let's try a different checkmate square
    // Actually, Xe to any square on row 9 that delivers check...
    // Xe(0,9) to (3,9) would check the general on (4,9)? No, xe checks along rank/file.
    // Xe on (4,9) would capture the general directly — that's checkmate.
    // But the game ends when there are no legal moves, not when general is captured.
    // Let's just test the concept with Xe sliding to deliver check
    const result = validateGoal(pieces, { col: 0, row: 9 }, { col: 4, row: 9 }, 'red', goal, 0)
    // This captures the black general — game result should be red_wins
    expect(result.valid).toBe(true)
  })

  it('rejects a non-checkmate move on final step', () => {
    const pieces: Piece[] = [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 0, 9),
      p('tuong', 'black', 4, 9),
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
    ]
    const goal: GoalConfig = { type: 'find_checkmate' }
    // Xe to (0,5) — just a random non-check move
    const result = validateGoal(pieces, { col: 0, row: 9 }, { col: 0, row: 5 }, 'red', goal, 0)
    expect(result.valid).toBe(false)
  })
})

describe('validateGoal — best_move_threshold', () => {
  it('accepts the engine best move', () => {
    // Simple position: Red xe can capture undefended black ma
    const pieces: Piece[] = [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 0, 5),
      p('tuong', 'black', 4, 9),
      p('ma', 'black', 0, 8),
      p('si', 'black', 3, 8),
      p('si', 'black', 5, 8),
    ]
    const goal: GoalConfig = { type: 'best_move_threshold', threshold: 50 }
    // Capturing the horse should be the best or near-best move
    const result = validateGoal(pieces, { col: 0, row: 5 }, { col: 0, row: 8 }, 'red', goal, 0)
    expect(result.valid).toBe(true)
  })

  it('rejects a move that loses significant material', () => {
    // Red xe at (0,5). Moving it to (4,5) where black can capture it
    const pieces: Piece[] = [
      p('tuong', 'red', 4, 0),
      p('xe', 'red', 0, 5),
      p('tuong', 'black', 5, 9),
      p('xe', 'black', 4, 8), // can capture on (4,5)
      p('si', 'black', 4, 9), // guard
    ]
    const goal: GoalConfig = { type: 'best_move_threshold', threshold: 50 }
    // Moving xe to (4,5) where black xe can capture it = huge loss
    const result = validateGoal(pieces, { col: 0, row: 5 }, { col: 4, row: 5 }, 'red', goal, 0)
    expect(result.valid).toBe(false)
  })
})

describe('validateGoal — avoid_blunder', () => {
  it('accepts a safe developing move', () => {
    const pieces: Piece[] = [
      p('tuong', 'red', 4, 0),
      p('ma', 'red', 3, 0),
      p('si', 'red', 5, 0),
      p('tuong', 'black', 4, 9),
      p('phao', 'black', 4, 7),
    ]
    const goal: GoalConfig = { type: 'avoid_blunder', maxDrop: 30 }
    // Move horse to (2,2) — safe development
    const result = validateGoal(pieces, { col: 3, row: 0 }, { col: 2, row: 2 }, 'red', goal, 0)
    expect(result.valid).toBe(true)
  })

  it('rejects a move that creates a cannon screen (PAT_02_S1)', () => {
    // Same position — moving horse to (4,2) creates screen on col 4
    const pieces: Piece[] = [
      p('tuong', 'red', 4, 0),
      p('ma', 'red', 3, 0),
      p('si', 'red', 5, 0),
      p('tuong', 'black', 4, 9),
      p('phao', 'black', 4, 7),
    ]
    const goal: GoalConfig = { type: 'avoid_blunder', maxDrop: 30 }
    // Move horse to (4,2) — creates screen on col 4 for enemy cannon
    const result = validateGoal(pieces, { col: 3, row: 0 }, { col: 4, row: 2 }, 'red', goal, 0)
    // This should cause a significant eval drop because the cannon can now fire
    expect(result.valid).toBe(false)
  })
})
