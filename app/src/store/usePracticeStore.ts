import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Piece, Position } from '@/types/game'
import type {
  PracticeDifficulty,
  PracticePhaseStatus,
  PracticeProgress,
  PracticePuzzleDef,
} from '@/types/practice'
import { getFullyLegalMoves, getGameResult } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import { advanceBox, resetBox } from '@/lib/learningProgress'
import { ALL_PRACTICE_PUZZLES, PRACTICE_PUZZLES_BY_DIFFICULTY } from '@/data/practicePuzzles'
import { usePatternStore } from './usePatternStore'
import { getConceptsForPattern } from '@/lib/patternPuzzleMap'

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

interface PracticeStore {
  // Navigation
  difficulty: PracticeDifficulty | null
  sessionPuzzleIds: string[]
  sessionIndex: number
  sessionResults: boolean[] // true=solved, false=failed/skipped

  // Board state
  pieces: Piece[]
  selectedPosition: Position | null
  legalMoves: Position[]

  // Multi-move state machine
  phaseStatus: PracticePhaseStatus
  currentStepIndex: number
  attempts: number
  showSolution: boolean
  hintShown: boolean
  lastMoveHighlight: { from: Position; to: Position } | null
  highlightSquares: Position[]
  highlightStyle: 'target' | 'correct' | 'incorrect'

  // Internal snapshots (not persisted)
  _piecesAtStepStart: Piece[]

  // Persisted progress
  practiceProgress: PracticeProgress[]
  practiceSessionCount: number

  // Actions
  startSession: (difficulty: PracticeDifficulty) => void
  exitPractice: () => void
  loadPuzzle: (puzzleId: string) => void
  selectPosition: (pos: Position) => void
  submitMove: (from: Position, to: Position) => void
  nextPuzzle: () => void
  skipPuzzle: () => void
  retryPuzzle: () => void
  requestHint: () => void
  recordResult: (puzzleId: string, correct: boolean) => void
  getCurrentPuzzle: () => PracticePuzzleDef | null
}

