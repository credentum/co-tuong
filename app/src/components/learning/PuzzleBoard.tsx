import { useLearningStore } from '@/store/useLearningStore'
import { BoardRenderer } from '../BoardRenderer'

export function PuzzleBoard() {
  const pieces = useLearningStore((s) => s.pieces)
  const selectedPosition = useLearningStore((s) => s.selectedPosition)
  const legalMoves = useLearningStore((s) => s.legalMoves)
  const highlightSquares = useLearningStore((s) => s.highlightSquares)
  const highlightStyle = useLearningStore((s) => s.highlightStyle)
  const highlightPerSquareStyles = useLearningStore((s) => s.highlightPerSquareStyles)
  const tappedPositions = useLearningStore((s) => s.tappedPositions)
  const puzzleFeedback = useLearningStore((s) => s.puzzleFeedback)
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

  // Show tapped positions only while still answering — once feedback is shown,
  // highlightSquares takes over (avoids duplicate keys that break React reconciliation)
  const taps =
    puzzle?.type === 'tap_all_targets' && puzzleFeedback === 'none' ? tappedPositions : []
  const allHighlights = [...taps, ...highlightSquares]

  return (
    <BoardRenderer
      pieces={pieces}
      selectedPosition={selectedPosition}
      legalMoves={legalMoves}
      highlightSquares={allHighlights.length > 0 ? allHighlights : undefined}
      highlightStyle={highlightSquares.length > 0 ? highlightStyle : 'target'}
      highlightPerSquareStyles={
        highlightPerSquareStyles.length > 0 ? highlightPerSquareStyles : undefined
      }
      onTapSquare={handleTap}
      labelMode={displayMode}
    />
  )
}
