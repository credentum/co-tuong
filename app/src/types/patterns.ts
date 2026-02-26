import type { Move, Piece, Side } from './game'
import type { PracticePuzzleDef } from './practice'

export interface PatternAnnotation {
  text: string
}

export interface SeeItDef {
  startingPieces: Piece[]
  playerSide: Side
  moves: Move[] // 4-6 moves, auto-animated at 1.5s intervals
  annotations: PatternAnnotation[] // one per move
}

export type PatternLevel = 'survival' | 'attack'

export interface PatternCoachingLink {
  patternTrackerId: string
  trigger: string
}

export interface PatternDef {
  patternId: number // 1-20
  name: string
  vietnamese: string
  category: string
  concept: string // long explanation text
  level: PatternLevel
  seeIt: SeeItDef
  puzzleIds: string[] // 5 puzzle IDs (3 spot-it + 2 survive/deliver)
  coachingLink: PatternCoachingLink
}

export interface PatternCompletion {
  seeItDone: boolean
  puzzlesSolved: number // 0-5
}

/** Re-export — pattern puzzles use the same format as practice puzzles */
export type PatternPuzzleDef = PracticePuzzleDef
