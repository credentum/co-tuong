import { usePracticeStore } from '@/store/usePracticeStore'
import { useLearningStore } from '@/store/useLearningStore'
import { BoardRenderer } from '../BoardRenderer'

export function PracticePuzzleBoard() {
  const pieces = usePracticeStore((s) => s.pieces)
  const selectedPosition = usePracticeStore((s) => s.selectedPosition)
  const legalMoves = usePracticeStore((s) => s.legalMoves)
  const highlightSquares = usePracticeStore((s) => s.highlightSquares)
  const highlightStyle = usePracticeStore((s) => s.highlightStyle)
  const lastMove = usePracticeStore((s) => s.lastMoveHighlight)
  const selectPosition = usePracticeStore((s) => s.selectPosition)
  const displayMode = useLearningStore((s) => s.displayMode)

  return (
    <BoardRenderer
      pieces={pieces}
      selectedPosition={selectedPosition}
      legalMoves={legalMoves}
      lastMove={lastMove}
      highlightSquares={highlightSquares}
      highlightStyle={highlightStyle}
      onTapSquare={selectPosition}
      labelMode={displayMode}
    />
  )
}
