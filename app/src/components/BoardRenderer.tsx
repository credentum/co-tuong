import { useTranslation } from 'react-i18next'
import type { Piece as PieceT, Position } from '@/types/game'
import { BOARD_HEIGHT, BOARD_PADDING, BOARD_WIDTH, CELL_SIZE, COLS, ROWS } from '@/constants/board'
import { boardToSVG } from '@/lib/coordinates'
import { Piece } from './Piece'
import { MoveHighlight } from './MoveHighlight'
import { TapTarget } from './TapTarget'

export interface BoardRendererProps {
  pieces: PieceT[]
  selectedPosition: Position | null
  legalMoves: Position[]
  highlightSquares?: Position[]
  highlightStyle?: 'target' | 'correct' | 'incorrect'
  onTapSquare: (pos: Position) => void
  onLongPressPiece?: (type: string) => void
  flipped?: boolean
}

const HIGHLIGHT_COLORS = {
  target: '#3b82f6',
  correct: '#16a34a',
  incorrect: '#dc2626',
}

export function BoardRenderer({
  pieces,
  selectedPosition,
  legalMoves,
  highlightSquares,
  highlightStyle,
  onTapSquare,
  onLongPressPiece,
  flipped,
}: BoardRendererProps) {
  const { t } = useTranslation()

  const pieceAt = (col: number, row: number) =>
    pieces.find((p) => p.position.col === col && p.position.row === row)

  const gridLeft = BOARD_PADDING
  const gridRight = BOARD_PADDING + (COLS - 1) * CELL_SIZE
  const gridTop = BOARD_PADDING
  const gridBottom = BOARD_PADDING + (ROWS - 1) * CELL_SIZE

  const riverTop = boardToSVG(0, 5, flipped).y
  const riverBottom = boardToSVG(0, 4, flipped).y
  const riverMinY = Math.min(riverTop, riverBottom)
  const riverMaxY = Math.max(riverTop, riverBottom)

  return (
    <svg
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      role="grid"
      aria-label={t('board.title')}
      className="max-h-full max-w-full"
    >
      {/* Board background */}
      <rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#f5d799" rx={8} />

      {/* Horizontal lines */}
      {Array.from({ length: ROWS }, (_, i) => {
        const y = gridTop + i * CELL_SIZE
        return (
          <line
            key={`h-${i}`}
            x1={gridLeft}
            y1={y}
            x2={gridRight}
            y2={y}
            stroke="#5c3317"
            strokeWidth={1.5}
          />
        )
      })}

      {/* Vertical lines */}
      {Array.from({ length: COLS }, (_, i) => {
        const x = gridLeft + i * CELL_SIZE
        if (i === 0 || i === COLS - 1) {
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={gridTop}
              x2={x}
              y2={gridBottom}
              stroke="#5c3317"
              strokeWidth={1.5}
            />
          )
        }
        return (
          <g key={`v-${i}`}>
            <line x1={x} y1={gridTop} x2={x} y2={riverMinY} stroke="#5c3317" strokeWidth={1.5} />
            <line x1={x} y1={riverMaxY} x2={x} y2={gridBottom} stroke="#5c3317" strokeWidth={1.5} />
          </g>
        )
      })}

      {/* Palace diagonals — Red */}
      {(() => {
        const tl = boardToSVG(3, 2, flipped)
        const tr = boardToSVG(5, 2, flipped)
        const bl = boardToSVG(3, 0, flipped)
        const br = boardToSVG(5, 0, flipped)
        return (
          <g>
            <line x1={tl.x} y1={tl.y} x2={br.x} y2={br.y} stroke="#5c3317" strokeWidth={1.5} />
            <line x1={tr.x} y1={tr.y} x2={bl.x} y2={bl.y} stroke="#5c3317" strokeWidth={1.5} />
          </g>
        )
      })()}

      {/* Palace diagonals — Black */}
      {(() => {
        const tl = boardToSVG(3, 9, flipped)
        const tr = boardToSVG(5, 9, flipped)
        const bl = boardToSVG(3, 7, flipped)
        const br = boardToSVG(5, 7, flipped)
        return (
          <g>
            <line x1={tl.x} y1={tl.y} x2={br.x} y2={br.y} stroke="#5c3317" strokeWidth={1.5} />
            <line x1={tr.x} y1={tr.y} x2={bl.x} y2={bl.y} stroke="#5c3317" strokeWidth={1.5} />
          </g>
        )
      })()}

      {/* River text */}
      {(() => {
        const riverCenterY = (riverMinY + riverMaxY) / 2
        return (
          <text
            x={BOARD_WIDTH / 2}
            y={riverCenterY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={36}
            fill="#5c3317"
            opacity={0.5}
            style={{ userSelect: 'none' }}
            aria-label={t('board.river')}
          >
            楚 河 {'     '} 漢 界
          </text>
        )
      })()}

      {/* Pieces */}
      {pieces.map((piece) => {
        const isSelected =
          selectedPosition?.col === piece.position.col &&
          selectedPosition?.row === piece.position.row
        return (
          <Piece
            key={`${piece.side}-${piece.type}-${piece.position.col}-${piece.position.row}`}
            piece={piece}
            isSelected={isSelected}
            flipped={flipped}
          />
        )
      })}

      {/* Custom highlight squares (for puzzles) — rendered on top of pieces */}
      {highlightSquares?.map((pos) => {
        const { x, y } = boardToSVG(pos.col, pos.row, flipped)
        const color = HIGHLIGHT_COLORS[highlightStyle ?? 'target']
        const hasPiece = pieces.some(
          (p) => p.position.col === pos.col && p.position.row === pos.row,
        )
        return hasPiece ? (
          <circle
            key={`hs-${pos.col}-${pos.row}`}
            cx={x}
            cy={y}
            r={28}
            fill="none"
            stroke={color}
            strokeWidth={5}
            opacity={0.7}
          />
        ) : (
          <circle
            key={`hs-${pos.col}-${pos.row}`}
            cx={x}
            cy={y}
            r={30}
            fill={color}
            opacity={0.35}
          />
        )
      })}

      {/* Legal move highlights */}
      {selectedPosition && <MoveHighlight moves={legalMoves} pieces={pieces} flipped={flipped} />}

      {/* Tap targets */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <TapTarget
            key={`tap-${col}-${row}`}
            col={col}
            row={row}
            piece={pieceAt(col, row)}
            onTap={() => onTapSquare({ col, row })}
            onLongPress={
              pieceAt(col, row) && onLongPressPiece
                ? () => onLongPressPiece(pieceAt(col, row)!.type)
                : undefined
            }
            flipped={flipped}
          />
        )),
      )}
    </svg>
  )
}
