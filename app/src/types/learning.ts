import type { Piece, PieceType, Position, Side, Move } from './game'

export type LessonId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type LessonPhase = 'see_it' | 'try_it' | 'test_it' | 'use_it'

export type PuzzleType =
  | 'tap_all_targets'
  | 'find_the_move'
  | 'find_best_move'
  | 'true_false_series'

export interface PieceSetup {
  pieces: Piece[]
  playerSide: Side
}

export interface PuzzleAnswer {
  type: PuzzleType
  positions?: Position[] // tap_all_targets
  moves?: Move[] // find_the_move, find_best_move (any is correct)
  booleans?: boolean[] // true_false_series
}

export interface PuzzleDef {
  puzzleId: string
  title: string
  type: PuzzleType
  prompt: string
  setup: PieceSetup
  answer: PuzzleAnswer
  teaches?: string
  /** For true_false_series: positions to highlight one at a time */
  highlightPositions?: Position[]
  /** For true_false_series: explanation shown after wrong answer for each position */
  tfExplanations?: string[]
}

export interface SeeItContent {
  characterDisplay: string[]
  name: string
  pronunciationHint: string
  realWorldTip: string
  culturalNote: string
}

export interface LessonDef {
  lessonId: LessonId
  title: string
  pieceFocus: PieceType[]
  cafeContext: string
  seeIt: SeeItContent
  puzzleIds: string[]
  reviewPuzzleIds: string[]
  lessonSummary: string
}

export type LeitnerBox = 1 | 2 | 3 | 4

export interface PuzzleProgress {
  puzzleId: string
  box: LeitnerBox
  lastAttemptSession: number
  lastCorrect: boolean
}

export interface LessonProgress {
  lessonId: LessonId
  seeItComplete: boolean
  tryItComplete: boolean
  testItComplete: boolean
  useItComplete: boolean
}
