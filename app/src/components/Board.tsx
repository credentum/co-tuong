import { BoardSVG } from './BoardSVG'
import { ConfirmMoveBar } from './ConfirmMoveBar'

interface BoardProps {
  onPieceInfo?: (type: string) => void
}

export function Board({ onPieceInfo }: BoardProps) {
  return (
    <div className="relative flex w-full max-w-lg flex-1 items-center justify-center px-1">
      <BoardSVG onPieceInfo={onPieceInfo} />
      <ConfirmMoveBar />
    </div>
  )
}
