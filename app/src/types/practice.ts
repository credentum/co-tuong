import type { Move, Piece, Side } from './game'
import type { LeitnerBox } from './learning'

export interface SolutionStep {
  playerMove: Move
  alternativeMoves?: Move[]
  opponentResponse?: Move // absent on final step
}

export type PracticeDifficulty = 'easy' | 'medium' | 'hard'

export interface PracticePuzzleDef {
  puzzleId: string
  title: string
  difficulty: PracticeDifficulty
  prompt: string
  setup: { pieces: Piece[]; playerSide: Side }
  solution: SolutionStep[]
  concept: string
  hint?: string
}

export type PracticePhaseStatus =
  | 'awaiting_player_move'
  | 'opponent_responding'
  | 'puzzle_solved'
  | 'puzzle_failed'

export interface PracticeProgress {
  puzzleId: string
  box: LeitnerBox
  lastAttemptSession: number
  lastCorrect: boolean
}
