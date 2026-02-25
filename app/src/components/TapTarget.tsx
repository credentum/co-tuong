import { useTranslation } from 'react-i18next'
import type { Piece } from '@/types/game'
import { TAP_TARGET_SIZE } from '@/constants/board'
import { boardToSVG } from '@/lib/coordinates'

interface TapTargetProps {
  col: number
  row: number
  piece: Piece | undefined
  onTap: () => void
}

export function TapTarget({ col, row, piece, onTap }: TapTargetProps) {
  const { t } = useTranslation()
  const { x, y } = boardToSVG(col, row)
  const half = TAP_TARGET_SIZE / 2

  const label = piece
    ? t('board.pieceAt', {
        side: t(`sides.${piece.side}`),
        piece: t(`pieces.${piece.type}`),
        col: col + 1,
        row: row + 1,
      })
    : t('board.emptyAt', { col: col + 1, row: row + 1 })

  return (
    <rect
      x={x - half}
      y={y - half}
      width={TAP_TARGET_SIZE}
      height={TAP_TARGET_SIZE}
      fill="transparent"
      cursor="pointer"
      role="button"
      aria-label={label}
      onClick={onTap}
    />
  )
}
