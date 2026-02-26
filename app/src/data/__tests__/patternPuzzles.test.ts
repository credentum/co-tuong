import { describe, it, expect } from 'vitest'
import { ALL_PATTERN_PUZZLES } from '../patternPuzzles'
import { PATTERN_DEFS } from '../patternDefs'
import { getFullyLegalMoves, isInCheck } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import type { Piece, Position } from '@/types/game'

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

describe('Pattern puzzles', () => {
  const puzzles = Object.values(ALL_PATTERN_PUZZLES)

  it('has 15 puzzles total (3 patterns × 5)', () => {
    expect(puzzles).toHaveLength(15)
  })

  it('all pattern puzzle IDs referenced in PATTERN_DEFS exist', () => {
    for (const pattern of PATTERN_DEFS) {
      for (const puzzleId of pattern.puzzleIds) {
        expect(
          ALL_PATTERN_PUZZLES[puzzleId],
          `Missing puzzle ${puzzleId} for pattern ${pattern.patternId}`,
        ).toBeDefined()
      }
    }
  })

  it('each pattern has exactly 5 puzzle IDs', () => {
    for (const pattern of PATTERN_DEFS) {
      expect(pattern.puzzleIds, `Pattern ${pattern.patternId}`).toHaveLength(5)
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

      it('has no duplicate positions', () => {
        const seen = new Set<string>()
        for (const piece of puzzle.setup.pieces) {
          const key = `${piece.position.col},${piece.position.row}`
          expect(seen.has(key), `Duplicate position ${key} in ${puzzle.puzzleId}`).toBe(false)
          seen.add(key)
        }
      })

      it('player is not in check at start', () => {
        const inCheck = isInCheck(puzzle.setup.pieces, puzzle.setup.playerSide)
        expect(inCheck).toBe(false)
      })

      it('solution first move is legal', () => {
        const pieces = [...puzzle.setup.pieces]
        const step = puzzle.solution[0]!
        const { from, to } = step.playerMove

        const piece = pieces.find((p) => posEq(p.position, from))
        expect(piece, `No piece at from (${from.col},${from.row})`).toBeDefined()
        expect(piece!.side, `Piece at from is wrong side`).toBe(puzzle.setup.playerSide)

        const legalMoves = getFullyLegalMoves(piece!, pieces)
        const isLegal = legalMoves.some((m) => posEq(m, to))
        expect(isLegal, `Move (${from.col},${from.row}) → (${to.col},${to.row}) is not legal`).toBe(
          true,
        )
      })

      it('alternative moves are also legal', () => {
        const pieces = [...puzzle.setup.pieces]
        const step = puzzle.solution[0]!
        if (!step.alternativeMoves) return

        for (const alt of step.alternativeMoves) {
          const piece = pieces.find((p) => posEq(p.position, alt.from))
          expect(piece, `No piece at alt from (${alt.from.col},${alt.from.row})`).toBeDefined()

          const legalMoves = getFullyLegalMoves(piece!, pieces)
          const isLegal = legalMoves.some((m) => posEq(m, alt.to))
          expect(
            isLegal,
            `Alt move (${alt.from.col},${alt.from.row}) → (${alt.to.col},${alt.to.row}) is not legal`,
          ).toBe(true)
        }
      })
    })
  }
})

describe('Pattern definitions', () => {
  it('has 3 patterns defined', () => {
    expect(PATTERN_DEFS).toHaveLength(3)
  })

  it('all patterns are survival level', () => {
    for (const pattern of PATTERN_DEFS) {
      expect(pattern.level).toBe('survival')
    }
  })

  it('pattern IDs are sequential starting from 1', () => {
    expect(PATTERN_DEFS.map((p) => p.patternId)).toEqual([1, 2, 3])
  })

  for (const pattern of PATTERN_DEFS) {
    describe(`Pattern ${pattern.patternId}: ${pattern.name}`, () => {
      it('seeIt has moves and matching annotations', () => {
        expect(pattern.seeIt.moves.length).toBeGreaterThan(0)
        expect(pattern.seeIt.annotations.length).toBe(pattern.seeIt.moves.length)
      })

      it('seeIt starting pieces have both generals', () => {
        const redGen = pattern.seeIt.startingPieces.find(
          (p) => p.type === 'tuong' && p.side === 'red',
        )
        const blackGen = pattern.seeIt.startingPieces.find(
          (p) => p.type === 'tuong' && p.side === 'black',
        )
        expect(redGen).toBeDefined()
        expect(blackGen).toBeDefined()
      })

      it('seeIt moves are all legal in sequence', () => {
        let pieces = [...pattern.seeIt.startingPieces]
        for (let i = 0; i < pattern.seeIt.moves.length; i++) {
          const move = pattern.seeIt.moves[i]!
          const piece = pieces.find((p) => posEq(p.position, move.from))
          expect(
            piece,
            `SeeIt move ${i + 1}: no piece at (${move.from.col},${move.from.row})`,
          ).toBeDefined()

          const legalMoves = getFullyLegalMoves(piece!, pieces)
          const isLegal = legalMoves.some((m) => posEq(m, move.to))
          expect(
            isLegal,
            `SeeIt move ${i + 1}: (${move.from.col},${move.from.row}) → (${move.to.col},${move.to.row}) is not legal`,
          ).toBe(true)

          pieces = applyMove(pieces, move.from, move.to)
        }
      })

      it('has coaching link', () => {
        expect(pattern.coachingLink.patternTrackerId).toBeTruthy()
        expect(pattern.coachingLink.trigger).toBeTruthy()
      })
    })
  }
})
