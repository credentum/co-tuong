import { useGameStore } from '@/store/useGameStore'
import { useLearningStore } from '@/store/useLearningStore'
import { BoardRenderer } from './BoardRenderer'

interface BoardSVGProps {
  onPieceInfo?: (type: string) => void
}

export function BoardSVG({ onPieceInfo }: BoardSVGProps) {
  const pieces = useGameStore((s) => s.pieces)
  const selectedPosition = useGameStore((s) => s.selectedPosition)
  const legalMoves = useGameStore((s) => s.legalMoves)
  const selectPosition = useGameStore((s) => s.selectPosition)
  const flipped = useGameStore((s) => s.boardFlipped)
  const displayMode = useLearningStore((s) => s.displayMode)

  return (
    <BoardRenderer
      pieces={pieces}
      selectedPosition={selectedPosition}
      legalMoves={legalMoves}
      onTapSquare={selectPosition}
      onLongPressPiece={onPieceInfo}
      flipped={flipped}
      labelMode={displayMode}
    />
  )
}
