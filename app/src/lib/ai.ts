import type { Piece, Position, Side } from '@/types/game'
import { getFullyLegalMoves, isInCheck } from './moves/legality'
import { posEq } from './moves/helpers'
import { boardToFen } from './fen'

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
export function evaluate(pieces: Piece[]): number {
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

/**
 * Weaker evaluation for medium difficulty.
 * Plays consistent, legal-looking moves but with slightly off priorities:
 * - Undervalues tactical pieces (Cannon, Horse worth less relative to defensive pieces)
 * - No check awareness (doesn't see threats coming)
 * - Ignores soldier river crossing bonus (develops slowly)
 */
const MEDIUM_PIECE_VALUES: Record<string, number> = {
  tuong: 10000,
  xe: 90,
  phao: 35, // undervalues Cannon (45 → 35)
  ma: 30, // undervalues Horse (40 → 30)
  si: 25, // overvalues Advisors (20 → 25)
  tuongVoi: 25, // overvalues Elephants (20 → 25)
  tot: 10,
}

function evaluateMedium(pieces: Piece[]): number {
  let score = 0
  for (const p of pieces) {
    score += p.side === 'red' ? MEDIUM_PIECE_VALUES[p.type]! : -MEDIUM_PIECE_VALUES[p.type]!
  }
  // No check penalty — the medium AI doesn't "see" threats
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
  evalFn: (pieces: Piece[]) => number = evaluate,
): number {
  if (depth === 0) return evalFn(pieces)

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
        const evalScore = minimax(newPieces, depth - 1, alpha, beta, false, nextSide, evalFn)
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
        const evalScore = minimax(newPieces, depth - 1, alpha, beta, true, nextSide, evalFn)
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

/**
 * Evaluate a position at a given depth using minimax.
 * Returns score from Red's perspective (positive = Red advantage).
 * Score >= 9000 indicates forced checkmate for Red.
 */
export function evaluateAtDepth(pieces: Piece[], side: Side, depth: number): number {
  return minimax(pieces, depth, -Infinity, Infinity, side === 'red', side)
}

/** Minimax AI: picks the best move at given depth. Black minimizes, Red maximizes. */
export function getMinimaxMove(
  pieces: Piece[],
  side: Side,
  depth: number = 2,
  forbiddenFens?: Set<string>,
): AiMove | null {
  return searchBestMove(pieces, side, depth, evaluate, forbiddenFens)
}

/**
 * Medium AI: depth-2 minimax with a weaker evaluation function.
 * Plays consistent, real-looking moves but undervalues tactics and ignores threats.
 */
export function getMediumMove(
  pieces: Piece[],
  side: Side,
  forbiddenFens?: Set<string>,
): AiMove | null {
  return searchBestMove(pieces, side, 2, evaluateMedium, forbiddenFens)
}

function searchBestMove(
  pieces: Piece[],
  side: Side,
  depth: number,
  evalFn: (pieces: Piece[]) => number,
  forbiddenFens?: Set<string>,
): AiMove | null {
  const ownPieces = pieces.filter((p) => p.side === side)
  const maximizing = side === 'red'
  const candidates: ScoredMove[] = []

  for (const p of ownPieces) {
    const moves = getFullyLegalMoves(p, pieces)
    for (const to of moves) {
      const newPieces = applyMove(pieces, p.position, to)
      const nextSide: Side = side === 'red' ? 'black' : 'red'
      const score = minimax(
        newPieces,
        depth - 1,
        -Infinity,
        Infinity,
        !maximizing,
        nextSide,
        evalFn,
      )
      candidates.push({ from: p.position, to, score })
    }
  }

  if (candidates.length === 0) return null

  // Sort: maximizing side wants highest score, minimizing wants lowest
  candidates.sort((a, b) => (maximizing ? b.score - a.score : a.score - b.score))

  // Filter out moves that would create a 3-fold repeated position
  if (forbiddenFens && forbiddenFens.size > 0) {
    const nonRepeating = candidates.filter((m) => {
      const resultPieces = applyMove(pieces, m.from, m.to)
      const nextSide: Side = side === 'red' ? 'black' : 'red'
      const fen = boardToFen(resultPieces, nextSide)
      return !forbiddenFens.has(fen)
    })
    if (nonRepeating.length > 0) {
      const bestScore = nonRepeating[0]!.score
      const bestMoves = nonRepeating.filter((m) => m.score === bestScore)
      const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)]!
      return { from: chosen.from, to: chosen.to }
    }
    // All moves repeat — fall through to pick the best anyway (avoid stalemate)
  }

  // Pick randomly among moves tied for the best score (adds variety)
  const bestScore = candidates[0]!.score
  const bestMoves = candidates.filter((m) => m.score === bestScore)
  const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)]!

  return { from: chosen.from, to: chosen.to }
}
