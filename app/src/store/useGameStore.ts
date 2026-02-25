import { create } from 'zustand'
import type { Piece, Position } from '@/types/game'
import { INITIAL_POSITION } from '@/constants/initialPosition'

interface GameStore {
  pieces: Piece[]
  selectedPosition: Position | null
  selectPosition: (pos: Position | null) => void
}

export const useGameStore = create<GameStore>((set) => ({
  pieces: INITIAL_POSITION,
  selectedPosition: null,
  selectPosition: (pos) => set({ selectedPosition: pos }),
}))
