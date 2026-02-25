import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Piece, Position } from '@/types/game'
import type {
  LessonId,
  LessonPhase,
  LessonProgress,
  PuzzleProgress,
  PuzzleDef,
} from '@/types/learning'
import type { DisplayMode } from '@/constants/board'
import { getFullyLegalMoves } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import { ALL_PUZZLES } from '@/data/puzzles'
import { LESSONS } from '@/data/lessons'
import { advanceBox, resetBox } from '@/lib/learningProgress'

interface LearningStore {
  // Navigation
  appMode: 'game' | 'learning'
  setAppMode: (mode: 'game' | 'learning') => void

  // Display mode for piece labels
  displayMode: DisplayMode
  cycleDisplayMode: () => void

  // Lesson state
  currentLesson: LessonId | null
  currentPhase: LessonPhase
  setLesson: (id: LessonId) => void
  setPhase: (phase: LessonPhase) => void
  backToSelector: () => void

  // Board state (for puzzles)
  pieces: Piece[]
  selectedPosition: Position | null
  legalMoves: Position[]
  selectPosition: (pos: Position) => void

  // Puzzle state
  currentPuzzleIndex: number
  puzzleAttempts: number
  puzzleFeedback: 'none' | 'correct' | 'incorrect'
  showSolution: boolean
  tappedPositions: Position[]
  tapPosition: (pos: Position) => void
  submitTapAnswer: () => void
  submitMoveAnswer: (from: Position, to: Position) => void
  nextPuzzle: () => void
  loadPuzzle: (puzzleId: string) => void

  // True/false series state
  tfCurrentIndex: number
  tfAnswers: boolean[]
  tfExplanation: string
  submitTfAnswer: (answer: boolean) => void

  // Progress (persisted)
  lessonProgress: LessonProgress[]
  puzzleProgress: PuzzleProgress[]
  sessionCount: number
  completePhase: (lessonId: LessonId, phase: LessonPhase) => void
  recordPuzzleResult: (puzzleId: string, correct: boolean) => void
  isLessonUnlocked: (lessonId: LessonId) => boolean

  // Highlight state for board
  highlightSquares: Position[]
  highlightStyle: 'target' | 'correct' | 'incorrect'

  // Current puzzle helper
  getCurrentPuzzle: () => PuzzleDef | null
  getPuzzleIds: () => string[]
}

function getLessonProgress(progress: LessonProgress[], id: LessonId): LessonProgress {
  return (
    progress.find((p) => p.lessonId === id) ?? {
      lessonId: id,
      seeItComplete: false,
      tryItComplete: false,
      testItComplete: false,
      useItComplete: false,
    }
  )
}

function upsertLessonProgress(
  arr: LessonProgress[],
  id: LessonId,
  update: Partial<LessonProgress>,
): LessonProgress[] {
  const existing = arr.find((p) => p.lessonId === id)
  if (existing) {
    return arr.map((p) => (p.lessonId === id ? { ...p, ...update } : p))
  }
  return [
    ...arr,
    {
      lessonId: id,
      seeItComplete: false,
      tryItComplete: false,
      testItComplete: false,
      useItComplete: false,
      ...update,
    },
  ]
}

