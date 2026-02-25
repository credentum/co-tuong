import { create } from 'zustand'
import type { Piece, Position, Side } from '@/types/game'
import { INITIAL_POSITION } from '@/constants/initialPosition'
import { getFullyLegalMoves, getGameResult, type GameResult } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import { getRandomBotMove } from '@/lib/bot'

export type OpponentMode = 'pass-and-play' | 'random-bot'

interface GameStore {
  pieces: Piece[]
  currentTurn: Side
  selectedPosition: Position | null
  legalMoves: Position[]
  confirmMoveEnabled: boolean
  pendingMove: { from: Position; to: Position } | null
  gameResult: GameResult
  opponentMode: OpponentMode

  selectPosition: (pos: Position) => void
  confirmMove: () => void
  cancelMove: () => void
  toggleConfirmMove: () => void
  setOpponentMode: (mode: OpponentMode) => void
  resetGame: () => void
}

function applyMove(
  pieces: Piece[],
  from: Position,
  to: Position,
  currentTurn: Side,
): { pieces: Piece[]; currentTurn: Side; gameResult: GameResult } {
  const filtered = pieces.filter((p) => !posEq(p.position, to))
  const updated = filtered.map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
  const nextTurn: Side = currentTurn === 'red' ? 'black' : 'red'
  const gameResult = getGameResult(updated, nextTurn)
  return { pieces: updated, currentTurn: nextTurn, gameResult }
}

export const useGameStore = create<GameStore>((set, get) => ({
  pieces: INITIAL_POSITION,
  currentTurn: 'red',
  selectedPosition: null,
  legalMoves: [],
  confirmMoveEnabled: false,
  pendingMove: null,
  gameResult: 'ongoing',
  opponentMode: 'pass-and-play',

  selectPosition: (pos) => {
    const {
      pieces,
      currentTurn,
      selectedPosition,
      legalMoves,
      confirmMoveEnabled,
      gameResult,
      opponentMode,
    } = get()

    if (gameResult !== 'ongoing') return

    // Block human input during bot's turn
    if (opponentMode === 'random-bot' && currentTurn === 'black') return

    const tappedPiece = pieces.find((p) => posEq(p.position, pos))

    // Case 1: Nothing selected, tap own piece → select it
    if (!selectedPosition) {
      if (tappedPiece && tappedPiece.side === currentTurn) {
        const moves = getFullyLegalMoves(tappedPiece, pieces)
        set({ selectedPosition: pos, legalMoves: moves, pendingMove: null })
        return
      }
      // Silently ignore opponent pieces or empty squares
      return
    }

    // Case 2: Already selected, tap same piece → deselect
    if (posEq(selectedPosition, pos)) {
      set({ selectedPosition: null, legalMoves: [], pendingMove: null })
      return
    }

    // Case 3: Already selected, tap different own piece → reselect
    if (tappedPiece && tappedPiece.side === currentTurn) {
      const moves = getFullyLegalMoves(tappedPiece, pieces)
      set({ selectedPosition: pos, legalMoves: moves, pendingMove: null })
      return
    }

    // Case 4: Already selected, tap legal destination → move (or set pending)
    const isLegal = legalMoves.some((m) => posEq(m, pos))
    if (isLegal) {
      if (confirmMoveEnabled) {
        set({ pendingMove: { from: selectedPosition, to: pos } })
        return
      }
      const result = applyMove(pieces, selectedPosition, pos, currentTurn)
      set({
        ...result,
        selectedPosition: null,
        legalMoves: [],
        pendingMove: null,
      })
      // Trigger bot move if needed
      if (
        result.gameResult === 'ongoing' &&
        opponentMode === 'random-bot' &&
        result.currentTurn === 'black'
      ) {
        scheduleBotMove()
      }
      return
    }

    // Case 5: Already selected, tap illegal destination → just deselect
    set({ selectedPosition: null, legalMoves: [], pendingMove: null })
  },

  confirmMove: () => {
    const { pieces, currentTurn, pendingMove, opponentMode } = get()
    if (!pendingMove) return
    const result = applyMove(pieces, pendingMove.from, pendingMove.to, currentTurn)
    set({
      ...result,
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
    })
    if (
      result.gameResult === 'ongoing' &&
      opponentMode === 'random-bot' &&
      result.currentTurn === 'black'
    ) {
      scheduleBotMove()
    }
  },

  cancelMove: () => {
    set({ pendingMove: null, selectedPosition: null, legalMoves: [] })
  },

  toggleConfirmMove: () => {
    set((s) => ({ confirmMoveEnabled: !s.confirmMoveEnabled, pendingMove: null }))
  },

  setOpponentMode: (mode) => {
    set({ opponentMode: mode })
    // Reset game when changing mode
    get().resetGame()
  },

  resetGame: () => {
    set({
      pieces: INITIAL_POSITION,
      currentTurn: 'red',
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
      gameResult: 'ongoing',
    })
  },
}))

function scheduleBotMove() {
  setTimeout(() => {
    const { pieces, currentTurn, gameResult } = useGameStore.getState()
    if (gameResult !== 'ongoing' || currentTurn !== 'black') return
    const botMove = getRandomBotMove(pieces, 'black')
    if (!botMove) return
    const result = applyMove(pieces, botMove.from, botMove.to, currentTurn)
    useGameStore.setState({
      ...result,
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
    })
  }, 300)
}
