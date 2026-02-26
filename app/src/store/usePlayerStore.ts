import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PieceType } from '@/types/game'

export type DotMode = 'always' | 'adaptive' | 'on_request' | 'off'

export interface PieceMastery {
  consecutiveClean: number
  graduated: boolean
  recoveryGamesLeft: number
}

const GRADUATION_THRESHOLD = 10
const RECOVERY_GAMES = 3

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

  setDotMode: (mode: DotMode) => void
  recordLegalMove: (pieceType: PieceType) => void
  recordIllegalAttempt: (pieceType: PieceType) => void
  onGameEnd: () => void
  setShowDotsOverride: (show: boolean) => void
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      dotMode: 'adaptive',
      mastery: defaultMasteryMap(),
      showDotsOverride: false,

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
        if (changed) set({ mastery: updated })
      },

      setShowDotsOverride: (show) => set({ showDotsOverride: show }),
    }),
    {
      name: 'co_tuong_player',
      partialize: (state) => ({
        dotMode: state.dotMode,
        mastery: state.mastery,
      }),
    },
  ),
)
