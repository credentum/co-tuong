import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MistakeCategory } from '@/types/analysis'

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

const WINDOW_SIZE = 10

// High-severity mistakes activate after a single occurrence
const HIGH_SEVERITY: MistakeCategory[] = [
  'hung_piece',
  'missed_checkmate',
  'undefended_general',
  'early_horse_loss',
]

export interface PatternEntry {
  lastGames: boolean[] // sliding window (up to WINDOW_SIZE), most recent last
  /** @deprecated Use lastGames instead. Kept for migration from older localStorage data. */
  last5Games?: boolean[]
  occurrences: number // lifetime total
  lastOccurred: number // timestamp
  timesShown: number // times pattern alert was surfaced
  resolved: boolean // true after 5 clean games
}

function migrateEntry(entry: PatternEntry): PatternEntry {
  // Migrate old last5Games field to lastGames
  if (!entry.lastGames && entry.last5Games) {
    return { ...entry, lastGames: entry.last5Games, last5Games: undefined }
  }
  if (!entry.lastGames) {
    return { ...entry, lastGames: [] }
  }
  return entry
}

function defaultPatternMap(): Record<MistakeCategory, PatternEntry> {
  const map: Partial<Record<MistakeCategory, PatternEntry>> = {}
  for (const cat of ALL_CATEGORIES) {
    map[cat] = { lastGames: [], occurrences: 0, lastOccurred: 0, timesShown: 0, resolved: false }
  }
  return map as Record<MistakeCategory, PatternEntry>
}

interface PatternStore {
  patterns: Record<MistakeCategory, PatternEntry>

  recordGame: (categories: MistakeCategory[]) => void
  markShown: (category: MistakeCategory) => void
  getActivePatterns: () => MistakeCategory[]
  getNewlyTriggered: (categories: MistakeCategory[]) => MistakeCategory[]
  getNewlyResolved: () => MistakeCategory[]
}

export const usePatternStore = create<PatternStore>()(
  persist(
    (set, get) => ({
      patterns: defaultPatternMap(),

      recordGame: (categories) => {
        set((state) => {
          const updated = { ...state.patterns }
          for (const cat of ALL_CATEGORIES) {
            const entry = migrateEntry({ ...updated[cat] })
            const appeared = categories.includes(cat)

            // Push to sliding window, keep max WINDOW_SIZE
            entry.lastGames = [...entry.lastGames, appeared].slice(-WINDOW_SIZE)

            if (appeared) {
              entry.occurrences++
              entry.lastOccurred = Date.now()
              // Reactivate if was resolved
              if (entry.resolved) entry.resolved = false
            }

            // Check resolution: 5 consecutive clean games at the tail
            if (
              entry.lastGames.length >= 5 &&
              entry.lastGames.slice(-5).every((g) => !g) &&
              entry.occurrences > 0
            ) {
              entry.resolved = true
            }

            updated[cat] = entry
          }
          return { patterns: updated }
        })
      },

      markShown: (category) => {
        set((state) => ({
          patterns: {
            ...state.patterns,
            [category]: {
              ...state.patterns[category],
              timesShown: state.patterns[category].timesShown + 1,
            },
          },
        }))
      },

      getActivePatterns: () => {
        const { patterns } = get()
        return ALL_CATEGORIES.filter((cat) => {
          const entry = migrateEntry(patterns[cat])
          if (entry.resolved) return false
          const trueCount = entry.lastGames.filter(Boolean).length
          const threshold = HIGH_SEVERITY.includes(cat) ? 1 : 2
          return trueCount >= threshold
        })
      },

      getNewlyTriggered: (categories) => {
        const active = get().getActivePatterns()
        return active.filter((cat) => categories.includes(cat))
      },

      getNewlyResolved: () => {
        const { patterns } = get()
        return ALL_CATEGORIES.filter((cat) => {
          const entry = migrateEntry(patterns[cat])
          // Resolved with the most recent game being clean (just crossed the threshold)
          return (
            entry.resolved && entry.lastGames.length >= 5 && entry.timesShown > 0 // Only congratulate if we previously showed an alert
          )
        })
      },
    }),
    {
      name: 'co_tuong_patterns',
      partialize: (state) => ({ patterns: state.patterns }),
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as Partial<PatternStore>) }
        // Migrate any old last5Games entries
        const migrated = { ...state.patterns }
        for (const cat of ALL_CATEGORIES) {
          if (migrated[cat]) {
            migrated[cat] = migrateEntry(migrated[cat])
          }
        }
        return { ...state, patterns: migrated }
      },
    },
  ),
)
