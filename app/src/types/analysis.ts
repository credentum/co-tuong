import type { Position } from './game'

export interface EvalSnapshot {
  moveNumber: number
  fenBefore: string
  fenAfter: string
  evalBefore: number
  evalAfter: number
  evalDrop: number
  pieceType: string
  from: Position
  to: Position
}

export type MistakeCategory =
  | 'hung_piece'
  | 'missed_capture'
  | 'broke_pin'
  | 'early_horse_loss'
  | 'undefended_general'
  | 'cannon_screen_missed'
  | 'elephant_ignored'
  | 'missed_checkmate'
  | 'general_mistake'

export interface AnalyzedMistake {
  rank: number
  snapshot: EvalSnapshot
  category: MistakeCategory
  description: string
  highlightSquares: Position[]
}

export interface GameAnalysis {
  mistakes: AnalyzedMistake[]
  isCleanGame: boolean
  aiBlunders: number
}
