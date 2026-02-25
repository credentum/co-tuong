import { useLearningStore } from '@/store/useLearningStore'
import { BoardRenderer } from '../BoardRenderer'

export function PuzzleBoard() {
  const pieces = useLearningStore((s) => s.pieces)
  const selectedPosition = useLearningStore((s) => s.selectedPosition)
  const legalMoves = useLearningStore((s) => s.legalMoves)
  const highlightSquares = useLearningStore((s) => s.highlightSquares)
  const highlightStyle = useLearningStore((s) => s.highlightStyle)
  const tappedPositions = useLearningStore((s) => s.tappedPositions)
  const selectPosition = useLearningStore((s) => s.selectPosition)
  const tapPosition = useLearningStore((s) => s.tapPosition)
  const puzzle = useLearningStore((s) => s.getCurrentPuzzle())
  const displayMode = useLearningStore((s) => s.displayMode)

  const handleTap = (pos: { col: number; row: number }) => {
    if (!puzzle) return
    if (puzzle.type === 'tap_all_targets') {
      tapPosition(pos)
    } else {
      selectPosition(pos)
    }
  }

  // Only show tapped positions for tap_all_targets puzzles
  const taps = puzzle?.type === 'tap_all_targets' ? tappedPositions : []
  const allHighlights = [...taps, ...highlightSquares]

  return (
    <BoardRenderer
      pieces={pieces}
      selectedPosition={selectedPosition}
      legalMoves={legalMoves}
      highlightSquares={allHighlights.length > 0 ? allHighlights : undefined}
      highlightStyle={highlightSquares.length > 0 ? highlightStyle : 'target'}
      onTapSquare={handleTap}
      labelMode={displayMode}
    />
  )
}
