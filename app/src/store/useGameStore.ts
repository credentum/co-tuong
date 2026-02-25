import { create } from 'zustand'
import type { Piece, Position, Side } from '@/types/game'
import { INITIAL_POSITION } from '@/constants/initialPosition'
import { getLegalMoves } from '@/lib/moves'
import { posEq } from '@/lib/moves/helpers'

export interface Toast {
  id: string
  messageKey: string
}

interface GameStore {
  pieces: Piece[]
  currentTurn: Side
  selectedPosition: Position | null
  legalMoves: Position[]
  confirmMoveEnabled: boolean
  pendingMove: { from: Position; to: Position } | null
  toasts: Toast[]

  selectPosition: (pos: Position) => void
  confirmMove: () => void
  cancelMove: () => void
  toggleConfirmMove: () => void
  dismissToast: (id: string) => void
  resetGame: () => void
}

function executeMove(
  pieces: Piece[],
  from: Position,
  to: Position,
  currentTurn: Side,
): { pieces: Piece[]; currentTurn: Side } {
  // Remove captured piece at destination
  const filtered = pieces.filter((p) => !posEq(p.position, to))
  // Move the piece
  const updated = filtered.map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
  return {
    pieces: updated,
    currentTurn: currentTurn === 'red' ? 'black' : 'red',
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  pieces: INITIAL_POSITION,
  currentTurn: 'red',
  selectedPosition: null,
  legalMoves: [],
  confirmMoveEnabled: false,
  pendingMove: null,
  toasts: [],

  selectPosition: (pos) => {
    const { pieces, currentTurn, selectedPosition, legalMoves, confirmMoveEnabled } = get()
    const tappedPiece = pieces.find((p) => posEq(p.position, pos))

    // Case 1: Nothing selected, tap own piece → select it
    if (!selectedPosition) {
      if (tappedPiece && tappedPiece.side === currentTurn) {
        const moves = getLegalMoves(tappedPiece, pieces)
        set({ selectedPosition: pos, legalMoves: moves, pendingMove: null })
        return
      }
      if (tappedPiece && tappedPiece.side !== currentTurn) {
        // Silently ignore — no toast, just let them keep tapping
        return
      }
      // Tap empty square with nothing selected → ignore
      return
    }

    // Case 2: Already selected, tap same piece → deselect
    if (posEq(selectedPosition, pos)) {
      set({ selectedPosition: null, legalMoves: [], pendingMove: null })
      return
    }

    // Case 3: Already selected, tap different own piece → reselect
    if (tappedPiece && tappedPiece.side === currentTurn) {
      const moves = getLegalMoves(tappedPiece, pieces)
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
      const result = executeMove(pieces, selectedPosition, pos, currentTurn)
      set({
        pieces: result.pieces,
        currentTurn: result.currentTurn,
        selectedPosition: null,
        legalMoves: [],
        pendingMove: null,
      })
      return
    }

    // Case 5: Already selected, tap illegal destination → just deselect
    set({
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
    })
  },

  confirmMove: () => {
    const { pieces, currentTurn, pendingMove } = get()
    if (!pendingMove) return
    const result = executeMove(pieces, pendingMove.from, pendingMove.to, currentTurn)
    set({
      pieces: result.pieces,
      currentTurn: result.currentTurn,
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
    })
  },

  cancelMove: () => {
    set({ pendingMove: null, selectedPosition: null, legalMoves: [] })
  },

  toggleConfirmMove: () => {
    set((s) => ({ confirmMoveEnabled: !s.confirmMoveEnabled, pendingMove: null }))
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },

  resetGame: () => {
    set({
      pieces: INITIAL_POSITION,
      currentTurn: 'red',
      selectedPosition: null,
      legalMoves: [],
      pendingMove: null,
      toasts: [],
    })
  },
}))
