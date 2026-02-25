import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'

export function GameControls() {
  const { t, i18n } = useTranslation()
  const confirmMoveEnabled = useGameStore((s) => s.confirmMoveEnabled)
  const toggleConfirmMove = useGameStore((s) => s.toggleConfirmMove)
  const resetGame = useGameStore((s) => s.resetGame)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <button
        onClick={toggleLanguage}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600"
      >
        {i18n.language === 'vi' ? 'EN' : 'VI'}
      </button>
      <button
        onClick={toggleConfirmMove}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600"
      >
        {confirmMoveEnabled ? t('game.confirmModeOn') : t('game.confirmModeOff')}
      </button>
      <button
        onClick={resetGame}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600"
      >
        {t('game.newGame')}
      </button>
    </div>
  )
}
