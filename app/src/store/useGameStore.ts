import { create } from 'zustand'
import type { Piece, Position, Side } from '@/types/game'
import { INITIAL_POSITION } from '@/constants/initialPosition'
import { getFullyLegalMoves, getGameResult, type GameResult } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import { getRandomBotMove } from '@/lib/bot'
import { getMinimaxMove } from '@/lib/ai'

export type OpponentMode = 'pass-and-play' | 'random-bot' | 'minimax'

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

function isAiTurn(mode: OpponentMode, turn: Side): boolean {
  return (mode === 'random-bot' || mode === 'minimax') && turn === 'black'
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
    if (isAiTurn(opponentMode, currentTurn)) return

    const tappedPiece = pieces.find((p) => posEq(p.position, pos))

    if (!selectedPosition) {
      if (tappedPiece && tappedPiece.side === currentTurn) {
        const moves = getFullyLegalMoves(tappedPiece, pieces)
        set({ selectedPosition: pos, legalMoves: moves, pendingMove: null })
      }
      return
    }

    if (posEq(selectedPosition, pos)) {
      set({ selectedPosition: null, legalMoves: [], pendingMove: null })
      return
    }

    if (tappedPiece && tappedPiece.side === currentTurn) {
      const moves = getFullyLegalMoves(tappedPiece, pieces)
      set({ selectedPosition: pos, legalMoves: moves, pendingMove: null })
      return
    }

    const isLegal = legalMoves.some((m) => posEq(m, pos))
    if (isLegal) {
      if (confirmMoveEnabled) {
        set({ pendingMove: { from: selectedPosition, to: pos } })
        return
      }
      const result = applyMove(pieces, selectedPosition, pos, currentTurn)
      set({ ...result, selectedPosition: null, legalMoves: [], pendingMove: null })
      if (result.gameResult === 'ongoing' && isAiTurn(opponentMode, result.currentTurn)) {
        scheduleAiMove(opponentMode)
      }
      return
    }

    set({ selectedPosition: null, legalMoves: [], pendingMove: null })
  },

  confirmMove: () => {
    const { pieces, currentTurn, pendingMove, opponentMode } = get()
    if (!pendingMove) return
    const result = applyMove(pieces, pendingMove.from, pendingMove.to, currentTurn)
    set({ ...result, selectedPosition: null, legalMoves: [], pendingMove: null })
    if (result.gameResult === 'ongoing' && isAiTurn(opponentMode, result.currentTurn)) {
      scheduleAiMove(opponentMode)
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

function scheduleAiMove(mode: OpponentMode) {
  setTimeout(() => {
    const { pieces, currentTurn, gameResult } = useGameStore.getState()
    if (gameResult !== 'ongoing' || currentTurn !== 'black') return

    const aiMove =
      mode === 'minimax' ? getMinimaxMove(pieces, 'black', 2) : getRandomBotMove(pieces, 'black')
    if (!aiMove) return

    const result = applyMove(pieces, aiMove.from, aiMove.to, currentTurn)
    useGameStore.setState({
      ...result,
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
    })
  }, 300)
}