export const usePracticeStore = create<PracticeStore>()(
  persist(
    (set, get) => ({
      difficulty: null,
      sessionPuzzleIds: [],
      sessionIndex: 0,
      sessionResults: [],
      pieces: [],
      selectedPosition: null,
      legalMoves: [],
      phaseStatus: 'awaiting_player_move',
      currentStepIndex: 0,
      attempts: 0,
      showSolution: false,
      hintShown: false,
      lastMoveHighlight: null,
      highlightSquares: [],
      highlightStyle: 'target',
      _piecesAtStepStart: [],
      practiceProgress: [],
      practiceSessionCount: 0,

      startSession: (difficulty) => {
        const ids = PRACTICE_PUZZLES_BY_DIFFICULTY[difficulty]
        if (!ids || ids.length === 0) return

        // Sort by Leitner box (lowest first = needs most practice)
        const progress = get().practiceProgress
        const sorted = [...ids].sort((a, b) => {
          const pa = progress.find((p) => p.puzzleId === a)
          const pb = progress.find((p) => p.puzzleId === b)
          return (pa?.box ?? 0) - (pb?.box ?? 0)
        })

        // Prioritize puzzles matching active mistake patterns
        const activePatterns = usePatternStore.getState().getActivePatterns()
        if (activePatterns.length > 0) {
          const matchingConcepts = new Set(activePatterns.flatMap(getConceptsForPattern))
          sorted.sort((a, b) => {
            const puzzleA = ALL_PRACTICE_PUZZLES[a]
            const puzzleB = ALL_PRACTICE_PUZZLES[b]
            const aMatch = puzzleA && matchingConcepts.has(puzzleA.concept) ? 1 : 0
            const bMatch = puzzleB && matchingConcepts.has(puzzleB.concept) ? 1 : 0
            return bMatch - aMatch // matching puzzles first
          })
        }

        const sessionIds = sorted.slice(0, 5)
        // Shuffle for variety
        for (let i = sessionIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[sessionIds[i], sessionIds[j]] = [sessionIds[j]!, sessionIds[i]!]
        }

        set({
          difficulty,
          sessionPuzzleIds: sessionIds,
          sessionIndex: 0,
          sessionResults: [],
          practiceSessionCount: get().practiceSessionCount + 1,
        })

        get().loadPuzzle(sessionIds[0]!)
      },

      exitPractice: () => {
        set({
          difficulty: null,
          sessionPuzzleIds: [],
          sessionIndex: 0,
          sessionResults: [],
          pieces: [],
          selectedPosition: null,
          legalMoves: [],
          phaseStatus: 'awaiting_player_move',
          currentStepIndex: 0,
          attempts: 0,
          showSolution: false,
          hintShown: false,
          lastMoveHighlight: null,
          highlightSquares: [],
        })
      },

      loadPuzzle: (puzzleId) => {
        const puzzle = ALL_PRACTICE_PUZZLES[puzzleId]
        if (!puzzle) return
        const pieces = [...puzzle.setup.pieces]
        set({
          pieces,
          selectedPosition: null,
          legalMoves: [],
          phaseStatus: 'awaiting_player_move',
          currentStepIndex: 0,
          attempts: 0,
          showSolution: false,
          hintShown: false,
          lastMoveHighlight: null,
          highlightSquares: [],
          highlightStyle: 'target',
          _piecesAtStepStart: pieces,
        })
      },

      getCurrentPuzzle: () => {
        const { sessionPuzzleIds, sessionIndex } = get()
        const id = sessionPuzzleIds[sessionIndex]
        return id ? (ALL_PRACTICE_PUZZLES[id] ?? null) : null
      },

      selectPosition: (pos) => {
        const { phaseStatus, pieces, selectedPosition, legalMoves } = get()
        const puzzle = get().getCurrentPuzzle()
        if (!puzzle) return
        if (phaseStatus !== 'awaiting_player_move') return

        const tappedPiece = pieces.find((p) => posEq(p.position, pos))

        if (!selectedPosition) {
          if (tappedPiece && tappedPiece.side === puzzle.setup.playerSide) {
            const moves = getFullyLegalMoves(tappedPiece, pieces)
            set({ selectedPosition: pos, legalMoves: moves })
          }
          return
        }

        if (posEq(selectedPosition, pos)) {
          set({ selectedPosition: null, legalMoves: [] })
          return
        }

        if (tappedPiece && tappedPiece.side === puzzle.setup.playerSide) {
          const moves = getFullyLegalMoves(tappedPiece, pieces)
          set({ selectedPosition: pos, legalMoves: moves })
          return
        }

        const isLegal = legalMoves.some((m) => posEq(m, pos))
        if (isLegal) {
          get().submitMove(selectedPosition, pos)
        } else {
          set({ selectedPosition: null, legalMoves: [] })
        }
      },

      submitMove: (from, to) => {
        const state = get()
        if (state.phaseStatus !== 'awaiting_player_move') return
        const puzzle = state.getCurrentPuzzle()
        if (!puzzle) return

        const step = puzzle.solution[state.currentStepIndex]
        if (!step) return

        // Check if the move matches the expected solution
        let isCorrect =
          (posEq(step.playerMove.from, from) && posEq(step.playerMove.to, to)) ||
          (step.alternativeMoves?.some((m) => posEq(m.from, from) && posEq(m.to, to)) ?? false)

        // Safety net: on the final step of checkmate puzzles, accept any move that delivers checkmate
        if (!isCorrect && !step.opponentResponse && puzzle.concept.startsWith('checkmate')) {
          const afterMove = applyMove(state.pieces, from, to)
          const oppSide = puzzle.setup.playerSide === 'red' ? 'black' : 'red'
          const result = getGameResult(afterMove, oppSide)
          const wins = puzzle.setup.playerSide === 'red' ? 'red_wins' : 'black_wins'
          if (result === wins) isCorrect = true
        }

        if (isCorrect) {
          const newPieces = applyMove(state.pieces, from, to)

          if (step.opponentResponse) {
            // More steps to go — play opponent response after delay
            set({
              pieces: newPieces,
              selectedPosition: null,
              legalMoves: [],
              phaseStatus: 'opponent_responding',
              lastMoveHighlight: { from, to },
              highlightSquares: [],
            })

            setTimeout(() => {
              const current = usePracticeStore.getState()
              if (current.phaseStatus !== 'opponent_responding') return
              const opp = step.opponentResponse!
              const afterOpp = applyMove(current.pieces, opp.from, opp.to)
              set({
                pieces: afterOpp,
                currentStepIndex: current.currentStepIndex + 1,
                phaseStatus: 'awaiting_player_move',
                lastMoveHighlight: { from: opp.from, to: opp.to },
                _piecesAtStepStart: afterOpp,
                attempts: 0,
                highlightSquares: [],
              })
            }, 400)
          } else {
            // Final step — puzzle solved!
            set({
              pieces: newPieces,
              selectedPosition: null,
              legalMoves: [],
              phaseStatus: 'puzzle_solved',
              lastMoveHighlight: { from, to },
              highlightSquares: [to],
              highlightStyle: 'correct',
            })
            state.recordResult(puzzle.puzzleId, true)
          }
        } else {
          // Wrong move
          const newAttempts = state.attempts + 1
          if (newAttempts >= 2) {
            // Show solution
            set({
              selectedPosition: null,
              legalMoves: [],
              phaseStatus: 'puzzle_failed',
              attempts: newAttempts,
              showSolution: true,
              highlightSquares: [step.playerMove.to],
              highlightStyle: 'correct',
            })
            state.recordResult(puzzle.puzzleId, false)
          } else {
            // First wrong attempt — reset to step start
            set({
              pieces: [...state._piecesAtStepStart],
              selectedPosition: null,
              legalMoves: [],
              attempts: newAttempts,
              highlightSquares: [to],
              highlightStyle: 'incorrect',
            })
            // Clear incorrect highlight after a moment
            setTimeout(() => {
              const current = usePracticeStore.getState()
              if (current.highlightStyle === 'incorrect') {
                set({ highlightSquares: [] })
              }
            }, 800)
          }
        }
      },

      nextPuzzle: () => {
        const { sessionIndex, sessionPuzzleIds, phaseStatus, sessionResults } = get()
        const solved = phaseStatus === 'puzzle_solved'
        const newResults = [...sessionResults, solved]
        const nextIdx = sessionIndex + 1

        if (nextIdx >= sessionPuzzleIds.length) {
          // Session complete
          set({ sessionIndex: nextIdx, sessionResults: newResults })
          return
        }

        set({ sessionIndex: nextIdx, sessionResults: newResults })
        get().loadPuzzle(sessionPuzzleIds[nextIdx]!)
      },

      skipPuzzle: () => {
        const { sessionIndex, sessionPuzzleIds, sessionResults } = get()
        const newResults = [...sessionResults, false]
        const nextIdx = sessionIndex + 1

        if (nextIdx >= sessionPuzzleIds.length) {
          set({ sessionIndex: nextIdx, sessionResults: newResults })
          return
        }

        set({ sessionIndex: nextIdx, sessionResults: newResults })
        get().loadPuzzle(sessionPuzzleIds[nextIdx]!)
      },

      retryPuzzle: () => {
        const puzzle = get().getCurrentPuzzle()
        if (puzzle) get().loadPuzzle(puzzle.puzzleId)
      },

      requestHint: () => {
        set({ hintShown: true })
      },

      recordResult: (puzzleId, correct) => {
        const { practiceProgress, practiceSessionCount } = get()
        const existing = practiceProgress.find((p) => p.puzzleId === puzzleId)

        if (existing) {
          const updated = practiceProgress.map((p) =>
            p.puzzleId === puzzleId
              ? {
                  ...p,
                  box: correct ? advanceBox(p.box) : resetBox(),
                  lastAttemptSession: practiceSessionCount,
                  lastCorrect: correct,
                }
              : p,
          )
          set({ practiceProgress: updated })
        } else {
          set({
            practiceProgress: [
              ...practiceProgress,
              {
                puzzleId,
                box: correct ? (2 as const) : (1 as const),
                lastAttemptSession: practiceSessionCount,
                lastCorrect: correct,
              },
            ],
          })
        }
      },
    }),
    {
      name: 'cotuong_practice',
      partialize: (state) => ({
        practiceProgress: state.practiceProgress,
        practiceSessionCount: state.practiceSessionCount,
      }),
    },
  ),
)
