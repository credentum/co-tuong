import { useTranslation } from 'react-i18next'
import type { PieceType } from '@/types/game'
import { PIECE_CHARS } from '@/constants/board'

interface PieceInfoCardProps {
  pieceType: PieceType
  onClose: () => void
}

const MOVE_DIAGRAMS: Record<PieceType, string> = {
  tuong: '  · ↑ ·\n  ← K →\n  · ↓ ·\n  Palace only',
  si: '  ↗   ↖\n    A\n  ↙   ↘\n  Palace only',
  tuongVoi: '↗       ↖\n  ·   ·\n    E\n  ·   ·\n↙       ↘\nOwn side only',
  xe: '      ↑\n  ← R →\n      ↓\n  Any distance',
  phao: '      ↑\n  ← C →\n      ↓\n  Jump to capture',
  ma: '  · ↑ ·\n↑ · · · ↑\n  · N ·\n↓ · · · ↓\n  · ↓ ·\n  L-shape, leg block',
  tot: '    ↑\n    P\n  Before river: forward only\n  ← P →\n  After river: +sideways',
}

export function PieceInfoCard({ pieceType, onClose }: PieceInfoCardProps) {
  const { t } = useTranslation()
  const chars = PIECE_CHARS[pieceType]
  const name = t(`pieces.${pieceType}`)
  const vnName = t(`pieces.${pieceType}`, { lng: 'vi' })
  const description = t(`pieceInfo.${pieceType}`)
  const diagram = MOVE_DIAGRAMS[pieceType]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="mx-4 max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-600 bg-red-50">
            <span className="text-2xl font-bold text-red-600">{chars?.red}</span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-stone-800 bg-stone-50">
            <span className="text-2xl font-bold text-stone-800">{chars?.black}</span>
          </div>
          <div>
            <div className="text-lg font-bold text-stone-800">{vnName}</div>
            <div className="text-sm text-stone-500">{name}</div>
          </div>
        </div>

        <pre className="mb-3 rounded-lg bg-stone-100 p-3 text-center text-xs leading-relaxed text-stone-600">
          {diagram}
        </pre>

        <p className="text-sm leading-relaxed text-stone-700">{description}</p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-stone-800 py-2 text-sm font-medium text-white"
        >
          {t('game.close')}
        </button>
      </div>
    </div>
  )
}
