import type { Piece, Side } from '@/types/game'
import type { PracticePuzzleDef, SolutionStep } from '@/types/practice'
import type { SavedLoss } from '@/types/loss'
import type { EvalSnapshot } from '@/types/analysis'
import { fenToBoard } from './fen'
import { getMinimaxMove } from './ai'
import { getGameResult } from './moves/legality'
import { posEq } from './moves/helpers'

function applyMove(
  pieces: Piece[],
  from: { col: number; row: number },
  to: { col: number; row: number },
): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

/**
 * Convert a saved loss into a practice puzzle.
 *
 * Uses minimax to compute the best move for the player (red) side,
 * then the best opponent response, creating a 1-2 step solution.
 *
 * Returns null if the position has no meaningful puzzle (no legal moves, already over, etc.)
 */
export function lossToPuzzle(loss: SavedLoss): PracticePuzzleDef | null {
  const { pieces, currentTurn } = fenToBoard(loss.fen)
  const playerSide: Side = 'red'

  // Position must be playable and it must be the player's turn
  if (getGameResult(pieces, currentTurn) !== 'ongoing') return null
  if (currentTurn !== playerSide) return null

  // Find the best move for the player
  const bestMove = getMinimaxMove(pieces, playerSide, 2)
  if (!bestMove) return null

  const afterPlayer = applyMove(pieces, bestMove.from, bestMove.to)
  const oppSide: Side = 'black'
  const resultAfterPlayer = getGameResult(afterPlayer, oppSide)

  const steps: SolutionStep[] = []

  if (resultAfterPlayer !== 'ongoing') {
    // Player's move ends the game (checkmate) — single-step puzzle
    steps.push({ playerMove: { from: bestMove.from, to: bestMove.to } })
  } else {
    // Compute opponent's best response
    const oppMove = getMinimaxMove(afterPlayer, oppSide, 2)
    if (!oppMove) {
      // Opponent has no moves (stalemate = loss in Co Tuong) — single step
      steps.push({ playerMove: { from: bestMove.from, to: bestMove.to } })
    } else {
      const afterOpp = applyMove(afterPlayer, oppMove.from, oppMove.to)
      const resultAfterOpp = getGameResult(afterOpp, playerSide)

      // Find best follow-up for player
      const followUp = resultAfterOpp === 'ongoing' ? getMinimaxMove(afterOpp, playerSide, 2) : null

      if (followUp) {
        // Two-step puzzle: player → opponent → player
        steps.push({
          playerMove: { from: bestMove.from, to: bestMove.to },
          opponentResponse: { from: oppMove.from, to: oppMove.to },
        })
        steps.push({
          playerMove: { from: followUp.from, to: followUp.to },
        })
      } else {
        // Single-step puzzle (no good follow-up)
        steps.push({ playerMove: { from: bestMove.from, to: bestMove.to } })
      }
    }
  }

  // Determine concept from the position
  const concept = detectConcept(pieces, bestMove, oppSide, resultAfterPlayer)

  // Determine difficulty from loss AI difficulty
  const difficulty =
    loss.aiDifficulty === 'minimax' ? 'hard' : loss.aiDifficulty === 'medium' ? 'medium' : 'easy'

  const puzzleId = `LOSS_${loss.id}`

  // Use eval context for enriched prompts/hints when available
  const evalPrompt = loss.turningPointDrop != null ? evalBasedPrompt(loss.turningPointDrop) : null
  const evalHint = loss.evalHistory ? evalBasedHint(loss.evalHistory, loss.fen) : null

  return {
    puzzleId,
    title: 'From Your Game',
    difficulty,
    prompt: evalPrompt ?? conceptPrompt(concept),
    setup: { pieces, playerSide },
    solution: steps,
    concept,
    hint: evalHint ?? conceptHint(concept),
  }
}

function detectConcept(
  pieces: Piece[],
  bestMove: { from: { col: number; row: number }; to: { col: number; row: number } },
  oppSide: Side,
  resultAfterPlayer: string,
): string {
  // Check if the best move delivers checkmate
  if (resultAfterPlayer === 'red_wins') return 'checkmate_in_1'

  // Check if the best move captures a piece
  const captured = pieces.find((p) => posEq(p.position, bestMove.to) && p.side === oppSide)
  if (captured) return 'tactical_capture'

  return 'positional_improvement'
}

function conceptPrompt(concept: string): string {
  switch (concept) {
    case 'checkmate_in_1':
      return 'Find the checkmate!'
    case 'tactical_capture':
      return 'Find the best capture.'
    default:
      return 'Find the best move.'
  }
}

function conceptHint(concept: string): string {
  switch (concept) {
    case 'checkmate_in_1':
      return 'Look for a move that traps the opponent General.'
    case 'tactical_capture':
      return 'Look for an undefended enemy piece you can take.'
    default:
      return 'Improve your piece positioning or create a threat.'
  }
}

const pieceNames: Record<string, string> = {
  tuong: 'General',
  si: 'Advisor',
  tinh: 'Elephant',
  ma: 'Horse',
  xe: 'Chariot',
  phao: 'Cannon',
  tot: 'Soldier',
}

function evalBasedPrompt(drop: number): string {
  if (drop >= 50) return 'You lost a major piece here. Find the safe move.'
  if (drop >= 30) return 'This move cost material. Find the better option.'
  return 'A small inaccuracy. Can you spot the improvement?'
}

function evalBasedHint(evalHistory: EvalSnapshot[], fen: string): string | null {
  const snapshot = evalHistory.find((s) => s.fenBefore === fen)
  if (!snapshot) return null
  const name = pieceNames[snapshot.pieceType] ?? snapshot.pieceType
  return `Your ${name} was left vulnerable after this move.`
}
