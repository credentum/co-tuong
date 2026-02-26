import { describe, it, expect, beforeEach } from 'vitest'
import { usePatternStore } from '../usePatternStore'
import type { MistakeCategory } from '@/types/analysis'
import type { PatternEntry } from '../usePatternStore'

const ALL_CATEGORIES: MistakeCategory[] = [
  'hung_piece',
  'missed_capture',
  'broke_pin',
  'early_horse_loss',
  'undefended_general',
  'cannon_screen_missed',
  'elephant_ignored',
  'missed_checkmate',
  'general_mistake',
]

function freshPatterns(): Record<MistakeCategory, PatternEntry> {
  const map: Partial<Record<MistakeCategory, PatternEntry>> = {}
  for (const cat of ALL_CATEGORIES) {
    map[cat] = { lastGames: [], occurrences: 0, lastOccurred: 0, timesShown: 0, resolved: false }
  }
  return map as Record<MistakeCategory, PatternEntry>
}

beforeEach(() => {
  usePatternStore.setState({ patterns: freshPatterns() })
})

describe('usePatternStore — recording games', () => {
  it('starts with empty patterns', () => {
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.lastGames).toEqual([])
    expect(patterns.hung_piece.occurrences).toBe(0)
  })

  it('records a game with mistakes', () => {
    usePatternStore.getState().recordGame(['hung_piece', 'missed_capture'])
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.lastGames).toEqual([true])
    expect(patterns.hung_piece.occurrences).toBe(1)
    expect(patterns.missed_capture.lastGames).toEqual([true])
    expect(patterns.broke_pin.lastGames).toEqual([false])
  })

  it('records a clean game', () => {
    usePatternStore.getState().recordGame([])
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.lastGames).toEqual([false])
    expect(patterns.hung_piece.occurrences).toBe(0)
  })

  it('keeps sliding window at max 10', () => {
    const store = usePatternStore.getState()
    for (let i = 0; i < 12; i++) {
      store.recordGame(['hung_piece'])
    }
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.lastGames).toHaveLength(10)
    expect(patterns.hung_piece.occurrences).toBe(12)
  })
})

describe('usePatternStore — active patterns', () => {
  it('high-severity pattern activates after 1 game', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece'])
    expect(usePatternStore.getState().getActivePatterns()).toContain('hung_piece')
  })

  it('high-severity: missed_checkmate activates after 1 game', () => {
    const store = usePatternStore.getState()
    store.recordGame(['missed_checkmate'])
    expect(usePatternStore.getState().getActivePatterns()).toContain('missed_checkmate')
  })

  it('low-severity pattern requires 2 occurrences', () => {
    const store = usePatternStore.getState()
    store.recordGame(['elephant_ignored'])
    expect(usePatternStore.getState().getActivePatterns()).not.toContain('elephant_ignored')

    store.recordGame(['elephant_ignored'])
    expect(usePatternStore.getState().getActivePatterns()).toContain('elephant_ignored')
  })

  it('low-severity pattern stays active across spaced-out games (10-game window)', () => {
    const store = usePatternStore.getState()
    store.recordGame(['cannon_screen_missed'])
    // 7 clean games in between
    for (let i = 0; i < 7; i++) store.recordGame([])
    // Still not active — only 1 occurrence
    expect(usePatternStore.getState().getActivePatterns()).not.toContain('cannon_screen_missed')

    store.recordGame(['cannon_screen_missed'])
    // Now 2 of last 9 — active
    expect(usePatternStore.getState().getActivePatterns()).toContain('cannon_screen_missed')
  })

  it('low-severity pattern falls off after sliding out of window', () => {
    const store = usePatternStore.getState()
    store.recordGame(['elephant_ignored'])
    store.recordGame(['elephant_ignored'])
    expect(usePatternStore.getState().getActivePatterns()).toContain('elephant_ignored')

    // 9 clean games push both occurrences out of the 10-game window
    for (let i = 0; i < 9; i++) store.recordGame([])
    expect(usePatternStore.getState().getActivePatterns()).not.toContain('elephant_ignored')
  })

  it('multiple patterns can be active', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece', 'missed_capture'])
    store.recordGame(['hung_piece', 'missed_capture'])
    const active = usePatternStore.getState().getActivePatterns()
    expect(active).toContain('hung_piece')
    expect(active).toContain('missed_capture')
  })
})

describe('usePatternStore — resolution', () => {
  it('resolves after 5 consecutive clean games', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece'])
    store.recordGame(['hung_piece'])
    expect(usePatternStore.getState().getActivePatterns()).toContain('hung_piece')

    // 5 clean games resolve the pattern
    for (let i = 0; i < 5; i++) store.recordGame([])
    expect(usePatternStore.getState().patterns.hung_piece.resolved).toBe(true)
  })

  it('reactivates resolved pattern on recurrence', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece'])
    store.recordGame(['hung_piece'])
    // 5 clean games to resolve
    for (let i = 0; i < 5; i++) store.recordGame([])
    expect(usePatternStore.getState().patterns.hung_piece.resolved).toBe(true)

    // Recurrence
    store.recordGame(['hung_piece'])
    expect(usePatternStore.getState().patterns.hung_piece.resolved).toBe(false)
  })
})

describe('usePatternStore — newly triggered', () => {
  it('returns active patterns that appeared in current game', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece', 'missed_capture'])
    const triggered = usePatternStore.getState().getNewlyTriggered(['hung_piece', 'missed_capture'])
    // hung_piece is high-severity (active after 1), missed_capture needs 2
    expect(triggered).toContain('hung_piece')
    expect(triggered).not.toContain('missed_capture')
  })
})

describe('usePatternStore — markShown', () => {
  it('increments timesShown', () => {
    const store = usePatternStore.getState()
    expect(store.patterns.hung_piece.timesShown).toBe(0)
    store.markShown('hung_piece')
    expect(usePatternStore.getState().patterns.hung_piece.timesShown).toBe(1)
    usePatternStore.getState().markShown('hung_piece')
    expect(usePatternStore.getState().patterns.hung_piece.timesShown).toBe(2)
  })
})

describe('usePatternStore — migration', () => {
  it('migrates old last5Games field to lastGames', () => {
    // Simulate old persisted data with last5Games
    const oldPatterns = freshPatterns()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldEntry = oldPatterns.hung_piece as any
    oldEntry.last5Games = [true, false, true]
    delete oldEntry.lastGames
    usePatternStore.setState({ patterns: oldPatterns })

    // recordGame should migrate and work
    usePatternStore.getState().recordGame([])
    const entry = usePatternStore.getState().patterns.hung_piece
    expect(entry.lastGames).toEqual([true, false, true, false])
  })
})
