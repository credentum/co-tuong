import type { Position } from '@/types/game'
import type { EvalSnapshot, AnalyzedMistake, GameAnalysis, MistakeCategory } from '@/types/analysis'
import { fenToBoard } from './fen'
import { getFullyLegalMoves, isInCheck } from './moves/legality'
import { posEq } from './moves/helpers'

const MISTAKE_THRESHOLD = 15
const MAX_MISTAKES = 3

const PIECE_NAMES: Record<string, string> = {
  tuong: 'General',
  si: 'Advisor',
  tuongVoi: 'Elephant',
  xe: 'Chariot',
  phao: 'Cannon',
  ma: 'Horse',
  tot: 'Soldier',
}

export function analyzeGame(snapshots: EvalSnapshot[], aiBlunders: number = 0): GameAnalysis {
  if (snapshots.length === 0) return { mistakes: [], isCleanGame: true, aiBlunders }

  const significant = snapshots
    .filter((s) => s.evalDrop >= MISTAKE_THRESHOLD)
    .sort((a, b) => b.evalDrop - a.evalDrop)
    .slice(0, MAX_MISTAKES)

  if (significant.length === 0) return { mistakes: [], isCleanGame: true, aiBlunders }

  const mistakes: AnalyzedMistake[] = significant.map((snapshot, i) => {
    const classified = classifyMistake(snapshot)
    return { rank: i + 1, snapshot, ...classified }
  })

  return { mistakes, isCleanGame: false, aiBlunders }
}

interface Classification {
  category: MistakeCategory
  description: string
  highlightSquares: Position[]
}

function classifyMistake(snapshot: EvalSnapshot): Classification {
  const { pieces: beforePieces } = fenToBoard(snapshot.fenBefore)
  const { pieces: afterPieces } = fenToBoard(snapshot.fenAfter)

  const movedPiece = afterPieces.find((p) => posEq(p.position, snapshot.to) && p.side === 'red')

  // 1. hung_piece — moved piece to attacked + undefended square
  if (movedPiece) {
    const isAttacked = afterPieces
      .filter((p) => p.side === 'black')
      .some((p) => getFullyLegalMoves(p, afterPieces).some((m) => posEq(m, snapshot.to)))
    const isDefended = afterPieces
      .filter((p) => p.side === 'red' && !posEq(p.position, snapshot.to))
      .some((p) => getFullyLegalMoves(p, afterPieces).some((m) => posEq(m, snapshot.to)))

    if (isAttacked && !isDefended) {
      const name = PIECE_NAMES[movedPiece.type] ?? movedPiece.type
      return {
        category: 'hung_piece',
        description: `You left your ${name} unprotected. The opponent can capture it for free.`,
        highlightSquares: [snapshot.to],
      }
    }
  }

  // 2. missed_capture — free enemy piece we didn't take
  const freeEnemy = beforePieces
    .filter((p) => p.side === 'black' && p.type !== 'tuong')
    .find((enemy) => {
      const attackers = beforePieces
        .filter((a) => a.side === 'red')
        .some((a) => getFullyLegalMoves(a, beforePieces).some((m) => posEq(m, enemy.position)))
      if (!attackers) return false
      const defended = beforePieces
        .filter((d) => d.side === 'black' && !posEq(d.position, enemy.position))
        .some((d) => getFullyLegalMoves(d, beforePieces).some((m) => posEq(m, enemy.position)))
      return !defended
    })

  if (freeEnemy) {
    const name = PIECE_NAMES[freeEnemy.type] ?? freeEnemy.type
    return {
      category: 'missed_capture',
      description: `You missed a free capture — the enemy ${name} was unprotected.`,
      highlightSquares: [freeEnemy.position],
    }
  }

  // 3. broke_pin — moved piece between generals on same file
  const redKing = beforePieces.find((p) => p.type === 'tuong' && p.side === 'red')
  const blackKing = beforePieces.find((p) => p.type === 'tuong' && p.side === 'black')
  if (redKing && blackKing && redKing.position.col === blackKing.position.col) {
    const col = redKing.position.col
    const minRow = Math.min(redKing.position.row, blackKing.position.row)
    const maxRow = Math.max(redKing.position.row, blackKing.position.row)
    if (snapshot.from.col === col && snapshot.from.row > minRow && snapshot.from.row < maxRow) {
      return {
        category: 'broke_pin',
        description:
          'You moved a piece off the file between the Generals, exposing your General to the Flying General rule.',
        highlightSquares: [redKing.position, blackKing.position],
      }
    }
  }

  // 4. early_horse_loss — horse in danger in opening
  if (snapshot.moveNumber <= 6 && snapshot.pieceType === 'ma') {
    const isAttacked = afterPieces
      .filter((p) => p.side === 'black')
      .some((p) => getFullyLegalMoves(p, afterPieces).some((m) => posEq(m, snapshot.to)))
    if (isAttacked) {
      return {
        category: 'early_horse_loss',
        description:
          'Your Horse is in danger early. Develop your Elephants first to block Cannon attacks.',
        highlightSquares: [snapshot.to],
      }
    }
  }

  // 5. undefended_general — in check with no advisors
  if (isInCheck(afterPieces, 'red')) {
    const advisors = afterPieces.filter((p) => p.side === 'red' && p.type === 'si')
    if (advisors.length === 0) {
      const king = afterPieces.find((p) => p.type === 'tuong' && p.side === 'red')
      return {
        category: 'undefended_general',
        description:
          'Your General is exposed with no Advisors. Keep at least one Advisor in the palace.',
        highlightSquares: king ? [king.position] : [],
      }
    }
  }

  // 6. elephant_ignored — lost an elephant
  const elephantsBefore = beforePieces.filter(
    (p) => p.type === 'tuongVoi' && p.side === 'red',
  ).length
  const elephantsAfter = afterPieces.filter((p) => p.type === 'tuongVoi' && p.side === 'red').length
  if (elephantsAfter < elephantsBefore) {
    return {
      category: 'elephant_ignored',
      description: 'Your Elephant was lost. Elephants protect diagonal paths to your General.',
      highlightSquares: [snapshot.from],
    }
  }

  // 7. cannon_screen_missed — created a screen for enemy cannon
  const redKingAfter = afterPieces.find((p) => p.type === 'tuong' && p.side === 'red')
  if (redKingAfter && movedPiece) {
    const enemyCannons = afterPieces.filter((p) => p.type === 'phao' && p.side === 'black')
    for (const cannon of enemyCannons) {
      const sameFile = cannon.position.col === redKingAfter.position.col
      const sameRank = cannon.position.row === redKingAfter.position.row
      if (sameFile || sameRank) {
        const isScreen = sameFile
          ? movedPiece.position.col === redKingAfter.position.col &&
            isBetween(movedPiece.position.row, cannon.position.row, redKingAfter.position.row)
          : movedPiece.position.row === redKingAfter.position.row &&
            isBetween(movedPiece.position.col, cannon.position.col, redKingAfter.position.col)
        if (isScreen) {
          return {
            category: 'cannon_screen_missed',
            description:
              'You created a screen for the enemy Cannon, allowing it to attack your General.',
            highlightSquares: [cannon.position, movedPiece.position],
          }
        }
      }
    }
  }

  // 8. general_mistake — fallback
  return {
    category: 'general_mistake',
    description: 'This move weakened your position. Tap Replay to try a different approach.',
    highlightSquares: movedPiece ? [snapshot.to] : [],
  }
}

function isBetween(val: number, a: number, b: number): boolean {
  return val > Math.min(a, b) && val < Math.max(a, b)
}
