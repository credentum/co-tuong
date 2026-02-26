/**
 * Analysis test: for each puzzle step, find ALL legal moves that also achieve the goal
 * but are NOT listed in the solution or alternativeMoves. These are the moves that
 * would frustrate players — they find a valid winning move but get told they're wrong.
 */
import { describe, it } from 'vitest'
import { ALL_PRACTICE_PUZZLES } from '../practicePuzzles'
import { getFullyLegalMoves, getGameResult, isInCheck } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import type { Piece, Position } from '@/types/game'

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

function fmt(pos: Position) {
  return `(${pos.col},${pos.row})`
}

describe('Puzzle alternative move analysis', () => {
  const puzzles = Object.values(ALL_PRACTICE_PUZZLES)

  for (const puzzle of puzzles) {
    it(`${puzzle.puzzleId} (${puzzle.difficulty}): check for missing alternatives`, () => {
      const playerSide = puzzle.setup.playerSide
      const oppSide = playerSide === 'red' ? 'black' : 'red'
      let pieces = [...puzzle.setup.pieces]

      for (let stepIdx = 0; stepIdx < puzzle.solution.length; stepIdx++) {
        const step = puzzle.solution[stepIdx]!
        const isLastStep = stepIdx === puzzle.solution.length - 1

        // Get ALL legal moves for all player pieces
        const playerPieces = pieces.filter((p) => p.side === playerSide)
        const allLegalMoves: { piece: Piece; from: Position; to: Position }[] = []

        for (const piece of playerPieces) {
          const moves = getFullyLegalMoves(piece, pieces)
          for (const to of moves) {
            allLegalMoves.push({ piece, from: piece.position, to })
          }
        }

        // Which moves are accepted by the solution?
        const acceptedMoves = [step.playerMove, ...(step.alternativeMoves ?? [])]
        const isAccepted = (from: Position, to: Position) =>
          acceptedMoves.some((m) => posEq(m.from, from) && posEq(m.to, to))

        // Find moves that are NOT accepted but might be valid
        const unaccepted = allLegalMoves.filter((m) => !isAccepted(m.from, m.to))

        const issues: string[] = []

        for (const move of unaccepted) {
          const afterMove = applyMove(pieces, move.from, move.to)
          const pieceName = `${move.piece.type}`

          if (isLastStep) {
            // For final step: does this move also checkmate?
            if (puzzle.concept.startsWith('checkmate')) {
              const result = getGameResult(afterMove, oppSide)
              const wins = playerSide === 'red' ? 'red_wins' : 'black_wins'
              if (result === wins) {
                issues.push(
                  `  Step ${stepIdx + 1}: ${pieceName} ${fmt(move.from)}→${fmt(move.to)} ALSO checkmates but is rejected`,
                )
              }
            }
            // For material puzzles: does this move also capture a piece?
            if (
              puzzle.concept === 'material_gain' ||
              puzzle.concept === 'cannon_screen' ||
              puzzle.concept === 'horse_fork'
            ) {
              const captured = pieces.find((p) => posEq(p.position, move.to) && p.side === oppSide)
              if (captured) {
                // Check if this capture is as good or better than the solution capture
                const solCapture = pieces.find(
                  (p) => posEq(p.position, step.playerMove.to) && p.side === oppSide,
                )
                if (
                  captured &&
                  solCapture &&
                  pieceValue(captured.type) >= pieceValue(solCapture.type)
                ) {
                  issues.push(
                    `  Step ${stepIdx + 1}: ${pieceName} ${fmt(move.from)}→${fmt(move.to)} captures ${captured.type} (value>= solution) but is rejected`,
                  )
                }
              }
            }
          } else {
            // For intermediate steps of checkmate puzzles:
            // Does this move also give check AND could still lead to mate?
            if (puzzle.concept.startsWith('checkmate')) {
              const givesCheck = isInCheck(afterMove, oppSide)
              if (givesCheck) {
                issues.push(
                  `  Step ${stepIdx + 1}: ${pieceName} ${fmt(move.from)}→${fmt(move.to)} also gives check but is rejected`,
                )
              }
            }
          }
        }

        if (issues.length > 0) {
          console.log(`\n⚠️  ${puzzle.puzzleId} "${puzzle.title}" (${puzzle.difficulty}):`)
          console.log(
            `   Total legal moves: ${allLegalMoves.length}, accepted: ${acceptedMoves.length}`,
          )
          for (const issue of issues) {
            console.log(issue)
          }
        }

        // Apply the solution move to advance
        pieces = applyMove(pieces, step.playerMove.from, step.playerMove.to)
        if (step.opponentResponse) {
          pieces = applyMove(pieces, step.opponentResponse.from, step.opponentResponse.to)
        }
      }
    })
  }
})

function pieceValue(type: Piece['type']): number {
  switch (type) {
    case 'tuong':
      return 1000
    case 'xe':
      return 9
    case 'phao':
      return 4.5
    case 'ma':
      return 4
    case 'si':
      return 2
    case 'tuongVoi':
      return 2
    case 'tot':
      return 1
  }
}
