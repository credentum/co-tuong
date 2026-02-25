import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'
import { useLearningStore } from '@/store/useLearningStore'
import type { DisplayMode } from '@/constants/board'
import type { OpponentMode } from '@/store/useGameStore'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { t, i18n } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)

  const opponentMode = useGameStore((s) => s.opponentMode)
  const setOpponentMode = useGameStore((s) => s.setOpponentMode)
  const toggleBoardFlip = useGameStore((s) => s.toggleBoardFlip)
  const boardFlipped = useGameStore((s) => s.boardFlipped)
  const confirmMoveEnabled = useGameStore((s) => s.confirmMoveEnabled)
  const toggleConfirmMove = useGameStore((s) => s.toggleConfirmMove)
  const moveList = useGameStore((s) => s.moveList)
  const displayMode = useLearningStore((s) => s.displayMode)
  const setDisplayMode = useLearningStore((s) => s.setDisplayMode)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')
  }

  const btnBase = 'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors'
  const btnOff = `${btnBase} border border-stone-300 bg-white text-stone-600`
  const btnOn = `${btnBase} border border-red-300 bg-red-50 text-red-700`

  const displayModes: { mode: DisplayMode; label: string }[] = [
    { mode: 'characters_only', label: t('game.labelTraditional') },
    { mode: 'english', label: t('game.labelEnglish') },
    { mode: 'vietnamese', label: t('game.labelVietnamese') },
  ]

  const difficulties: { mode: OpponentMode; label: string }[] = [
    { mode: 'pass-and-play', label: t('game.passAndPlay') },
    { mode: 'random-bot', label: t('game.randomBot') },
    { mode: 'medium', label: t('game.mediumBot') },
    { mode: 'minimax', label: t('game.minimaxBot') },
  ]

  // Group moves into pairs (red, black)
  const pairs: { num: number; red?: string; black?: string }[] = []
  for (let i = 0; i < moveList.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      red: moveList[i]?.wxf,
      black: moveList[i + 1]?.wxf,
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-6 pt-3 shadow-xl"
      >
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300" />

        {/* Piece Labels */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {t('game.labelTraditional')} / Labels
          </h3>
          <div className="flex gap-2">
            {displayModes.map((d) => (
              <button
                key={d.mode}
                onClick={() => setDisplayMode(d.mode)}
                className={displayMode === d.mode ? btnOn : btnOff}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* Game Mode / Difficulty */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {t('game.difficulty')}
          </h3>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d.mode}
                onClick={() => setOpponentMode(d.mode)}
                className={opponentMode === d.mode ? btnOn : btnOff}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* Board options */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {t('game.boardOptions')}
          </h3>
          <div className="flex gap-2">
            <button onClick={toggleBoardFlip} className={boardFlipped ? btnOn : btnOff}>
              {t('game.flipBoard')}
            </button>
            <button onClick={toggleConfirmMove} className={confirmMoveEnabled ? btnOn : btnOff}>
              {confirmMoveEnabled ? t('game.confirmModeOn') : t('game.confirmModeOff')}
            </button>
            <button onClick={toggleLanguage} className={btnOff}>
              {i18n.language === 'vi' ? 'EN' : 'VI'}
            </button>
          </div>
        </section>

        {/* Move History */}
        {pairs.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
              {t('game.moveHistory')}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-600">
              {pairs.map((p) => (
                <span key={p.num}>
                  <span className="text-stone-400">{p.num}.</span>{' '}
                  <span className="text-red-700">{p.red}</span>
                  {p.black && <span className="ml-1 text-stone-800">{p.black}</span>}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
