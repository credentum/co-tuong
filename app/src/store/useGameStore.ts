import { create } from 'zustand'
import type { Piece, Position, Side } from '@/types/game'
import { INITIAL_POSITION } from '@/constants/initialPosition'
import { getFullyLegalMoves, getGameResult, type GameResult } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import { getRandomBotMove } from '@/lib/bot'
import { getMinimaxMove } from '@/lib/ai'
import { boardToFen } from '@/lib/fen'
import { moveToWxf } from '@/lib/wxf'

export type OpponentMode = 'pass-and-play' | 'random-bot' | 'medium' | 'minimax'

export interface MoveRecord {
  wxf: string
  side: Side
}

interface GameStore {
  pieces: Piece[]
  currentTurn: Side
  selectedPosition: Position | null
  legalMoves: Position[]
  confirmMoveEnabled: boolean
  pendingMove: { from: Position; to: Position } | null
  gameResult: GameResult
  opponentMode: OpponentMode
  history: string[] // FEN snapshots for undo/redo
  historyIndex: number // Current position in history
  moveList: MoveRecord[] // WXF notation move list

  boardFlipped: boolean
  lastMove: { from: Position; to: Position } | null
  aiHighlightPos: Position | null

  selectPosition: (pos: Position) => void
  confirmMove: () => void
  cancelMove: () => void
  toggleConfirmMove: () => void
  setOpponentMode: (mode: OpponentMode) => void
  resetGame: () => void
  undo: () => void
  redo: () => void
  toggleBoardFlip: () => void
}

function applyMoveLogic(
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
  return mode !== 'pass-and-play' && turn === 'black'
}

const initialFen = boardToFen(INITIAL_POSITION, 'red')

function recordMove(
  state: GameStore,
  from: Position,
  to: Position,
  result: { pieces: Piece[]; currentTurn: Side; gameResult: GameResult },
) {
  const movingPiece = state.pieces.find((p) => posEq(p.position, from))!
  const wxf = moveToWxf(movingPiece, from, to, state.pieces)
  const newFen = boardToFen(result.pieces, result.currentTurn)
  // Truncate any redo history
  const history = [...state.history.slice(0, state.historyIndex + 1), newFen]
  const moveList = [
    ...state.moveList.slice(0, state.historyIndex),
    { wxf, side: state.currentTurn },
  ]
  return { history, historyIndex: history.length - 1, moveList }
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
  boardFlipped: false,
  lastMove: null,
  aiHighlightPos: null,
  history: [initialFen],
  historyIndex: 0,
  moveList: [],

  selectPosition: (pos) => {
    const state = get()
    const {
      pieces,
      currentTurn,
      selectedPosition,
      legalMoves,
      confirmMoveEnabled,
      gameResult,
      opponentMode,
    } = state

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
      const result = applyMoveLogic(pieces, selectedPosition, pos, currentTurn)
      const record = recordMove(state, selectedPosition, pos, result)
      set({
        ...result,
        ...record,
        selectedPosition: null,
        legalMoves: [],
        pendingMove: null,
        lastMove: { from: selectedPosition, to: pos },
      })
      if (result.gameResult === 'ongoing' && isAiTurn(opponentMode, result.currentTurn)) {
        scheduleAiMove(opponentMode)
      }
      return
    }

    set({ selectedPosition: null, legalMoves: [], pendingMove: null })
  },

  confirmMove: () => {
    const state = get()
    const { pieces, currentTurn, pendingMove, opponentMode } = state
    if (!pendingMove) return
    const result = applyMoveLogic(pieces, pendingMove.from, pendingMove.to, currentTurn)
    const record = recordMove(state, pendingMove.from, pendingMove.to, result)
    set({
      ...result,
      ...record,
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
      lastMove: { from: pendingMove.from, to: pendingMove.to },
    })
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
      lastMove: null,
      aiHighlightPos: null,
      gameResult: 'ongoing',
      history: [initialFen],
      historyIndex: 0,
      moveList: [],
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    const fen = history[newIndex]!
    const { pieces, currentTurn } = fenToBoard(fen)
    set({
      pieces,
      currentTurn,
      historyIndex: newIndex,
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
      gameResult: 'ongoing',
    })
  },

  toggleBoardFlip: () => {
    set((s) => ({ boardFlipped: !s.boardFlipped }))
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    const fen = history[newIndex]!
    const { pieces, currentTurn } = fenToBoard(fen)
    const gameResult = getGameResult(pieces, currentTurn)
    set({
      pieces,
      currentTurn,
      historyIndex: newIndex,
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
      gameResult,
    })
  },
}))

// Import here to avoid circular issues at module level
import { fenToBoard } from '@/lib/fen'

function scheduleAiMove(mode: OpponentMode) {
  setTimeout(() => {
    const state = useGameStore.getState()
    const { pieces, currentTurn, gameResult } = state
    if (gameResult !== 'ongoing' || currentTurn !== 'black') return

    let aiMove
    if (mode === 'minimax') {
      aiMove = getMinimaxMove(pieces, 'black', 2)
    } else if (mode === 'medium') {
      // 40% mistake rate: plays like a café beginner
      aiMove =
        Math.random() < 0.4 ? getRandomBotMove(pieces, 'black') : getMinimaxMove(pieces, 'black', 2)
    } else {
      aiMove = getRandomBotMove(pieces, 'black')
    }
    if (!aiMove) return

    const result = applyMoveLogic(pieces, aiMove.from, aiMove.to, currentTurn)
    const record = recordMove(state, aiMove.from, aiMove.to, result)
    useGameStore.setState({
      ...result,
      ...record,
      selectedPosition: null,
      legalMoves: [],
      lastMove: { from: aiMove.from, to: aiMove.to },
      aiHighlightPos: aiMove.to,
      pendingMove: null,
    })
    // Clear the highlight ring after 1 second
    setTimeout(() => {
      useGameStore.setState({ aiHighlightPos: null })
    }, 1000)
  }, 500)
}
