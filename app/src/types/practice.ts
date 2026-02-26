import type { Move, Piece, Position, Side } from './game'
import type { LeitnerBox } from './learning'

export type GoalConfig =
  | { type: 'escape_capture'; piecePos: Position }
  | { type: 'find_capture'; targetPos: Position }
  | { type: 'find_checkmate' }
  | { type: 'best_move_threshold'; threshold: number; depth?: number }
  | { type: 'avoid_blunder'; maxDrop: number; depth?: number }

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
  goal?: GoalConfig
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
