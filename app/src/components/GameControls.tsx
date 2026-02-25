import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'

export function GameControls() {
  const { t, i18n } = useTranslation()
  const confirmMoveEnabled = useGameStore((s) => s.confirmMoveEnabled)
  const toggleConfirmMove = useGameStore((s) => s.toggleConfirmMove)
  const resetGame = useGameStore((s) => s.resetGame)
  const opponentMode = useGameStore((s) => s.opponentMode)
  const setOpponentMode = useGameStore((s) => s.setOpponentMode)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')
  }

  const btnClass =
    'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600'
  const activeBtnClass =
    'rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700'

  return (
    <div className="flex items-center gap-3 py-2">
      <button onClick={toggleLanguage} className={btnClass}>
        {i18n.language === 'vi' ? 'EN' : 'VI'}
      </button>
      <button
        onClick={() => setOpponentMode('pass-and-play')}
        className={opponentMode === 'pass-and-play' ? activeBtnClass : btnClass}
      >
        {t('game.passAndPlay')}
      </button>
      <button
        onClick={() => setOpponentMode('random-bot')}
        className={opponentMode === 'random-bot' ? activeBtnClass : btnClass}
      >
        {t('game.randomBot')}
      </button>
      <button onClick={toggleConfirmMove} className={btnClass}>
        {confirmMoveEnabled ? t('game.confirmModeOn') : t('game.confirmModeOff')}
      </button>
      <button onClick={resetGame} className={btnClass}>
        {t('game.newGame')}
      </button>
    </div>
  )
}