export const useLearningStore = create<LearningStore>()(
  persist(
    (set, get) => ({
      // Navigation
      appMode: 'game',
      setAppMode: (mode) => set({ appMode: mode }),

      // Display mode for piece labels
      displayMode: 'english' as DisplayMode,
      cycleDisplayMode: () => {
        const modes: DisplayMode[] = ['english', 'vietnamese', 'characters_only']
        const current = get().displayMode
        const next = modes[(modes.indexOf(current) + 1) % modes.length]!
        set({ displayMode: next })
      },

      // Lesson state
      currentLesson: null,
      currentPhase: 'see_it',
      setLesson: (id) =>
        set({
          currentLesson: id,
          currentPhase: 'see_it',
          currentPuzzleIndex: 0,
          puzzleAttempts: 0,
          puzzleFeedback: 'none',
          showSolution: false,
          tappedPositions: [],
          highlightSquares: [],
          selectedPosition: null,
          legalMoves: [],
          tfCurrentIndex: 0,
          tfAnswers: [],
          tfExplanation: '',
        }),
      setPhase: (phase) => {
        set({
          currentPhase: phase,
          currentPuzzleIndex: 0,
          puzzleAttempts: 0,
          puzzleFeedback: 'none',
          showSolution: false,
          tappedPositions: [],
          highlightSquares: [],
          selectedPosition: null,
          legalMoves: [],
          tfCurrentIndex: 0,
          tfAnswers: [],
          tfExplanation: '',
        })
        // Load first puzzle if entering test_it
        if (phase === 'test_it') {
          const ids = get().getPuzzleIds()
          if (ids[0]) {
            get().loadPuzzle(ids[0])
          }
        }
      },
      backToSelector: () =>
        set({
          currentLesson: null,
          currentPhase: 'see_it',
          pieces: [],
          selectedPosition: null,
          legalMoves: [],
          highlightSquares: [],
        }),

      // Board state
      pieces: [],
      selectedPosition: null,
      legalMoves: [],
      selectPosition: (pos) => {
        const state = get()
        const puzzle = state.getCurrentPuzzle()
        if (!puzzle) return

        // For find_the_move / find_best_move: piece selection + move
        if (puzzle.type === 'find_the_move' || puzzle.type === 'find_best_move') {
          const { pieces, selectedPosition, legalMoves } = state
          const tappedPiece = pieces.find(
            (p) => p.position.col === pos.col && p.position.row === pos.row,
          )

          if (!selectedPosition) {
            // Select a player piece
            if (tappedPiece && tappedPiece.side === puzzle.setup.playerSide) {
              const moves = getFullyLegalMoves(tappedPiece, pieces)
              set({ selectedPosition: pos, legalMoves: moves })
            }
            return
          }

          // Deselect
          if (posEq(selectedPosition, pos)) {
            set({ selectedPosition: null, legalMoves: [] })
            return
          }

          // Switch to another own piece
          if (tappedPiece && tappedPiece.side === puzzle.setup.playerSide) {
            const moves = getFullyLegalMoves(tappedPiece, pieces)
            set({ selectedPosition: pos, legalMoves: moves })
            return
          }

          // Attempt move
          const isLegal = legalMoves.some((m) => posEq(m, pos))
          if (isLegal) {
            state.submitMoveAnswer(selectedPosition, pos)
          } else {
            set({ selectedPosition: null, legalMoves: [] })
          }
        }
      },

      // Puzzle state
      currentPuzzleIndex: 0,
      puzzleAttempts: 0,
      puzzleFeedback: 'none',
      showSolution: false,
      tappedPositions: [],
      tfCurrentIndex: 0,
      tfAnswers: [],
      tfExplanation: '',

      tapPosition: (pos) => {
        const state = get()
        const puzzle = state.getCurrentPuzzle()
        if (!puzzle || puzzle.type !== 'tap_all_targets') return
        if (state.puzzleFeedback !== 'none') return

        // Ignore taps on own pieces (can't move there)
        const ownPiece = state.pieces.find(
          (p) => p.side === puzzle.setup.playerSide && posEq(p.position, pos),
        )
        if (ownPiece) return

        const already = state.tappedPositions.findIndex((p) => posEq(p, pos))
        if (already >= 0) {
          // Un-tap
          set({
            tappedPositions: state.tappedPositions.filter((_, i) => i !== already),
          })
        } else {
          set({ tappedPositions: [...state.tappedPositions, pos] })
        }
      },

      submitTapAnswer: () => {
        const state = get()
        const puzzle = state.getCurrentPuzzle()
        if (!puzzle || puzzle.type !== 'tap_all_targets') return

        // Compute correct answer from legal moves of the focus piece
        const focusPiece = puzzle.setup.pieces.find((p) => p.side === puzzle.setup.playerSide)
        if (!focusPiece) return

        const correctMoves = getFullyLegalMoves(focusPiece, puzzle.setup.pieces)
        const tapped = state.tappedPositions

        const allCorrect =
          tapped.length === correctMoves.length &&
          correctMoves.every((cm) => tapped.some((t) => posEq(t, cm)))

        if (allCorrect) {
          set({
            puzzleFeedback: 'correct',
            highlightSquares: tapped,
            highlightStyle: 'correct',
          })
          state.recordPuzzleResult(puzzle.puzzleId, true)
        } else {
          const attempts = state.puzzleAttempts + 1
          set({
            puzzleFeedback: 'incorrect',
            puzzleAttempts: attempts,
            showSolution: attempts >= 2,
            highlightSquares: attempts >= 2 ? correctMoves : tapped,
            highlightStyle: attempts >= 2 ? 'correct' : 'incorrect',
          })
          if (attempts >= 2) {
            state.recordPuzzleResult(puzzle.puzzleId, false)
          }
        }
      },

      submitMoveAnswer: (from, to) => {
        const state = get()
        const puzzle = state.getCurrentPuzzle()
        if (!puzzle) return

        const isCorrect = puzzle.answer.moves?.some((m) => posEq(m.from, from) && posEq(m.to, to))

        if (isCorrect) {
          set({
            puzzleFeedback: 'correct',
            selectedPosition: null,
            legalMoves: [],
            highlightSquares: [to],
            highlightStyle: 'correct',
          })
          state.recordPuzzleResult(puzzle.puzzleId, true)
        } else {
          const attempts = state.puzzleAttempts + 1
          const showSol = attempts >= 2
          set({
            puzzleFeedback: 'incorrect',
            puzzleAttempts: attempts,
            showSolution: showSol,
            selectedPosition: null,
            legalMoves: [],
            highlightSquares:
              showSol && puzzle.answer.moves?.[0] ? [puzzle.answer.moves[0].to] : [],
            highlightStyle: showSol ? 'correct' : 'incorrect',
          })
          if (showSol) {
            state.recordPuzzleResult(puzzle.puzzleId, false)
          }
        }
      },

      submitTfAnswer: (answer) => {
        const state = get()
        const puzzle = state.getCurrentPuzzle()
        if (!puzzle || puzzle.type !== 'true_false_series') return
        if (state.puzzleFeedback !== 'none') return

        const positions = puzzle.highlightPositions ?? []
        const correctAnswers = puzzle.answer.booleans ?? []
        const newAnswers = [...state.tfAnswers, answer]
        const idx = state.tfCurrentIndex

        const isCorrect = answer === correctAnswers[idx]

        if (!isCorrect) {
          const attempts = state.puzzleAttempts + 1
          const showSol = attempts >= 2
          const explanation = puzzle.tfExplanations?.[idx] ?? ''
          set({
            tfAnswers: newAnswers,
            tfExplanation: explanation,
            puzzleFeedback: 'incorrect',
            puzzleAttempts: attempts,
            showSolution: showSol,
            highlightSquares: showSol ? positions : [positions[idx]!],
            highlightStyle: showSol ? 'correct' : 'incorrect',
          })
          if (showSol) {
            state.recordPuzzleResult(puzzle.puzzleId, false)
          }
          return
        }

        // Correct answer — advance to next question or finish
        if (idx + 1 >= positions.length) {
          // All questions answered correctly
          set({
            tfAnswers: newAnswers,
            tfCurrentIndex: idx + 1,
            tfExplanation: '',
            puzzleFeedback: 'correct',
            highlightSquares: positions,
            highlightStyle: 'correct',
          })
          state.recordPuzzleResult(puzzle.puzzleId, true)
        } else {
          // Next question
          set({
            tfAnswers: newAnswers,
            tfCurrentIndex: idx + 1,
            tfExplanation: '',
            highlightSquares: [positions[idx + 1]!],
            highlightStyle: 'target',
          })
        }
      },

      nextPuzzle: () => {
        const state = get()
        const ids = state.getPuzzleIds()
        const nextIdx = state.currentPuzzleIndex + 1
        if (nextIdx >= ids.length) {
          // All puzzles done — complete the phase and advance index so getCurrentPuzzle returns null
          if (state.currentLesson) {
            state.completePhase(state.currentLesson, 'test_it')
          }
          set({ currentPuzzleIndex: nextIdx })
          return
        }
        const nextId = ids[nextIdx]!
        set({
          currentPuzzleIndex: nextIdx,
          puzzleAttempts: 0,
          puzzleFeedback: 'none',
          showSolution: false,
          tappedPositions: [],
          highlightSquares: [],
          selectedPosition: null,
          legalMoves: [],
          tfCurrentIndex: 0,
          tfAnswers: [],
          tfExplanation: '',
        })
        get().loadPuzzle(nextId)
      },

      loadPuzzle: (puzzleId) => {
        const puzzle = ALL_PUZZLES[puzzleId]
        if (puzzle) {
          // Reset all visual state before loading new puzzle
          const reset: Record<string, unknown> = {
            pieces: [...puzzle.setup.pieces],
            tappedPositions: [],
            highlightSquares: [],
            highlightStyle: 'target' as const,
            selectedPosition: null,
            legalMoves: [],
            puzzleFeedback: 'none',
            showSolution: false,
            puzzleAttempts: 0,
            tfCurrentIndex: 0,
            tfAnswers: [],
            tfExplanation: '',
          }
          // For true_false_series, highlight the first position
          if (puzzle.type === 'true_false_series' && puzzle.highlightPositions?.[0]) {
            reset.highlightSquares = [puzzle.highlightPositions[0]]
          }
          set(reset)
        }
      },

      // Progress
      lessonProgress: [],
      puzzleProgress: [],
      sessionCount: 0,

      completePhase: (lessonId, phase) => {
        const state = get()
        const keyMap: Record<LessonPhase, keyof LessonProgress> = {
          see_it: 'seeItComplete',
          try_it: 'tryItComplete',
          test_it: 'testItComplete',
          use_it: 'useItComplete',
        }
        set({
          lessonProgress: upsertLessonProgress(state.lessonProgress, lessonId, {
            [keyMap[phase]]: true,
          }),
        })
      },

      recordPuzzleResult: (puzzleId, correct) => {
        const state = get()
        const existing = state.puzzleProgress.find((p) => p.puzzleId === puzzleId)
        if (existing) {
          set({
            puzzleProgress: state.puzzleProgress.map((p) =>
              p.puzzleId === puzzleId
                ? {
                    ...p,
                    box: correct ? advanceBox(p.box) : resetBox(),
                    lastAttemptSession: state.sessionCount,
                    lastCorrect: correct,
                  }
                : p,
            ),
          })
        } else {
          set({
            puzzleProgress: [
              ...state.puzzleProgress,
              {
                puzzleId,
                box: correct ? 2 : 1,
                lastAttemptSession: state.sessionCount,
                lastCorrect: correct,
              },
            ],
          })
        }
      },

      isLessonUnlocked: (lessonId) => {
        if (lessonId === 1) return true
        const prev = (lessonId - 1) as LessonId
        const progress = getLessonProgress(get().lessonProgress, prev)
        // Unlock when previous lesson's see_it is complete (lowered bar for Sprint 7 — try_it comes in Sprint 8)
        return progress.seeItComplete
      },

      highlightSquares: [],
      highlightStyle: 'target',

      getCurrentPuzzle: () => {
        const state = get()
        const ids = state.getPuzzleIds()
        const id = ids[state.currentPuzzleIndex]
        return id ? (ALL_PUZZLES[id] ?? null) : null
      },

      getPuzzleIds: () => {
        const state = get()
        if (!state.currentLesson) return []
        const lesson = LESSONS.find((l) => l.lessonId === state.currentLesson)
        return lesson ? lesson.puzzleIds : []
      },
    }),
    {
      name: 'cotuong_learning',
      partialize: (state) => ({
        lessonProgress: state.lessonProgress,
        puzzleProgress: state.puzzleProgress,
        sessionCount: state.sessionCount,
        displayMode: state.displayMode,
      }),
    },
  ),
)
