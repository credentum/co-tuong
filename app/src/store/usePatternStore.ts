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

export interface PatternEntry {
  last5Games: boolean[] // sliding window, most recent last
  occurrences: number // lifetime total
  lastOccurred: number // timestamp
  timesShown: number // times pattern alert was surfaced
  resolved: boolean // true after 5 clean games
}

function defaultPatternMap(): Record<MistakeCategory, PatternEntry> {
  const map: Partial<Record<MistakeCategory, PatternEntry>> = {}
  for (const cat of ALL_CATEGORIES) {
    map[cat] = { last5Games: [], occurrences: 0, lastOccurred: 0, timesShown: 0, resolved: false }
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
            const entry = { ...updated[cat] }
            const appeared = categories.includes(cat)

            // Push to sliding window, keep max 5
            entry.last5Games = [...entry.last5Games, appeared].slice(-5)

            if (appeared) {
              entry.occurrences++
              entry.lastOccurred = Date.now()
              // Reactivate if was resolved
              if (entry.resolved) entry.resolved = false
            }

            // Check resolution: 5 entries and all false
            if (
              entry.last5Games.length >= 5 &&
              entry.last5Games.every((g) => !g) &&
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
          const entry = patterns[cat]
          if (entry.resolved) return false
          const trueCount = entry.last5Games.filter(Boolean).length
          return trueCount >= 2
        })
      },

      getNewlyTriggered: (categories) => {
        const active = get().getActivePatterns()
        return active.filter((cat) => categories.includes(cat))
      },

      getNewlyResolved: () => {
        const { patterns } = get()
        return ALL_CATEGORIES.filter((cat) => {
          const entry = patterns[cat]
          // Resolved with the most recent game being clean (just crossed the threshold)
          return (
            entry.resolved && entry.last5Games.length >= 5 && entry.timesShown > 0 // Only congratulate if we previously showed an alert
          )
        })
      },
    }),
    {
      name: 'co_tuong_patterns',
      partialize: (state) => ({ patterns: state.patterns }),
    },
  ),
)
