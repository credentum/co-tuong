import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { usePracticeStore } from '@/store/usePracticeStore'
import { ALL_PRACTICE_PUZZLES } from '../practicePuzzles'
import { getGameResult } from '@/lib/moves/legality'
import { evaluateAtDepth } from '@/lib/ai'
import { validateGoal } from '@/lib/goalValidation'
import { posEq } from '@/lib/moves/helpers'
import type { Piece, Position, Side } from '@/types/game'
import type { PracticePuzzleDef, SolutionStep } from '@/types/practice'

function applyMoveHelper(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

/**
 * Check if a move would be accepted by the store's submitMove logic.
 * Must mirror usePracticeStore.ts lines 264-320 exactly.
 */
function wouldStoreAccept(
  pieces: Piece[],
  from: Position,
  to: Position,
  puzzle: PracticePuzzleDef,
  step: SolutionStep,
  stepIndex: number,
): boolean {
  const playerSide = puzzle.setup.playerSide
  const oppSide: Side = playerSide === 'red' ? 'black' : 'red'
  const wins = playerSide === 'red' ? 'red_wins' : 'black_wins'

  // Hardcoded solution
  if (posEq(from, step.playerMove.from) && posEq(to, step.playerMove.to)) return true
  // Alternatives
  if (step.alternativeMoves?.some((alt) => posEq(from, alt.from) && posEq(to, alt.to))) return true

  // Goal-based validation
  if (puzzle.goal) {
    const remainingSteps = puzzle.solution.length - stepIndex - 1
    const result = validateGoal(pieces, from, to, playerSide, puzzle.goal, remainingSteps)
    if (result.valid) return true
  }

  // Engine validation for checkmate puzzles
  if (puzzle.concept.startsWith('checkmate')) {
    const afterMove = applyMoveHelper(pieces, from, to)
    if (!step.opponentResponse) {
      // Final step: accept any checkmate
      if (getGameResult(afterMove, oppSide) === wins) return true
    } else {
      // Intermediate step: accept if forced mate maintained
      const remainingSteps = puzzle.solution.length - stepIndex - 1
      const depth = remainingSteps * 2
      const score = evaluateAtDepth(afterMove, oppSide, depth)
      if (score >= 9000) return true
    }
  }

  return false
}

// We need to advance timers for opponent responses
vi.useFakeTimers()

function resetStore() {
  usePracticeStore.setState({
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
  })
}

function loadPuzzleDirect(puzzle: PracticePuzzleDef) {
  // Load a specific puzzle by setting session to just this puzzle
  usePracticeStore.setState({
    difficulty: puzzle.difficulty,
    sessionPuzzleIds: [puzzle.puzzleId],
    sessionIndex: 0,
    sessionResults: [],
    practiceSessionCount: 1,
  })
  usePracticeStore.getState().loadPuzzle(puzzle.puzzleId)
}

function playCorrectMove(stepIndex: number, puzzle: PracticePuzzleDef) {
  const step = puzzle.solution[stepIndex]!
  const store = usePracticeStore.getState()

  // Select the piece at 'from'
  store.selectPosition(step.playerMove.from)

  const afterSelect = usePracticeStore.getState()
  expect(
    afterSelect.selectedPosition,
    `Step ${stepIndex}: piece should be selected at (${step.playerMove.from.col},${step.playerMove.from.row})`,
  ).toBeTruthy()
  expect(
    afterSelect.selectedPosition && posEq(afterSelect.selectedPosition, step.playerMove.from),
    `Step ${stepIndex}: selected position should match from`,
  ).toBe(true)

  // Check that the target is in legal moves
  const targetInLegal = afterSelect.legalMoves.some((m) => posEq(m, step.playerMove.to))
  expect(
    targetInLegal,
    `Step ${stepIndex}: target (${step.playerMove.to.col},${step.playerMove.to.row}) not in legal moves`,
  ).toBe(true)

  // Tap the target to submit
  afterSelect.selectPosition(step.playerMove.to)
}

describe('Practice flow — step through each puzzle', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  const puzzles = Object.values(ALL_PRACTICE_PUZZLES)

  for (const puzzle of puzzles) {
    it(`${puzzle.puzzleId} (${puzzle.difficulty}): full solution play-through`, () => {
      loadPuzzleDirect(puzzle)

      const initial = usePracticeStore.getState()
      expect(initial.phaseStatus).toBe('awaiting_player_move')
      expect(initial.pieces.length).toBeGreaterThan(0)
      expect(initial.currentStepIndex).toBe(0)

      for (let i = 0; i < puzzle.solution.length; i++) {
        const step = puzzle.solution[i]!
        const before = usePracticeStore.getState()
        expect(before.phaseStatus, `Step ${i}: should be awaiting_player_move`).toBe(
          'awaiting_player_move',
        )
        expect(before.currentStepIndex, `Step ${i}: currentStepIndex should be ${i}`).toBe(i)

        // Play the correct move
        playCorrectMove(i, puzzle)

        if (step.opponentResponse) {
          // Should be in opponent_responding state
          const mid = usePracticeStore.getState()
          expect(mid.phaseStatus, `Step ${i}: should be opponent_responding`).toBe(
            'opponent_responding',
          )

          // Advance timers to trigger opponent auto-play
          vi.advanceTimersByTime(500)

          const after = usePracticeStore.getState()
          // Should have advanced to next step
          if (i < puzzle.solution.length - 1) {
            expect(after.phaseStatus, `Step ${i}: should be back to awaiting after opponent`).toBe(
              'awaiting_player_move',
            )
            expect(after.currentStepIndex, `Step ${i}: step index should advance`).toBe(i + 1)
          }
        } else {
          // Final step — should be puzzle_solved
          const final = usePracticeStore.getState()
          expect(final.phaseStatus, `Step ${i}: should be puzzle_solved (final step)`).toBe(
            'puzzle_solved',
          )
        }
      }

      // Confirm puzzle is solved
      const end = usePracticeStore.getState()
      expect(end.phaseStatus).toBe('puzzle_solved')
    })

    it(`${puzzle.puzzleId}: wrong move triggers retry then failure`, () => {
      loadPuzzleDirect(puzzle)

      const step = puzzle.solution[0]!
      const store = usePracticeStore.getState()

      // Find a truly wrong target — exclude any move the store would accept
      // (hardcoded solution, alternatives, goal validation, engine-validated mates)
      store.selectPosition(step.playerMove.from)
      const afterSelect = usePracticeStore.getState()
      const wrongTarget = afterSelect.legalMoves.find((m) => {
        return !wouldStoreAccept(afterSelect.pieces, step.playerMove.from, m, puzzle, step, 0)
      })

      if (!wrongTarget) {
        // All legal moves are correct — skip wrong move test for this puzzle
        return
      }

      // First wrong attempt
      afterSelect.selectPosition(wrongTarget)
      vi.advanceTimersByTime(1000)
      const after1 = usePracticeStore.getState()
      expect(after1.attempts).toBe(1)
      expect(after1.phaseStatus).toBe('awaiting_player_move')

      // Second wrong attempt
      after1.selectPosition(step.playerMove.from)
      const reselected = usePracticeStore.getState()
      const wrongTarget2 = reselected.legalMoves.find((m) => {
        return !wouldStoreAccept(reselected.pieces, step.playerMove.from, m, puzzle, step, 0)
      })
      if (wrongTarget2) {
        reselected.selectPosition(wrongTarget2)
        const after2 = usePracticeStore.getState()
        expect(after2.attempts).toBe(2)
        expect(after2.phaseStatus).toBe('puzzle_failed')
        expect(after2.showSolution).toBe(true)
      }
    })
  }

  it('hint request works', () => {
    const puzzle = puzzles[0]!
    loadPuzzleDirect(puzzle)
    expect(usePracticeStore.getState().hintShown).toBe(false)
    expect(usePracticeStore.getState().engineHintMove).toBeNull()
    usePracticeStore.getState().requestHint()
    const after = usePracticeStore.getState()
    expect(after.hintShown).toBe(true)
    // Engine should compute a best move for the position
    expect(after.engineHintMove).not.toBeNull()
    // Highlight squares should include the engine move
    expect(after.highlightSquares.length).toBeGreaterThan(0)
    expect(after.highlightStyle).toBe('target')
  })

  it('hint request is idempotent', () => {
    const puzzle = puzzles[0]!
    loadPuzzleDirect(puzzle)
    usePracticeStore.getState().requestHint()
    const first = usePracticeStore.getState().engineHintMove
    usePracticeStore.getState().requestHint()
    const second = usePracticeStore.getState().engineHintMove
    expect(first).toEqual(second)
  })

  it('skip advances to next puzzle', () => {
    const puzzle = puzzles[0]!
    const puzzle2 = puzzles[1]!
    usePracticeStore.setState({
      difficulty: 'easy',
      sessionPuzzleIds: [puzzle.puzzleId, puzzle2.puzzleId],
      sessionIndex: 0,
      sessionResults: [],
      practiceSessionCount: 1,
    })
    usePracticeStore.getState().loadPuzzle(puzzle.puzzleId)

    expect(usePracticeStore.getState().sessionIndex).toBe(0)
    usePracticeStore.getState().skipPuzzle()
    expect(usePracticeStore.getState().sessionIndex).toBe(1)
  })

  it('session completes after all puzzles', () => {
    const puzzle = puzzles[0]!
    usePracticeStore.setState({
      difficulty: 'easy',
      sessionPuzzleIds: [puzzle.puzzleId],
      sessionIndex: 0,
      sessionResults: [],
      practiceSessionCount: 1,
    })
    usePracticeStore.getState().loadPuzzle(puzzle.puzzleId)

    // Solve it
    for (let i = 0; i < puzzle.solution.length; i++) {
      playCorrectMove(i, puzzle)
      if (puzzle.solution[i]!.opponentResponse) {
        vi.advanceTimersByTime(500)
      }
    }

    expect(usePracticeStore.getState().phaseStatus).toBe('puzzle_solved')
    usePracticeStore.getState().nextPuzzle()
    // sessionIndex should now be past the end
    expect(usePracticeStore.getState().sessionIndex).toBe(1)
    expect(usePracticeStore.getState().sessionResults).toEqual([true])
  })
})
