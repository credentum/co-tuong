import type { Side, PieceType } from '@/types/game'
import { useGameStore } from '@/store/useGameStore'
import { INITIAL_POSITION } from '@/constants/initialPosition'
import { PIECE_CHARS } from '@/constants/board'

interface CapturedPiecesProps {
  /** Which side's captures to show (pieces this side has taken from the opponent) */
  capturedFrom: Side
}

const PIECE_ORDER: PieceType[] = ['xe', 'ma', 'phao', 'tuongVoi', 'si', 'tot']

export function CapturedPieces({ capturedFrom }: CapturedPiecesProps) {
  const pieces = useGameStore((s) => s.pieces)

  // Count how many of each type the opponent originally had
  const initialCounts: Partial<Record<PieceType, number>> = {}
  for (const p of INITIAL_POSITION) {
    if (p.side === capturedFrom) {
      initialCounts[p.type] = (initialCounts[p.type] ?? 0) + 1
    }
  }

  // Count how many remain on the board
  const currentCounts: Partial<Record<PieceType, number>> = {}
  for (const p of pieces) {
    if (p.side === capturedFrom) {
      currentCounts[p.type] = (currentCounts[p.type] ?? 0) + 1
    }
  }

  // Build list of captured piece characters
  const captured: string[] = []
  for (const type of PIECE_ORDER) {
    const initial = initialCounts[type] ?? 0
    const current = currentCounts[type] ?? 0
    const diff = initial - current
    const chars = PIECE_CHARS[type]
    const char = capturedFrom === 'red' ? chars?.red : chars?.black
    if (char && diff > 0) {
      for (let i = 0; i < diff; i++) {
        captured.push(char)
      }
    }
  }

  if (captured.length === 0) return null

  const textColor = capturedFrom === 'red' ? 'text-red-400' : 'text-stone-400'

  return (
    <div className={`flex items-center gap-0.5 px-2 text-sm ${textColor}`}>
      {captured.map((char, i) => (
        <span key={i}>{char}</span>
      ))}
    </div>
  )
}
