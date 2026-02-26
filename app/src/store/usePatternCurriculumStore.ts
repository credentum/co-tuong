import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PatternCompletion } from '@/types/patterns'
import { PATTERN_DEFS } from '@/data/patternDefs'
import { useLearningStore } from './useLearningStore'
import { usePracticeStore } from './usePracticeStore'

export type PatternStep = 'selector' | 'see_it' | 'puzzles'

interface PatternCurriculumStore {
  // Navigation
  currentPatternId: number | null
  currentStep: PatternStep

  // Persisted progress
  patternCompletion: Record<number, PatternCompletion>
  earlyUnlocks: number[] // pattern IDs unlocked early by coaching engine

  // Actions
  selectPattern: (id: number) => void
  startSeeIt: (id: number) => void
  completeSeeIt: (id: number) => void
  startPuzzles: (id: number) => void
  recordPuzzleSolved: (patternId: number) => void
  backToSelector: () => void
  exitPatterns: () => void
  isPatternUnlocked: (id: number) => boolean
  isPatternComplete: (id: number) => boolean
  getCompletion: (id: number) => PatternCompletion
  addEarlyUnlock: (id: number) => void
}

const DEFAULT_COMPLETION: PatternCompletion = { seeItDone: false, puzzlesSolved: 0 }

export const usePatternCurriculumStore = create<PatternCurriculumStore>()(
  persist(
    (set, get) => ({
      currentPatternId: null,
      currentStep: 'selector',
      patternCompletion: {},
      earlyUnlocks: [],

      selectPattern: (id) => {
        if (!get().isPatternUnlocked(id)) return
        set({ currentPatternId: id, currentStep: 'see_it' })
      },

      startSeeIt: (id) => {
        set({ currentPatternId: id, currentStep: 'see_it' })
      },

      completeSeeIt: (id) => {
        const comp = get().getCompletion(id)
        set({
          patternCompletion: {
            ...get().patternCompletion,
            [id]: { ...comp, seeItDone: true },
          },
          currentStep: 'puzzles',
        })
        // Load puzzles into practice store
        get().startPuzzles(id)
      },

      startPuzzles: (id) => {
        const pattern = PATTERN_DEFS.find((p) => p.patternId === id)
        if (!pattern) return

        const practiceStore = usePracticeStore.getState()
        // Directly load pattern puzzle IDs into practice store's session
        // Use internal state setting — same pattern as startSession/startLossSession
        usePracticeStore.setState({
          difficulty: null,
          sessionPuzzleIds: [...pattern.puzzleIds],
          sessionIndex: 0,
          sessionResults: [],
          practiceSessionCount: practiceStore.practiceSessionCount + 1,
        })
        // Load first puzzle
        if (pattern.puzzleIds[0]) {
          practiceStore.loadPuzzle(pattern.puzzleIds[0])
        }

        set({ currentPatternId: id, currentStep: 'puzzles' })
      },

      recordPuzzleSolved: (patternId) => {
        const comp = get().getCompletion(patternId)
        const newSolved = Math.min(comp.puzzlesSolved + 1, 5)
        set({
          patternCompletion: {
            ...get().patternCompletion,
            [patternId]: { ...comp, puzzlesSolved: newSolved },
          },
        })
      },

      backToSelector: () => {
        // Clean up practice store state
        usePracticeStore.getState().exitPractice()
        set({ currentPatternId: null, currentStep: 'selector' })
      },

      exitPatterns: () => {
        usePracticeStore.getState().exitPractice()
        set({ currentPatternId: null, currentStep: 'selector' })
        useLearningStore.getState().setAppMode('game')
      },

      isPatternUnlocked: (id) => {
        const state = get()

        // Early unlock from coaching engine
        if (state.earlyUnlocks.includes(id)) return true

        // Pattern 1: unlocked after all 7 Learn lessons have seeItComplete
        if (id === 1) {
          const learningState = useLearningStore.getState()
          for (let i = 1; i <= 7; i++) {
            if (!learningState.isLessonUnlocked(i as 1 | 2 | 3 | 4 | 5 | 6 | 7)) return false
            const progress = learningState.lessonProgress.find((p) => p.lessonId === i)
            if (!progress?.seeItComplete) return false
          }
          return true
        }

        // Pattern 11: needs all 1-10 complete
        if (id === 11) {
          for (let i = 1; i <= 10; i++) {
            if (!state.isPatternComplete(i)) return false
          }
          return true
        }

        // Others: previous pattern must be complete
        const prev = id - 1
        // Don't cross level boundaries (pattern 1 and 11 are handled above)
        if (prev < 1) return false
        return state.isPatternComplete(prev)
      },

      isPatternComplete: (id) => {
        const comp = get().patternCompletion[id]
        return comp ? comp.seeItDone && comp.puzzlesSolved >= 5 : false
      },

      getCompletion: (id) => {
        return get().patternCompletion[id] ?? DEFAULT_COMPLETION
      },

      addEarlyUnlock: (id) => {
        const { earlyUnlocks } = get()
        if (!earlyUnlocks.includes(id)) {
          set({ earlyUnlocks: [...earlyUnlocks, id] })
        }
      },
    }),
    {
      name: 'cotuong_patterns_curriculum',
      partialize: (state) => ({
        patternCompletion: state.patternCompletion,
        earlyUnlocks: state.earlyUnlocks,
      }),
    },
  ),
)
