import type { Side } from './game'
import type { OpponentMode } from '@/store/useGameStore'

export interface SavedLoss {
  id: string
  fen: string
  turn: Side
  gameResult: 'red_wins' | 'black_wins'
  aiDifficulty: OpponentMode
  timestamp: number
  reviewed: boolean
  convertedToPuzzle: boolean
  playerNotes: string | null
}
