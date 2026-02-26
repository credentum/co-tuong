/**
 * Puzzle Linter — Analyzes every legal move in a puzzle position
 * and classifies them as ACCEPTED or REJECTED using the exact same
 * logic as usePracticeStore.submitMove.
 *
 * Usage:
 *   npx vitest run src/data/__tests__/puzzleLinter.test.ts
 *
 * This prevents the whack-a-mole cycle of adding defender pieces
 * that create new forced-mate paths the engine accepts.
 */

import { describe, it, expect } from 'vitest'
import { ALL_PRACTICE_PUZZLES } from '../practicePuzzles'
import { getFullyLegalMoves, getGameResult, isInCheck } from '@/lib/moves/legality'
import { evaluateAtDepth } from '@/lib/ai'
import { posEq } from '@/lib/moves/helpers'
import { validateGoal } from '@/lib/goalValidation'
import type { Piece, Position, Side } from '@/types/game'
import type { PracticePuzzleDef, SolutionStep } from '@/types/practice'

// ── helpers ──────────────────────────────────────────────────────────

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

const PIECE_NAMES: Record<string, string> = {
  tuong: 'Gen',
  si: 'Si',
  tuongVoi: 'Voi',
  xe: 'Xe',
  phao: 'Phao',
  ma: 'Ma',
  tot: 'Tot',
}

function pieceName(p: Piece): string {
  return `${PIECE_NAMES[p.type] ?? p.type}(${p.side[0]}:${p.position.col},${p.position.row})`
}

function moveStr(from: Position, to: Position): string {
  return `(${from.col},${from.row})→(${to.col},${to.row})`
}

// ── core linter ──────────────────────────────────────────────────────

interface LintMove {
  from: Position
  to: Position
  pieceName: string
  accepted: boolean
  reason: string
  score?: number
}

interface StepLintResult {
  stepIndex: number
  pieces: Piece[]
  movingPiece: Piece | undefined
  allLegalMoves: LintMove[]
  acceptedCount: number
  rejectedCount: number
  intendedMoveAccepted: boolean
}

interface PuzzleLintResult {
  puzzleId: string
  startErrors: string[]
  steps: StepLintResult[]
  healthy: boolean
}

/**
 * Check if a move would be accepted by the store's submitMove logic.
 * Replicates usePracticeStore.ts lines 264-320 exactly.
 */
function wouldAcceptMove(
  pieces: Piece[],
  from: Position,
  to: Position,
  puzzle: PracticePuzzleDef,
  step: SolutionStep,
  stepIndex: number,
): { accepted: boolean; reason: string; score?: number } {
  const playerSide = puzzle.setup.playerSide
  const oppSide: Side = playerSide === 'red' ? 'black' : 'red'
  const wins = playerSide === 'red' ? 'red_wins' : 'black_wins'
  const isCheckmatePuzzle = puzzle.concept.startsWith('checkmate')

  // 1. Check hardcoded solution match
  if (posEq(from, step.playerMove.from) && posEq(to, step.playerMove.to)) {
    return { accepted: true, reason: 'hardcoded solution' }
  }

  // 2. Check alternativeMoves
  if (step.alternativeMoves?.some((alt) => posEq(from, alt.from) && posEq(to, alt.to))) {
    return { accepted: true, reason: 'listed alternative' }
  }

  // 3. Goal-based validation
  if (puzzle.goal) {
    const remainingSteps = puzzle.solution.length - stepIndex - 1
    const result = validateGoal(pieces, from, to, playerSide, puzzle.goal, remainingSteps)
    if (result.valid) {
      return { accepted: true, reason: `goal:${puzzle.goal.type}` }
    }
  }

  // 4. Engine validation for checkmate puzzles
  if (isCheckmatePuzzle) {
    const afterMove = applyMove(pieces, from, to)

    if (!step.opponentResponse) {
      // Final step: accept any move that delivers immediate checkmate
      if (getGameResult(afterMove, oppSide) === wins) {
        return { accepted: true, reason: 'engine: delivers checkmate' }
      }
    } else {
      // Intermediate step: check if forced mate still exists at required depth
      const remainingSteps = puzzle.solution.length - stepIndex - 1
      const depth = remainingSteps * 2
      const score = evaluateAtDepth(afterMove, oppSide, depth)
      if (score >= 9000) {
        return {
          accepted: true,
          reason: `engine: forced mate (score=${score}, depth=${depth})`,
          score,
        }
      }
      return { accepted: false, reason: `eval=${score} (need ≥9000, depth=${depth})`, score }
    }
  }

  return { accepted: false, reason: 'no match' }
}

