import type { Piece, Position, Side } from '@/types/game'
import type { GoalConfig } from '@/types/practice'
import { getFullyLegalMoves, getGameResult } from './moves/legality'
import { posEq } from './moves/helpers'
import { evaluateAtDepth, getMinimaxMove } from './ai'

export interface GoalResult {
  valid: boolean
  engineResponse?: { from: Position; to: Position }
}

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

export function validateGoal(
  pieces: Piece[],
  from: Position,
  to: Position,
  playerSide: Side,
  goal: GoalConfig,
  remainingSteps: number,
): GoalResult {
  switch (goal.type) {
    case 'escape_capture':
      return validateEscapeCapture(pieces, from, to, goal.piecePos, playerSide)
    case 'find_capture':
      return validateFindCapture(to, goal.targetPos)
    case 'find_checkmate':
      return validateFindCheckmate(pieces, from, to, playerSide, remainingSteps)
    case 'best_move_threshold':
      return validateBestMoveThreshold(pieces, from, to, playerSide, goal.threshold, goal.depth)
    case 'avoid_blunder':
      return validateAvoidBlunder(pieces, from, to, playerSide, goal.maxDrop, goal.depth)
  }
}

function validateEscapeCapture(
  pieces: Piece[],
  from: Position,
  to: Position,
  piecePos: Position,
  playerSide: Side,
): GoalResult {
  const oppSide: Side = playerSide === 'red' ? 'black' : 'red'
  const afterMove = applyMove(pieces, from, to)

  // The target piece is now at 'to' if it was the piece that moved, else still at piecePos
  const targetNewPos = posEq(piecePos, from) ? to : piecePos

  // Check no opponent piece can capture the target
  const canCapture = afterMove
    .filter((p) => p.side === oppSide)
    .some((p) => getFullyLegalMoves(p, afterMove).some((m) => posEq(m, targetNewPos)))

  return { valid: !canCapture }
}

function validateFindCapture(to: Position, targetPos: Position): GoalResult {
  return { valid: posEq(to, targetPos) }
}

function validateFindCheckmate(
  pieces: Piece[],
  from: Position,
  to: Position,
  playerSide: Side,
  remainingSteps: number,
): GoalResult {
  const oppSide: Side = playerSide === 'red' ? 'black' : 'red'
  const wins = playerSide === 'red' ? 'red_wins' : 'black_wins'
  const afterMove = applyMove(pieces, from, to)

  if (remainingSteps === 0) {
    return { valid: getGameResult(afterMove, oppSide) === wins }
  }

  const depth = remainingSteps * 2
  const score = evaluateAtDepth(afterMove, oppSide, depth)
  if (score < 9000) return { valid: false }

  const oppBest = getMinimaxMove(afterMove, oppSide, depth)
  return { valid: true, engineResponse: oppBest ?? undefined }
}

function validateBestMoveThreshold(
  pieces: Piece[],
  from: Position,
  to: Position,
  playerSide: Side,
  threshold: number,
  depth: number = 2,
): GoalResult {
  const oppSide: Side = playerSide === 'red' ? 'black' : 'red'

  // Evaluate player's chosen move
  const afterPlayer = applyMove(pieces, from, to)
  const playerScore = evaluateAtDepth(afterPlayer, oppSide, depth - 1)

  // Evaluate engine's best move
  const bestMove = getMinimaxMove(pieces, playerSide, depth)
  if (!bestMove) return { valid: false }
  const afterBest = applyMove(pieces, bestMove.from, bestMove.to)
  const bestScore = evaluateAtDepth(afterBest, oppSide, depth - 1)

  // Compare from player's perspective (Red positive, Black negative)
  const sign = playerSide === 'red' ? 1 : -1
  const diff = (bestScore - playerScore) * sign

  return { valid: diff <= threshold }
}

function validateAvoidBlunder(
  pieces: Piece[],
  from: Position,
  to: Position,
  playerSide: Side,
  maxDrop: number,
  depth: number = 2,
): GoalResult {
  const oppSide: Side = playerSide === 'red' ? 'black' : 'red'

  const beforeScore = evaluateAtDepth(pieces, playerSide, depth)
  const afterMove = applyMove(pieces, from, to)
  const afterScore = evaluateAtDepth(afterMove, oppSide, depth - 1)

  const sign = playerSide === 'red' ? 1 : -1
  const drop = (beforeScore - afterScore) * sign

  return { valid: drop <= maxDrop }
}
