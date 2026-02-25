import { useTranslation } from 'react-i18next'
import type { Piece as PieceType } from '@/types/game'
import { PIECE_CHARS, PIECE_RADIUS } from '@/constants/board'
import { boardToSVG } from '@/lib/coordinates'

interface PieceProps {
  piece: PieceType
  isSelected: boolean
}

export function Piece({ piece, isSelected }: PieceProps) {
  const { t } = useTranslation()
  const { x, y } = boardToSVG(piece.position.col, piece.position.row)
  const chars = PIECE_CHARS[piece.type]
  const label = piece.side === 'red' ? chars?.red : chars?.black
  // Scale font to fit: short names (Xe, Sĩ, Mã) get larger text, longer names get smaller
  const fontSize = label && label.length <= 2 ? 30 : label && label.length <= 3 ? 24 : 20
  const pieceName = t(`pieces.${piece.type}`)
  const sideName = t(`sides.${piece.side}`)

  return (
    <g
      transform={`translate(${x}, ${y})`}
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

      {/* Vietnamese piece name */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="bold"
        fill={piece.side === 'red' ? '#dc2626' : '#1c1917'}
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  )
}
