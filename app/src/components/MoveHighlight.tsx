import type { Piece, Position } from '@/types/game'
import { boardToSVG } from '@/lib/coordinates'

interface MoveHighlightProps {
  moves: Position[]
  pieces: Piece[]
  flipped?: boolean
}

export function MoveHighlight({ moves, pieces, flipped }: MoveHighlightProps) {
  return (
    <>
      {moves.map((pos) => {
        const { x, y } = boardToSVG(pos.col, pos.row, flipped)
        const isCapture = pieces.some(
          (p) => p.position.col === pos.col && p.position.row === pos.row,
        )

        if (isCapture) {
          return (
            <circle
              key={`hl-${pos.col}-${pos.row}`}
              cx={x}
              cy={y}
              r={38}
              fill="none"
              stroke="#dc2626"
              strokeWidth={3}
              strokeDasharray="8 4"
              opacity={0.7}
            />
          )
        }

        return (
          <circle
            key={`hl-${pos.col}-${pos.row}`}
            cx={x}
            cy={y}
            r={14}
            fill="#16a34a"
            opacity={0.5}
          />
        )
      })}
    </>
  )
}
