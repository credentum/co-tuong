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
    map[cat] = { last5Games: [], occurrences: 0, lastOccurred: 0, timesShown: 0, resolved: false }
  }
  return map as Record<MistakeCategory, PatternEntry>
}

beforeEach(() => {
  usePatternStore.setState({ patterns: freshPatterns() })
})

describe('usePatternStore — recording games', () => {
  it('starts with empty patterns', () => {
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.last5Games).toEqual([])
    expect(patterns.hung_piece.occurrences).toBe(0)
  })

  it('records a game with mistakes', () => {
    usePatternStore.getState().recordGame(['hung_piece', 'missed_capture'])
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.last5Games).toEqual([true])
    expect(patterns.hung_piece.occurrences).toBe(1)
    expect(patterns.missed_capture.last5Games).toEqual([true])
    expect(patterns.broke_pin.last5Games).toEqual([false])
  })

  it('records a clean game', () => {
    usePatternStore.getState().recordGame([])
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.last5Games).toEqual([false])
    expect(patterns.hung_piece.occurrences).toBe(0)
  })

  it('keeps sliding window at max 5', () => {
    const store = usePatternStore.getState()
    for (let i = 0; i < 7; i++) {
      store.recordGame(['hung_piece'])
    }
    const { patterns } = usePatternStore.getState()
    expect(patterns.hung_piece.last5Games).toHaveLength(5)
    expect(patterns.hung_piece.occurrences).toBe(7)
  })
})

describe('usePatternStore — active patterns', () => {
  it('pattern becomes active after 2 of last 5 games', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece'])
    expect(store.getActivePatterns()).toEqual([])

    store.recordGame(['hung_piece'])
    expect(usePatternStore.getState().getActivePatterns()).toEqual(['hung_piece'])
  })

  it('pattern not active if only 1 of last 5', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece'])
    store.recordGame([])
    store.recordGame([])
    expect(usePatternStore.getState().getActivePatterns()).toEqual([])
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
  it('resolves after 5 clean games', () => {
    const store = usePatternStore.getState()
    // Create a pattern
    store.recordGame(['hung_piece'])
    store.recordGame(['hung_piece'])
    expect(usePatternStore.getState().getActivePatterns()).toContain('hung_piece')

    // 5 clean games (first 2 were already recorded, need 3 more to fill window then 5 clean)
    store.recordGame([])
    store.recordGame([])
    store.recordGame([])
    // Window is now [true, true, false, false, false] — still 2 true, still active
    expect(usePatternStore.getState().getActivePatterns()).toContain('hung_piece')

    store.recordGame([])
    // Window: [true, false, false, false, false] — only 1 true, no longer active
    expect(usePatternStore.getState().getActivePatterns()).not.toContain('hung_piece')

    store.recordGame([])
    // Window: [false, false, false, false, false] — resolved
    expect(usePatternStore.getState().patterns.hung_piece.resolved).toBe(true)
  })

  it('reactivates resolved pattern on recurrence', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece'])
    store.recordGame(['hung_piece'])
    // Fill window with clean games to resolve
    store.recordGame([])
    store.recordGame([])
    store.recordGame([])
    store.recordGame([])
    store.recordGame([])
    expect(usePatternStore.getState().patterns.hung_piece.resolved).toBe(true)

    // Recurrence
    store.recordGame(['hung_piece'])
    expect(usePatternStore.getState().patterns.hung_piece.resolved).toBe(false)
  })
})

describe('usePatternStore — newly triggered', () => {
  it('returns active patterns that appeared in current game', () => {
    const store = usePatternStore.getState()
    store.recordGame(['hung_piece'])
    store.recordGame(['hung_piece', 'missed_capture'])
    const triggered = usePatternStore.getState().getNewlyTriggered(['hung_piece', 'missed_capture'])
    // hung_piece is active (2/2), missed_capture only 1/2
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
