import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'

export function ConfirmMoveBar() {
  const { t } = useTranslation()
  const pendingMove = useGameStore((s) => s.pendingMove)
  const confirmMove = useGameStore((s) => s.confirmMove)
  const cancelMove = useGameStore((s) => s.cancelMove)

  if (!pendingMove) return null

  return (
    <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-3">
      <button
        onClick={cancelMove}
        className="rounded-lg border border-stone-300 bg-white px-6 py-2 text-sm font-medium text-stone-700 shadow"
      >
        {t('game.cancelMove')}
      </button>
      <button
        onClick={confirmMove}
        className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white shadow"
      >
        {t('game.confirmMove')}
      </button>
    </div>
  )
}
