import { describe, it, expect, beforeEach } from 'vitest'
import { useLearningStore } from '@/store/useLearningStore'
import { getFullyLegalMoves } from '@/lib/moves/legality'

describe('L1_P1 tap_all_targets flow', () => {
  beforeEach(() => {
    // Reset store
    useLearningStore.setState({
      currentLesson: 1,
      currentPhase: 'test_it',
      currentPuzzleIndex: 0,
      puzzleAttempts: 0,
      puzzleFeedback: 'none',
      showSolution: false,
      tappedPositions: [],
      highlightSquares: [],
      selectedPosition: null,
      legalMoves: [],
    })
    useLearningStore.getState().loadPuzzle('L1_P1')
  })

  it('correctly identifies the 6 legal targets', () => {
    const puzzle = useLearningStore.getState().getCurrentPuzzle()
    expect(puzzle).not.toBeNull()
    expect(puzzle!.type).toBe('tap_all_targets')

    const focusPiece = puzzle!.setup.pieces.find((p) => p.side === puzzle!.setup.playerSide)
    expect(focusPiece!.type).toBe('xe')

    const moves = getFullyLegalMoves(focusPiece!, puzzle!.setup.pieces)
    expect(moves.length).toBe(6)
  })

  it('ignores taps on own pieces', () => {
    const store = useLearningStore.getState()
    // Tap on the red Xe itself
    store.tapPosition({ col: 4, row: 4 })
    expect(useLearningStore.getState().tappedPositions.length).toBe(0)

    // Tap on red Phao
    store.tapPosition({ col: 4, row: 6 })
    expect(useLearningStore.getState().tappedPositions.length).toBe(0)

    // Tap on red Tot
    store.tapPosition({ col: 4, row: 2 })
    expect(useLearningStore.getState().tappedPositions.length).toBe(0)

    // Tap on red general
    store.tapPosition({ col: 5, row: 0 })
    expect(useLearningStore.getState().tappedPositions.length).toBe(0)
  })

  it('allows tapping enemy pieces and empty squares', () => {
    const store = useLearningStore.getState()
    // Tap on black Ma (capture target)
    store.tapPosition({ col: 6, row: 4 })
    expect(useLearningStore.getState().tappedPositions.length).toBe(1)

    // Tap on empty target square
    useLearningStore.getState().tapPosition({ col: 4, row: 5 })
    expect(useLearningStore.getState().tappedPositions.length).toBe(2)
  })

  it('succeeds when all 6 correct squares are tapped', () => {
    const store = useLearningStore.getState()
    const puzzle = store.getCurrentPuzzle()!
    const focusPiece = puzzle.setup.pieces.find((p) => p.side === puzzle.setup.playerSide)!
    const correctMoves = getFullyLegalMoves(focusPiece, puzzle.setup.pieces)

    // Tap all correct positions
    for (const move of correctMoves) {
      useLearningStore.getState().tapPosition(move)
    }

    const tapped = useLearningStore.getState().tappedPositions
    expect(tapped.length).toBe(6)

    // Submit
    useLearningStore.getState().submitTapAnswer()

    const state = useLearningStore.getState()
    expect(state.puzzleFeedback).toBe('correct')
  })

  it('fails when one correct square is missing', () => {
    const store = useLearningStore.getState()
    const puzzle = store.getCurrentPuzzle()!
    const focusPiece = puzzle.setup.pieces.find((p) => p.side === puzzle.setup.playerSide)!
    const correctMoves = getFullyLegalMoves(focusPiece, puzzle.setup.pieces)

    // Tap all but the last
    for (let i = 0; i < correctMoves.length - 1; i++) {
      useLearningStore.getState().tapPosition(correctMoves[i]!)
    }

    useLearningStore.getState().submitTapAnswer()
    expect(useLearningStore.getState().puzzleFeedback).toBe('incorrect')
  })

  it('fails when an extra wrong square is tapped', () => {
    const store = useLearningStore.getState()
    const puzzle = store.getCurrentPuzzle()!
    const focusPiece = puzzle.setup.pieces.find((p) => p.side === puzzle.setup.playerSide)!
    const correctMoves = getFullyLegalMoves(focusPiece, puzzle.setup.pieces)

    // Tap all correct
    for (const move of correctMoves) {
      useLearningStore.getState().tapPosition(move)
    }
    // Tap an extra wrong square (black general)
    useLearningStore.getState().tapPosition({ col: 3, row: 9 })

    const tapped = useLearningStore.getState().tappedPositions
    expect(tapped.length).toBe(7)

    useLearningStore.getState().submitTapAnswer()
    expect(useLearningStore.getState().puzzleFeedback).toBe('incorrect')
  })
})
