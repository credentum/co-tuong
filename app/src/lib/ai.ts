import type { Piece, Position, Side } from '@/types/game'
import { getFullyLegalMoves, isInCheck } from './moves/legality'
import { posEq } from './moves/helpers'

/** Material values tuned for Cờ tướng piece hierarchy */
const PIECE_VALUES: Record<string, number> = {
  tuong: 10000,
  xe: 90,
  phao: 45,
  ma: 40,
  si: 20,
  tuongVoi: 20,
  tot: 10,
}

/** Positional bonus for soldiers that crossed the river (more valuable) */
function soldierBonus(piece: Piece): number {
  if (piece.type !== 'tot') return 0
  const crossed = piece.side === 'red' ? piece.position.row >= 5 : piece.position.row < 5
  return crossed ? 5 : 0
}

/** Evaluate board from Red's perspective (positive = Red advantage) */
function evaluate(pieces: Piece[]): number {
  let score = 0
  for (const p of pieces) {
    const value = PIECE_VALUES[p.type]! + soldierBonus(p)
    score += p.side === 'red' ? value : -value
  }

  // Check bonus: being in check is bad
  if (isInCheck(pieces, 'red')) score -= 30
  if (isInCheck(pieces, 'black')) score += 30

  return score
}

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  const filtered = pieces.filter((p) => !posEq(p.position, to))
  return filtered.map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

interface ScoredMove {
  from: Position
  to: Position
  score: number
}

function minimax(
  pieces: Piece[],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  side: Side,
): number {
  if (depth === 0) return evaluate(pieces)

  const ownPieces = pieces.filter((p) => p.side === side)
  let hasLegalMove = false

  if (maximizing) {
    let maxEval = -Infinity
    for (const p of ownPieces) {
      const moves = getFullyLegalMoves(p, pieces)
      for (const to of moves) {
        hasLegalMove = true
        const newPieces = applyMove(pieces, p.position, to)
        const nextSide: Side = side === 'red' ? 'black' : 'red'
        const evalScore = minimax(newPieces, depth - 1, alpha, beta, false, nextSide)
        maxEval = Math.max(maxEval, evalScore)
        alpha = Math.max(alpha, evalScore)
        if (beta <= alpha) break
      }
      if (beta <= alpha) break
    }
    if (!hasLegalMove) {
      // No legal moves = loss for this side (stalemate = loss in Cờ tướng)
      return side === 'red' ? -9999 : 9999
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const p of ownPieces) {
      const moves = getFullyLegalMoves(p, pieces)
      for (const to of moves) {
        hasLegalMove = true
        const newPieces = applyMove(pieces, p.position, to)
        const nextSide: Side = side === 'red' ? 'black' : 'red'
        const evalScore = minimax(newPieces, depth - 1, alpha, beta, true, nextSide)
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
      if (beta <= alpha) break
    }
    if (!hasLegalMove) {
      return side === 'red' ? -9999 : 9999
    }
    return minEval
  }
}

export interface AiMove {
  from: Position
  to: Position
}

/** Minimax AI: picks the best move at given depth. Black minimizes, Red maximizes. */
export function getMinimaxMove(pieces: Piece[], side: Side, depth: number = 2): AiMove | null {
  const ownPieces = pieces.filter((p) => p.side === side)
  const maximizing = side === 'red'
  const candidates: ScoredMove[] = []

  for (const p of ownPieces) {
    const moves = getFullyLegalMoves(p, pieces)
    for (const to of moves) {
      const newPieces = applyMove(pieces, p.position, to)
      const nextSide: Side = side === 'red' ? 'black' : 'red'
      const score = minimax(newPieces, depth - 1, -Infinity, Infinity, !maximizing, nextSide)
      candidates.push({ from: p.position, to, score })
    }
  }

  if (candidates.length === 0) return null

  // Sort: maximizing side wants highest score, minimizing wants lowest
  candidates.sort((a, b) => (maximizing ? b.score - a.score : a.score - b.score))

  // Pick randomly among moves tied for the best score (adds variety)
  const bestScore = candidates[0]!.score
  const bestMoves = candidates.filter((m) => m.score === bestScore)
  const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)]!

  return { from: chosen.from, to: chosen.to }
}