/**
 * Lint a single puzzle step: generate all legal moves for the moving piece
 * and classify each as accepted or rejected.
 */
function lintStep(pieces: Piece[], puzzle: PracticePuzzleDef, stepIndex: number): StepLintResult {
  const step = puzzle.solution[stepIndex]!
  const movingPiece = pieces.find((p) => posEq(p.position, step.playerMove.from))

  // Get all legal moves for the piece that should move
  const legalTargets = movingPiece ? getFullyLegalMoves(movingPiece, pieces) : []

  const allLegalMoves: LintMove[] = legalTargets.map((to) => {
    const result = wouldAcceptMove(pieces, step.playerMove.from, to, puzzle, step, stepIndex)
    return {
      from: step.playerMove.from,
      to,
      pieceName: movingPiece ? pieceName(movingPiece) : 'unknown',
      accepted: result.accepted,
      reason: result.reason,
      score: result.score,
    }
  })

  const intendedMoveAccepted = allLegalMoves.some(
    (m) => posEq(m.to, step.playerMove.to) && m.accepted,
  )

  return {
    stepIndex,
    pieces,
    movingPiece,
    allLegalMoves,
    acceptedCount: allLegalMoves.filter((m) => m.accepted).length,
    rejectedCount: allLegalMoves.filter((m) => !m.accepted).length,
    intendedMoveAccepted,
  }
}

/**
 * Lint an entire puzzle: check starting position validity and all steps.
 */
function lintPuzzle(puzzle: PracticePuzzleDef): PuzzleLintResult {
  const startErrors: string[] = []
  const pieces = puzzle.setup.pieces
  const playerSide = puzzle.setup.playerSide

  // Check: player not in check at start
  if (isInCheck(pieces, playerSide)) {
    startErrors.push(`${playerSide} is in CHECK at start position`)
  }

  // Note: opponent in check at start is valid for puzzles (e.g. checkmate-in-2
  // where the first move must maintain or create check). Only player-in-check is an error.

  // Lint each step
  const steps: StepLintResult[] = []
  let currentPieces = [...pieces]

  for (let i = 0; i < puzzle.solution.length; i++) {
    const step = puzzle.solution[i]!
    const stepResult = lintStep(currentPieces, puzzle, i)
    steps.push(stepResult)

    // Advance position for next step
    currentPieces = applyMove(currentPieces, step.playerMove.from, step.playerMove.to)
    if (step.opponentResponse) {
      currentPieces = applyMove(currentPieces, step.opponentResponse.from, step.opponentResponse.to)
    }
  }

  // A puzzle is healthy if:
  // 1. No start errors
  // 2. Every step's intended move is accepted
  // 3. Step 1 has at least 1 rejected move (so the wrong-move test can find one)
  //    Later steps with all-accepted are OK (e.g. final checkmate step where any Xe move mates)
  const healthy =
    startErrors.length === 0 &&
    steps.every((s) => s.intendedMoveAccepted) &&
    (steps.length === 0 || steps[0]!.rejectedCount > 0)

  return { puzzleId: puzzle.puzzleId, startErrors, steps, healthy }
}

// ── pretty printer ───────────────────────────────────────────────────

