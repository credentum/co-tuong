import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'
import { BOARD_HEIGHT, BOARD_PADDING, BOARD_WIDTH, CELL_SIZE, COLS, ROWS } from '@/constants/board'
import { boardToSVG } from '@/lib/coordinates'
import { Piece } from './Piece'
import { MoveHighlight } from './MoveHighlight'
import { TapTarget } from './TapTarget'

export function BoardSVG() {
  const { t } = useTranslation()
  const pieces = useGameStore((s) => s.pieces)
  const selectedPosition = useGameStore((s) => s.selectedPosition)
  const legalMoves = useGameStore((s) => s.legalMoves)
  const selectPosition = useGameStore((s) => s.selectPosition)

  // Helper: get piece at board position
  const pieceAt = (col: number, row: number) =>
    pieces.find((p) => p.position.col === col && p.position.row === row)

  // SVG grid line coordinates
  const gridLeft = BOARD_PADDING
  const gridRight = BOARD_PADDING + (COLS - 1) * CELL_SIZE
  const gridTop = BOARD_PADDING
  const gridBottom = BOARD_PADDING + (ROWS - 1) * CELL_SIZE

  // River Y positions (between rows 4 and 5, which in SVG is between row-indices 5 and 4 from top)
  const riverTop = boardToSVG(0, 5).y
  const riverBottom = boardToSVG(0, 4).y

  return (
    <svg
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      role="grid"
      aria-label={t('board.title')}
      className="max-h-full max-w-full"
    >
      {/* Board background */}
      <rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#f5d799" rx={8} />

      {/* Horizontal lines (10 rows) */}
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

      {/* Vertical lines — full height for edge columns, split at river for inner columns */}
      {Array.from({ length: COLS }, (_, i) => {
        const x = gridLeft + i * CELL_SIZE
        if (i === 0 || i === COLS - 1) {
          // Edge columns: full line
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
        // Inner columns: break at river
        return (
          <g key={`v-${i}`}>
            <line x1={x} y1={gridTop} x2={x} y2={riverTop} stroke="#5c3317" strokeWidth={1.5} />
            <line
              x1={x}
              y1={riverBottom}
              x2={x}
              y2={gridBottom}
              stroke="#5c3317"
              strokeWidth={1.5}
            />
          </g>
        )
      })}

      {/* Palace diagonals — Red (bottom, rows 0-2) */}
      {(() => {
        const tl = boardToSVG(3, 2)
        const tr = boardToSVG(5, 2)
        const bl = boardToSVG(3, 0)
        const br = boardToSVG(5, 0)
        return (
          <g>
            <line x1={tl.x} y1={tl.y} x2={br.x} y2={br.y} stroke="#5c3317" strokeWidth={1.5} />
            <line x1={tr.x} y1={tr.y} x2={bl.x} y2={bl.y} stroke="#5c3317" strokeWidth={1.5} />
          </g>
        )
      })()}

      {/* Palace diagonals — Black (top, rows 7-9) */}
      {(() => {
        const tl = boardToSVG(3, 9)
        const tr = boardToSVG(5, 9)
        const bl = boardToSVG(3, 7)
        const br = boardToSVG(5, 7)
        return (
          <g>
            <line x1={tl.x} y1={tl.y} x2={br.x} y2={br.y} stroke="#5c3317" strokeWidth={1.5} />
            <line x1={tr.x} y1={tr.y} x2={bl.x} y2={bl.y} stroke="#5c3317" strokeWidth={1.5} />
          </g>
        )
      })()}

      {/* River text */}
      {(() => {
        const riverCenterY = (riverTop + riverBottom) / 2
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
          />
        )
      })}

      {/* Legal move highlights */}
      {selectedPosition && <MoveHighlight moves={legalMoves} pieces={pieces} />}

      {/* Tap targets (rendered on top of everything for input capture) */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <TapTarget
            key={`tap-${col}-${row}`}
            col={col}
            row={row}
            piece={pieceAt(col, row)}
            onTap={() => selectPosition({ col, row })}
          />
        )),
      )}
    </svg>
  )
}
