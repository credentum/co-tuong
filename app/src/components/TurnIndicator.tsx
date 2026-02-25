import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'

export function TurnIndicator() {
  const { t } = useTranslation()
  const currentTurn = useGameStore((s) => s.currentTurn)
  const gameResult = useGameStore((s) => s.gameResult)

  if (gameResult === 'red_wins') {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
        <span className="text-sm font-bold text-red-700">{t('game.redWins')}</span>
      </div>
    )
  }

  if (gameResult === 'black_wins') {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="inline-block h-3 w-3 rounded-full bg-stone-800" />
        <span className="text-sm font-bold text-stone-800">{t('game.blackWins')}</span>
      </div>
    )
  }

  const isRed = currentTurn === 'red'
  const label = isRed ? t('game.redTurn') : t('game.blackTurn')
  const dotColor = isRed ? 'bg-red-600' : 'bg-stone-800'
  const textColor = isRed ? 'text-red-700' : 'text-stone-800'

  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`inline-block h-3 w-3 rounded-full ${dotColor}`} />
      <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
    </div>
  )
}
