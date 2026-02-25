import type { Piece, Position, Side } from '@/types/game'
import { getFullyLegalMoves } from './moves/legality'

export interface BotMove {
  from: Position
  to: Position
}

/** Random bot: picks a random piece with legal moves, then a random legal move */
export function getRandomBotMove(pieces: Piece[], side: Side): BotMove | null {
  // Collect all pieces with legal moves
  const candidates: { piece: Piece; moves: Position[] }[] = []

  for (const p of pieces) {
    if (p.side !== side) continue
    const moves = getFullyLegalMoves(p, pieces)
    if (moves.length > 0) {
      candidates.push({ piece: p, moves })
    }
  }

  if (candidates.length === 0) return null

  const chosen = candidates[Math.floor(Math.random() * candidates.length)]!
  const move = chosen.moves[Math.floor(Math.random() * chosen.moves.length)]!

  return { from: chosen.piece.position, to: move }
}
