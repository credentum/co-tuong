import { BoardSVG } from './BoardSVG'

interface BoardProps {
  onPieceInfo?: (type: string) => void
}

export function Board({ onPieceInfo }: BoardProps) {
  return (
    <div className="flex w-full max-w-md flex-1 items-center justify-center p-2">
      <BoardSVG onPieceInfo={onPieceInfo} />
    </div>
  )
}
