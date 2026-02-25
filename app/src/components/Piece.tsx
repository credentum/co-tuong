import { useTranslation } from 'react-i18next'
import type { Piece as PieceType } from '@/types/game'
import {
  PIECE_CHARS,
  PIECE_LABELS_EN,
  PIECE_LABELS_VI,
  PIECE_RADIUS,
  type DisplayMode,
} from '@/constants/board'
import { boardToSVG } from '@/lib/coordinates'

interface PieceProps {
  piece: PieceType
  isSelected: boolean
  aiHighlight?: boolean
  flipped?: boolean
  labelMode?: DisplayMode
}

export function Piece({ piece, isSelected, aiHighlight, flipped, labelMode }: PieceProps) {
  const { t } = useTranslation()
  const { x, y } = boardToSVG(piece.position.col, piece.position.row, flipped)
  const chars = PIECE_CHARS[piece.type]
  const char = piece.side === 'red' ? chars?.red : chars?.black
  const pieceName = t(`pieces.${piece.type}`)
  const sideName = t(`sides.${piece.side}`)

  const showLabel = labelMode && labelMode !== 'characters_only'
  const label =
    labelMode === 'english'
      ? PIECE_LABELS_EN[piece.type]
      : labelMode === 'vietnamese'
        ? PIECE_LABELS_VI[piece.type]
        : undefined

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ transition: 'transform 300ms ease-out' }}
      role="img"
      aria-label={t('board.pieceAt', {
        side: sideName,
        piece: pieceName,
        col: piece.position.col + 1,
        row: piece.position.row + 1,
      })}
    >
      {/* Piece background */}
      <circle
        r={PIECE_RADIUS}
        fill={piece.side === 'red' ? '#fef2f2' : '#f5f5f4'}
        stroke={piece.side === 'red' ? '#dc2626' : '#1c1917'}
        strokeWidth={isSelected ? 4 : 2.5}
      />

      {/* Selection ring */}
      {isSelected && (
        <circle r={PIECE_RADIUS + 6} fill="none" stroke="#2563eb" strokeWidth={3} opacity={0.8} />
      )}

      {/* AI move highlight ring */}
      {aiHighlight && (
        <circle r={PIECE_RADIUS + 6} fill="none" stroke="#f59e0b" strokeWidth={4} opacity={0.9} />
      )}

      {/* Traditional Hán tự character */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={showLabel ? 36 : 46}
        fontWeight="bold"
        fill={piece.side === 'red' ? '#dc2626' : '#1c1917'}
        dy={showLabel ? -9 : 0}
        style={{ userSelect: 'none' }}
      >
        {char}
      </text>

      {/* Piece name label */}
      {showLabel && label && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight="600"
          fill={piece.side === 'red' ? '#991b1b' : '#1c1917'}
          dy={20}
          style={{ userSelect: 'none' }}
          aria-hidden="true"
        >
          {label}
        </text>
      )}
    </g>
  )
}
