import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PieceType } from '@/types/game'
import type { MistakeCategory } from '@/types/analysis'

export type DotMode = 'always' | 'adaptive' | 'on_request' | 'off'
export type NudgeMode = 'on' | 'subtle' | 'off'

export interface PieceMastery {
  consecutiveClean: number
  graduated: boolean
  recoveryGamesLeft: number
}

const GRADUATION_THRESHOLD = 10
const RECOVERY_GAMES = 3
const NUDGE_AVOIDANCE_THRESHOLD = 3

const ALL_PIECE_TYPES: PieceType[] = ['tuong', 'si', 'tuongVoi', 'xe', 'phao', 'ma', 'tot']

function defaultMastery(): PieceMastery {
  return { consecutiveClean: 0, graduated: false, recoveryGamesLeft: 0 }
}

function defaultMasteryMap(): Record<PieceType, PieceMastery> {
  return Object.fromEntries(ALL_PIECE_TYPES.map((t) => [t, defaultMastery()])) as Record<
    PieceType,
    PieceMastery
  >
}

interface PlayerStore {
  dotMode: DotMode
  mastery: Record<PieceType, PieceMastery>
  showDotsOverride: boolean

  // Nudge system
  nudgeMode: NudgeMode
  activeNudge: MistakeCategory | null // currently displayed nudge
  nudgesShownThisGame: MistakeCategory[]
  nudgeAvoidCount: Partial<Record<MistakeCategory, number>>

  // Label fade
  totalGamesPlayed: number
  labelSuggestionDismissed: 'none' | 'vietnamese' | 'characters_only'

  setDotMode: (mode: DotMode) => void
  recordLegalMove: (pieceType: PieceType) => void
  recordIllegalAttempt: (pieceType: PieceType) => void
  onGameEnd: () => void
  setShowDotsOverride: (show: boolean) => void

  // Nudge actions
  setNudgeMode: (mode: NudgeMode) => void
  showNudge: (category: MistakeCategory) => void
  clearNudge: () => void
  resetNudgesForGame: () => void
  recordNudgeAvoided: (category: MistakeCategory) => void

  // Label fade actions
  setLabelSuggestionDismissed: (level: 'vietnamese' | 'characters_only') => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      dotMode: 'adaptive',
      mastery: defaultMasteryMap(),
      showDotsOverride: false,

      // Nudge defaults
      nudgeMode: 'on',
      activeNudge: null,
      nudgesShownThisGame: [],
      nudgeAvoidCount: {},

      // Label fade defaults
      totalGamesPlayed: 0,
      labelSuggestionDismissed: 'none',

      setDotMode: (mode) => set({ dotMode: mode }),

      recordLegalMove: (pieceType) => {
        const { mastery } = get()
        const m = mastery[pieceType]
        if (!m) return
        const next = m.consecutiveClean + 1
        const shouldGraduate = next >= GRADUATION_THRESHOLD && !m.graduated
        set({
          mastery: {
            ...mastery,
            [pieceType]: {
              ...m,
              consecutiveClean: next,
              graduated: m.graduated || shouldGraduate,
            },
          },
        })
      },

      recordIllegalAttempt: (pieceType) => {
        const { mastery } = get()
        const m = mastery[pieceType]
        if (!m) return
        set({
          mastery: {
            ...mastery,
            [pieceType]: {
              consecutiveClean: 0,
              graduated: false,
              recoveryGamesLeft: m.graduated ? RECOVERY_GAMES : m.recoveryGamesLeft,
            },
          },
        })
      },

      onGameEnd: () => {
        const { mastery } = get()
        const updated = { ...mastery }
        let changed = false
        for (const type of ALL_PIECE_TYPES) {
          const m = updated[type]!
          if (m.recoveryGamesLeft > 0) {
            const left = m.recoveryGamesLeft - 1
            updated[type] = {
              ...m,
              recoveryGamesLeft: left,
              graduated: left === 0 && m.consecutiveClean >= GRADUATION_THRESHOLD,
            }
            changed = true
          }
        }
        const updates: Partial<PlayerStore> = {
          totalGamesPlayed: get().totalGamesPlayed + 1,
        }
        if (changed) updates.mastery = updated
        set(updates)
      },

      setShowDotsOverride: (show) => set({ showDotsOverride: show }),

      // Nudge actions
      setNudgeMode: (mode) => set({ nudgeMode: mode }),

      showNudge: (category) => {
        set((state) => ({
          activeNudge: category,
          nudgesShownThisGame: [...state.nudgesShownThisGame, category],
        }))
      },

      clearNudge: () => set({ activeNudge: null }),

      resetNudgesForGame: () => set({ nudgesShownThisGame: [], activeNudge: null }),

      recordNudgeAvoided: (category) => {
        const { nudgeAvoidCount } = get()
        const count = (nudgeAvoidCount[category] ?? 0) + 1
        const updates: Partial<PlayerStore> = {
          nudgeAvoidCount: { ...nudgeAvoidCount, [category]: count },
        }
        // Auto-downgrade to subtle after threshold
        if (count >= NUDGE_AVOIDANCE_THRESHOLD && get().nudgeMode === 'on') {
          updates.nudgeMode = 'subtle'
        }
        set(updates)
      },

      // Label fade actions
      setLabelSuggestionDismissed: (level) => set({ labelSuggestionDismissed: level }),
    }),
    {
      name: 'co_tuong_player',
      partialize: (state) => ({
        dotMode: state.dotMode,
        mastery: state.mastery,
        nudgeMode: state.nudgeMode,
        nudgeAvoidCount: state.nudgeAvoidCount,
        totalGamesPlayed: state.totalGamesPlayed,
        labelSuggestionDismissed: state.labelSuggestionDismissed,
      }),
    },
  ),
)

/** Compute café readiness percentage (0-100) from multiple store states */
export function computeCafeReadiness(
  mastery: Record<PieceType, PieceMastery>,
  dotMode: DotMode,
  displayMode: string,
  resolvedPatternCount: number,
  totalPatternCount: number,
  practiceSolveRate: number,
): number {
  // Piece mastery (25%)
  const graduatedCount = ALL_PIECE_TYPES.filter((t) => mastery[t]?.graduated).length
  const masteryScore = (graduatedCount / 7) * 25

  // Label independence (15%)
  const labelScore = displayMode === 'characters_only' ? 15 : displayMode === 'vietnamese' ? 7.5 : 0

  // Pattern resolution (20%)
  const patternScore = totalPatternCount > 0 ? (resolvedPatternCount / totalPatternCount) * 20 : 20

  // Dot independence (15%)
  const dotScore =
    dotMode === 'off' ? 15 : dotMode === 'on_request' ? 11.25 : dotMode === 'adaptive' ? 7.5 : 0

  // Practice performance (25%)
  const practiceScore = practiceSolveRate * 25

  return Math.round(masteryScore + labelScore + patternScore + dotScore + practiceScore)
}
