import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'

export function TurnIndicator() {
  const { t } = useTranslation()
  const currentTurn = useGameStore((s) => s.currentTurn)

  const isRed = currentTurn === 'red'
  const label = isRed ? t('game.redTurn') : t('game.blackTurn')
  const dotColor = isRed ? 'bg-red-600' : 'bg-stone-800'
  const textColor = isRed ? 'text-red-700' : 'text-stone-800'

  return (
    <div className="flex items-center gap-2 py-2">
      <span className={`inline-block h-3 w-3 rounded-full ${dotColor}`} />
      <span className={`text-lg font-semibold ${textColor}`}>{label}</span>
    </div>
  )
}
