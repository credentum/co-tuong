import { useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Piece } from '@/types/game'
import { TAP_TARGET_SIZE } from '@/constants/board'
import { boardToSVG } from '@/lib/coordinates'

interface TapTargetProps {
  col: number
  row: number
  piece: Piece | undefined
  onTap: () => void
  onLongPress?: () => void
  flipped?: boolean
}

const LONG_PRESS_MS = 500

export function TapTarget({ col, row, piece, onTap, onLongPress, flipped }: TapTargetProps) {
  const { t } = useTranslation()
  const { x, y } = boardToSVG(col, row, flipped)
  const half = TAP_TARGET_SIZE / 2
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const label = piece
    ? t('board.pieceAt', {
        side: t(`sides.${piece.side}`),
        piece: t(`pieces.${piece.type}`),
        col: col + 1,
        row: row + 1,
      })
    : t('board.emptyAt', { col: col + 1, row: row + 1 })

  const startPress = useCallback(() => {
    didLongPress.current = false
    if (onLongPress) {
      timerRef.current = setTimeout(() => {
        didLongPress.current = true
        onLongPress()
      }, LONG_PRESS_MS)
    }
  }, [onLongPress])

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleClick = useCallback(() => {
    if (didLongPress.current) {
      didLongPress.current = false
      return
    }
    onTap()
  }, [onTap])

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
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerLeave={endPress}
    />
  )
}
