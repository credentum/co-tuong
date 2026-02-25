import { describe, it, expect } from 'vitest'
import { ALL_PUZZLES } from '../puzzles'
import { LESSONS } from '../lessons'
import { getFullyLegalMoves } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'

describe('puzzle verification', () => {
  // Collect all puzzle IDs referenced by lessons
  const referencedIds = LESSONS.flatMap((l) => l.puzzleIds)

  it('all lesson puzzleIds for L1-L3 exist in ALL_PUZZLES', () => {
    const l1to3Ids = LESSONS.filter((l) => l.lessonId <= 3).flatMap((l) => l.puzzleIds)
    for (const id of l1to3Ids) {
      expect(ALL_PUZZLES[id], `Missing puzzle: ${id}`).toBeDefined()
    }
  })

  it('no duplicate puzzle IDs across lessons', () => {
    const seen = new Set<string>()
    for (const id of referencedIds) {
      expect(seen.has(id), `Duplicate puzzleId: ${id}`).toBe(false)
      seen.add(id)
    }
  })

  describe('each puzzle setup is valid', () => {
    for (const [id, puzzle] of Object.entries(ALL_PUZZLES)) {
      describe(id, () => {
        const { pieces, playerSide } = puzzle.setup

        it('has both generals on the board', () => {
          const redGen = pieces.find((p) => p.type === 'tuong' && p.side === 'red')
          const blackGen = pieces.find((p) => p.type === 'tuong' && p.side === 'black')
          expect(redGen, 'Missing red general').toBeDefined()
          expect(blackGen, 'Missing black general').toBeDefined()
        })

        it('has no overlapping pieces', () => {
          for (let i = 0; i < pieces.length; i++) {
            for (let j = i + 1; j < pieces.length; j++) {
              const a = pieces[i]!.position
              const b = pieces[j]!.position
              expect(
                posEq(a, b),
                `Pieces overlap at (${a.col},${a.row}): ${pieces[i]!.type} and ${pieces[j]!.type}`,
              ).toBe(false)
            }
          }
        })

        it('all pieces are within board bounds (0-8 cols, 0-9 rows)', () => {
          for (const piece of pieces) {
            const { col, row } = piece.position
            expect(col >= 0 && col <= 8, `${piece.type} col ${col} out of bounds`).toBe(true)
            expect(row >= 0 && row <= 9, `${piece.type} row ${row} out of bounds`).toBe(true)
          }
        })

        it('generals are in their respective palaces', () => {
          for (const piece of pieces) {
            if (piece.type === 'tuong') {
              const { col, row } = piece.position
              expect(col >= 3 && col <= 5, `General col ${col} outside palace`).toBe(true)
              if (piece.side === 'red') {
                expect(row >= 0 && row <= 2, `Red general row ${row} outside palace`).toBe(true)
              } else {
                expect(row >= 7 && row <= 9, `Black general row ${row} outside palace`).toBe(true)
              }
            }
          }
        })

        if (puzzle.type === 'tap_all_targets') {
          it('focus piece has at least one legal move', () => {
            const focusPiece = pieces.find((p) => p.side === playerSide)!
            const moves = getFullyLegalMoves(focusPiece, pieces)
            expect(
              moves.length,
              `Focus piece ${focusPiece.type} at (${focusPiece.position.col},${focusPiece.position.row}) has no legal moves`,
            ).toBeGreaterThan(0)
          })
        }

        if (puzzle.type === 'find_the_move' || puzzle.type === 'find_best_move') {
          it('has at least one answer move', () => {
            expect(puzzle.answer.moves?.length, 'No answer moves defined').toBeGreaterThan(0)
          })

          it('all answer moves are legal', () => {
            for (const move of puzzle.answer.moves ?? []) {
              const movingPiece = pieces.find(
                (p) => posEq(p.position, move.from) && p.side === playerSide,
              )
              expect(
                movingPiece,
                `No ${playerSide} piece at from=(${move.from.col},${move.from.row})`,
              ).toBeDefined()

              if (movingPiece) {
                const legalMoves = getFullyLegalMoves(movingPiece, pieces)
                const isLegal = legalMoves.some((m) => posEq(m, move.to))
                expect(
                  isLegal,
                  `Move ${movingPiece.type} (${move.from.col},${move.from.row})→(${move.to.col},${move.to.row}) is not legal. Legal targets: ${legalMoves.map((m) => `(${m.col},${m.row})`).join(', ')}`,
                ).toBe(true)
              }
            }
          })
        }

        if (puzzle.type === 'true_false_series') {
          it('has highlight positions matching boolean answers', () => {
            expect(puzzle.highlightPositions?.length).toBe(puzzle.answer.booleans?.length)
          })

          it('boolean answers match actual legality', () => {
            const focusPiece = pieces.find((p) => p.side === playerSide)!
            const legalMoves = getFullyLegalMoves(focusPiece, pieces)
            for (let i = 0; i < (puzzle.highlightPositions?.length ?? 0); i++) {
              const pos = puzzle.highlightPositions![i]!
              const canReach = legalMoves.some((m) => posEq(m, pos))
              const expected = puzzle.answer.booleans![i]
              expect(
                canReach,
                `Position (${pos.col},${pos.row}): expected ${expected ? 'reachable' : 'blocked'} but was ${canReach ? 'reachable' : 'blocked'}`,
              ).toBe(expected)
            }
          })
        }
      })
    }
  })
})
