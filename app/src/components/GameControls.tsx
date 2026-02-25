import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'
import { useLearningStore } from '@/store/useLearningStore'

export function GameControls() {
  const { t, i18n } = useTranslation()
  const setAppMode = useLearningStore((s) => s.setAppMode)
  const displayMode = useLearningStore((s) => s.displayMode)
  const cycleDisplayMode = useLearningStore((s) => s.cycleDisplayMode)
  const confirmMoveEnabled = useGameStore((s) => s.confirmMoveEnabled)
  const toggleConfirmMove = useGameStore((s) => s.toggleConfirmMove)
  const resetGame = useGameStore((s) => s.resetGame)
  const opponentMode = useGameStore((s) => s.opponentMode)
  const setOpponentMode = useGameStore((s) => s.setOpponentMode)
  const toggleBoardFlip = useGameStore((s) => s.toggleBoardFlip)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')
  }

  const btnClass =
    'rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600'
  const activeBtnClass =
    'rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700'

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2">
      <button onClick={() => setAppMode('learning')} className={activeBtnClass}>
        {t('learning.title')}
      </button>
      <button onClick={toggleLanguage} className={btnClass}>
        {i18n.language === 'vi' ? 'EN' : 'VI'}
      </button>
      <button onClick={cycleDisplayMode} className={btnClass}>
        {displayMode === 'english'
          ? t('game.labelEnglish')
          : displayMode === 'vietnamese'
            ? t('game.labelVietnamese')
            : t('game.labelTraditional')}
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
      <button
        onClick={() => setOpponentMode('minimax')}
        className={opponentMode === 'minimax' ? activeBtnClass : btnClass}
      >
        {t('game.minimaxBot')}
      </button>
      <button onClick={toggleBoardFlip} className={btnClass}>
        {t('game.flipBoard')}
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
