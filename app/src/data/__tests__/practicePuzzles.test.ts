import { describe, it, expect } from 'vitest'
import { ALL_PRACTICE_PUZZLES, PRACTICE_PUZZLES_BY_DIFFICULTY } from '../practicePuzzles'
import { getFullyLegalMoves, getGameResult, isInCheck } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import type { Piece, Position } from '@/types/game'

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

describe('Practice puzzles', () => {
  const puzzles = Object.values(ALL_PRACTICE_PUZZLES)

  it('has 15 puzzles total', () => {
    expect(puzzles).toHaveLength(15)
  })

  it('has 5 per difficulty', () => {
    expect(PRACTICE_PUZZLES_BY_DIFFICULTY.easy).toHaveLength(5)
    expect(PRACTICE_PUZZLES_BY_DIFFICULTY.medium).toHaveLength(5)
    expect(PRACTICE_PUZZLES_BY_DIFFICULTY.hard).toHaveLength(5)
  })

  it('all puzzle IDs in difficulty map exist in ALL_PRACTICE_PUZZLES', () => {
    for (const ids of Object.values(PRACTICE_PUZZLES_BY_DIFFICULTY)) {
      for (const id of ids) {
        expect(ALL_PRACTICE_PUZZLES[id]).toBeDefined()
      }
    }
  })

  for (const puzzle of puzzles) {
    describe(`${puzzle.puzzleId}: ${puzzle.title}`, () => {
      it('has both generals', () => {
        const redGen = puzzle.setup.pieces.find((p) => p.type === 'tuong' && p.side === 'red')
        const blackGen = puzzle.setup.pieces.find((p) => p.type === 'tuong' && p.side === 'black')
        expect(redGen).toBeDefined()
        expect(blackGen).toBeDefined()
      })

      it('player is not in check at start', () => {
        const inCheck = isInCheck(puzzle.setup.pieces, puzzle.setup.playerSide)
        expect(inCheck).toBe(false)
      })

      it('solution steps have legal player moves', () => {
        let pieces = [...puzzle.setup.pieces]
        const playerSide = puzzle.setup.playerSide

        for (let i = 0; i < puzzle.solution.length; i++) {
          const step = puzzle.solution[i]!
          const { from, to } = step.playerMove

          // Find the piece at 'from'
          const piece = pieces.find((p) => posEq(p.position, from))
          expect(piece, `Step ${i + 1}: no piece at from (${from.col},${from.row})`).toBeDefined()
          expect(piece!.side, `Step ${i + 1}: piece at from is wrong side`).toBe(playerSide)

          // Check that the move is fully legal
          const legalMoves = getFullyLegalMoves(piece!, pieces)
          const isLegal = legalMoves.some((m) => posEq(m, to))
          expect(
            isLegal,
            `Step ${i + 1}: player move (${from.col},${from.row})→(${to.col},${to.row}) is not legal`,
          ).toBe(true)

          // Apply the player move
          pieces = applyMove(pieces, from, to)

          // If there's an opponent response, apply it
          if (step.opponentResponse) {
            const opp = step.opponentResponse
            const oppPiece = pieces.find((p) => posEq(p.position, opp.from))
            expect(
              oppPiece,
              `Step ${i + 1}: no opponent piece at (${opp.from.col},${opp.from.row})`,
            ).toBeDefined()

            const oppSide = playerSide === 'red' ? 'black' : 'red'
            expect(oppPiece!.side, `Step ${i + 1}: opponent piece is wrong side`).toBe(oppSide)

            const oppLegal = getFullyLegalMoves(oppPiece!, pieces)
            const oppIsLegal = oppLegal.some((m) => posEq(m, opp.to))
            expect(
              oppIsLegal,
              `Step ${i + 1}: opponent response (${opp.from.col},${opp.from.row})→(${opp.to.col},${opp.to.row}) is not legal`,
            ).toBe(true)

            pieces = applyMove(pieces, opp.from, opp.to)
          }
        }
      })

      // For checkmate puzzles, verify the final position is actually checkmate
      if (puzzle.concept.startsWith('checkmate')) {
        it('final position is checkmate', () => {
          let pieces = [...puzzle.setup.pieces]
          for (const step of puzzle.solution) {
            pieces = applyMove(pieces, step.playerMove.from, step.playerMove.to)
            if (step.opponentResponse) {
              pieces = applyMove(pieces, step.opponentResponse.from, step.opponentResponse.to)
            }
          }
          const oppSide = puzzle.setup.playerSide === 'red' ? 'black' : 'red'
          const result = getGameResult(pieces, oppSide)
          expect(result, 'Should be checkmate').toBe(
            puzzle.setup.playerSide === 'red' ? 'red_wins' : 'black_wins',
          )
        })
      }
    })
  }
})
