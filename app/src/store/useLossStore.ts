import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedLoss } from '@/types/loss'
import { useGameStore, getEvalHistory } from './useGameStore'
import { fenToBoard } from '@/lib/fen'

const MAX_LOSSES = 50

interface LossStore {
  losses: SavedLoss[]

  captureLoss: () => string | null
  markReviewed: (id: string) => void
  markConverted: (id: string) => void
  deleteLoss: (id: string) => void
  getUnreviewedCount: () => number
}

export const useLossStore = create<LossStore>()(
  persist(
    (set, get) => ({
      losses: [],

      captureLoss: () => {
        const game = useGameStore.getState()
        const { history, historyIndex, gameResult, opponentMode } = game

        if (gameResult === 'ongoing') return null
        if (opponentMode === 'pass-and-play') return null

        const evalSnaps = getEvalHistory()

        // Smart rewind: find the largest eval drop >= 15
        let fen: string | undefined
        let turningPointDrop: number | undefined
        const significantDrops = evalSnaps.filter((s) => s.evalDrop >= 15)
        if (significantDrops.length > 0) {
          const worst = significantDrops.reduce((a, b) => (b.evalDrop > a.evalDrop ? b : a))
          fen = worst.fenBefore
          turningPointDrop = worst.evalDrop
        } else {
          // Fallback: walk back 3 half-moves
          const walkback = Math.min(3, historyIndex)
          const targetIndex = historyIndex - walkback
          fen = history[targetIndex]
        }
        if (!fen) return null

        const { currentTurn } = fenToBoard(fen)

        // Check for duplicate — same FEN already saved
        const existing = get().losses.find((l) => l.fen === fen)
        if (existing) return existing.id

        const id = `loss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        const entry: SavedLoss = {
          id,
          fen,
          turn: currentTurn,
          gameResult: gameResult as 'red_wins' | 'black_wins',
          aiDifficulty: opponentMode,
          timestamp: Date.now(),
          reviewed: false,
          convertedToPuzzle: false,
          playerNotes: null,
          evalHistory: evalSnaps.length > 0 ? evalSnaps : undefined,
          turningPointDrop,
        }

        const losses = [...get().losses, entry]

        // Enforce max limit — remove oldest reviewed first, then oldest overall
        if (losses.length > MAX_LOSSES) {
          const reviewedIdx = losses.findIndex((l) => l.reviewed)
          if (reviewedIdx >= 0) {
            losses.splice(reviewedIdx, 1)
          } else {
            losses.shift()
          }
        }

        set({ losses })
        return id
      },

      markReviewed: (id) => {
        set({
          losses: get().losses.map((l) => (l.id === id ? { ...l, reviewed: true } : l)),
        })
      },

      markConverted: (id) => {
        set({
          losses: get().losses.map((l) => (l.id === id ? { ...l, convertedToPuzzle: true } : l)),
        })
      },

      deleteLoss: (id) => {
        set({ losses: get().losses.filter((l) => l.id !== id) })
      },

      getUnreviewedCount: () => {
        return get().losses.filter((l) => !l.reviewed).length
      },
    }),
    {
      name: 'co_tuong_losses',
    },
  ),
)
