import type { Piece, Position } from '@/types/game'
import { PIECE_CHARS } from '@/constants/board'
import { posEq } from '@/lib/moves/helpers'

const CELL = 28
const PAD = 14
const COLS = 9
const ROWS = 10
const W = PAD * 2 + (COLS - 1) * CELL
const H = PAD * 2 + (ROWS - 1) * CELL
const R = 11

function xy(col: number, row: number) {
  return { x: PAD + col * CELL, y: PAD + (ROWS - 1 - row) * CELL }
}

interface MiniBoardSVGProps {
  pieces: Piece[]
  highlightSquares?: Position[]
  className?: string
}

export function MiniBoardSVG({ pieces, highlightSquares, className }: MiniBoardSVGProps) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      <rect x={0} y={0} width={W} height={H} fill="#f5d799" rx={4} />

      {/* Horizontal grid lines */}
      {Array.from({ length: ROWS }, (_, i) => {
        const y = PAD + i * CELL
        return (
          <line
            key={`h${i}`}
            x1={PAD}
            y1={y}
            x2={PAD + (COLS - 1) * CELL}
            y2={y}
            stroke="#5c3317"
            strokeWidth={0.6}
          />
        )
      })}

      {/* Vertical grid lines (broken at river for inner columns) */}
      {Array.from({ length: COLS }, (_, i) => {
        const x = PAD + i * CELL
        const riverTop = PAD + (ROWS - 1 - 5) * CELL
        const riverBot = PAD + (ROWS - 1 - 4) * CELL
        if (i === 0 || i === COLS - 1) {
          return (
            <line
              key={`v${i}`}
              x1={x}
              y1={PAD}
              x2={x}
              y2={PAD + (ROWS - 1) * CELL}
              stroke="#5c3317"
              strokeWidth={0.6}
            />
          )
        }
        return (
          <g key={`v${i}`}>
            <line x1={x} y1={PAD} x2={x} y2={riverTop} stroke="#5c3317" strokeWidth={0.6} />
            <line
              x1={x}
              y1={riverBot}
              x2={x}
              y2={PAD + (ROWS - 1) * CELL}
              stroke="#5c3317"
              strokeWidth={0.6}
            />
          </g>
        )
      })}

      {/* Highlight squares */}
      {highlightSquares?.map((pos) => {
        const { x, y } = xy(pos.col, pos.row)
        return (
          <circle
            key={`hl-${pos.col}-${pos.row}`}
            cx={x}
            cy={y}
            r={R + 3}
            fill="#3b82f6"
            opacity={0.3}
          />
        )
      })}

      {/* Pieces */}
      {pieces.map((p) => {
        const { x, y } = xy(p.position.col, p.position.row)
        const chars = PIECE_CHARS[p.type]
        const char = chars ? (p.side === 'red' ? chars.red : chars.black) : ''
        const isHighlighted = highlightSquares?.some((hs) => posEq(hs, p.position))
        return (
          <g key={`${p.side}-${p.type}-${p.position.col}-${p.position.row}`}>
            <circle
              cx={x}
              cy={y}
              r={R}
              fill={p.side === 'red' ? '#fef2f2' : '#f5f5f4'}
              stroke={isHighlighted ? '#3b82f6' : p.side === 'red' ? '#dc2626' : '#1c1917'}
              strokeWidth={isHighlighted ? 1.2 : 0.8}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight="bold"
              fill={p.side === 'red' ? '#dc2626' : '#1c1917'}
              style={{ userSelect: 'none' }}
            >
              {char}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