function printLintResult(result: PuzzleLintResult): string {
  const lines: string[] = []
  lines.push(`\n${'═'.repeat(60)}`)
  lines.push(`PUZZLE: ${result.puzzleId}  ${result.healthy ? '✓ HEALTHY' : '✗ ISSUES FOUND'}`)
  lines.push('═'.repeat(60))

  if (result.startErrors.length > 0) {
    lines.push(`\n  START ERRORS:`)
    result.startErrors.forEach((e) => lines.push(`    ✗ ${e}`))
  }

  for (const step of result.steps) {
    lines.push(
      `\n  Step ${step.stepIndex + 1}: ${step.movingPiece ? pieceName(step.movingPiece) : '???'}`,
    )
    lines.push(
      `  Legal moves: ${step.allLegalMoves.length}  |  Accepted: ${step.acceptedCount}  |  Rejected: ${step.rejectedCount}`,
    )

    if (!step.intendedMoveAccepted) {
      lines.push(`  ✗ INTENDED MOVE NOT ACCEPTED`)
    }

    if (step.rejectedCount === 0) {
      lines.push(`  ⚠ NO REJECTED MOVES — wrong-move test will skip this step`)
    }

    const accepted = step.allLegalMoves.filter((m) => m.accepted)
    const rejected = step.allLegalMoves.filter((m) => !m.accepted)

    if (accepted.length > 0) {
      lines.push(`\n  ACCEPTED:`)
      accepted.forEach((m) => {
        lines.push(`    ✓ ${moveStr(m.from, m.to)}  — ${m.reason}`)
      })
    }
    if (rejected.length > 0) {
      lines.push(`\n  REJECTED:`)
      rejected.forEach((m) => {
        lines.push(`    ✗ ${moveStr(m.from, m.to)}  — ${m.reason}`)
      })
    }
  }

  return lines.join('\n')
}

// ── test suite ───────────────────────────────────────────────────────

const allPuzzles = Object.values(ALL_PRACTICE_PUZZLES)

describe('Puzzle Linter', () => {
  const results = allPuzzles.map(lintPuzzle)
  const unhealthy = results.filter((r) => !r.healthy)

  // Print summary for ALL puzzles
  it('lint report', () => {
    const summary: string[] = []
    summary.push('\n' + '═'.repeat(60))
    summary.push('PUZZLE LINTER SUMMARY')
    summary.push('═'.repeat(60))

    for (const r of results) {
      const status = r.healthy ? '✓' : '✗'
      const stepInfo = r.steps.map((s) => `${s.acceptedCount}A/${s.rejectedCount}R`).join(', ')
      summary.push(
        `  ${status} ${r.puzzleId}: [${stepInfo}]${r.startErrors.length > 0 ? ' START-ERR' : ''}`,
      )
    }

    summary.push(`\n  Total: ${results.length} puzzles, ${unhealthy.length} unhealthy`)

    // Print detailed reports for unhealthy puzzles
    for (const r of unhealthy) {
      summary.push(printLintResult(r))
    }

    console.log(summary.join('\n'))

    // This test always passes — it's a report generator
    expect(true).toBe(true)
  })

  // Individual health assertions per puzzle
  for (const puzzle of allPuzzles) {
    it(`${puzzle.puzzleId}: no check at start`, () => {
      const result = results.find((r) => r.puzzleId === puzzle.puzzleId)!
      expect(result.startErrors.length, result.startErrors.join('; ')).toBe(0)
    })

    it(`${puzzle.puzzleId}: intended solution is accepted`, () => {
      const result = results.find((r) => r.puzzleId === puzzle.puzzleId)!
      for (const step of result.steps) {
        expect(
          step.intendedMoveAccepted,
          `Step ${step.stepIndex + 1} intended move not accepted`,
        ).toBe(true)
      }
    })

    it(`${puzzle.puzzleId}: step 1 has rejectable moves (or test skips gracefully)`, () => {
      const result = results.find((r) => r.puzzleId === puzzle.puzzleId)!
      const step1 = result.steps[0]
      if (!step1) return
      // If only 1 legal move total, the wrong-move test skips gracefully
      if (step1.allLegalMoves.length <= 1) return
      expect(
        step1.rejectedCount,
        `Step 1: all ${step1.allLegalMoves.length} moves accepted — wrong-move test will fail`,
      ).toBeGreaterThan(0)
    })
  }
})

// Export for programmatic use
export { lintPuzzle, lintStep, printLintResult, type PuzzleLintResult, type StepLintResult }
