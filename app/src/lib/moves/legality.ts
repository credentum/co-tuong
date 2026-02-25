import type { Piece, Position, Side } from '@/types/game'
import { posEq } from './helpers'
import { getLegalMoves as getPseudoLegalMoves } from './index'

/** Check if two generals face each other on an open file (flying generals rule) */
export function flyingGenerals(pieces: Piece[]): boolean {
  const redKing = pieces.find((p) => p.type === 'tuong' && p.side === 'red')
  const blackKing = pieces.find((p) => p.type === 'tuong' && p.side === 'black')
  if (!redKing || !blackKing) return false
  if (redKing.position.col !== blackKing.position.col) return false

  // Check if any piece is between them on the same column
  const col = redKing.position.col
  const minRow = Math.min(redKing.position.row, blackKing.position.row)
  const maxRow = Math.max(redKing.position.row, blackKing.position.row)

  for (const p of pieces) {
    if (p.type === 'tuong') continue
    if (p.position.col === col && p.position.row > minRow && p.position.row < maxRow) {
      return false // Piece between them, not flying
    }
  }

  return true // Nothing between them — flying generals violation
}

/** Check if the given side's general is under attack */
export function isInCheck(pieces: Piece[], side: Side): boolean {
  const king = pieces.find((p) => p.type === 'tuong' && p.side === side)
  if (!king) return true // King missing = in check (captured)

  const opponent = side === 'red' ? 'black' : 'red'

  // Check if any opponent piece can capture the king (pseudo-legal)
  for (const p of pieces) {
    if (p.side !== opponent) continue
    const moves = getPseudoLegalMoves(p, pieces)
    if (moves.some((m) => posEq(m, king.position))) return true
  }

  return false
}

/** Apply a move and return the resulting pieces array */
function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  const filtered = pieces.filter((p) => !posEq(p.position, to))
  return filtered.map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

/** Filter pseudo-legal moves to fully legal: no self-check, no flying generals */
export function getFullyLegalMoves(piece: Piece, pieces: Piece[]): Position[] {
  const pseudoMoves = getPseudoLegalMoves(piece, pieces)

  return pseudoMoves.filter((to) => {
    const newPieces = applyMove(pieces, piece.position, to)
    // Must not leave own king in check
    if (isInCheck(newPieces, piece.side)) return false
    // Must not create flying generals
    if (flyingGenerals(newPieces)) return false
    return true
  })
}

/** Check if the given side has any legal moves */
export function hasLegalMoves(pieces: Piece[], side: Side): boolean {
  for (const p of pieces) {
    if (p.side !== side) continue
    if (getFullyLegalMoves(p, pieces).length > 0) return true
  }
  return false
}

export type GameResult = 'ongoing' | 'red_wins' | 'black_wins'

/** Determine game result after a move has been made (check next player's status) */
export function getGameResult(pieces: Piece[], nextTurn: Side): GameResult {
  if (hasLegalMoves(pieces, nextTurn)) return 'ongoing'
  // No legal moves = loss for that side (stalemate = loss in Cờ tướng)
  return nextTurn === 'red' ? 'black_wins' : 'red_wins'
}
