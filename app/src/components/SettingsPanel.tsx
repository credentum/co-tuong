import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'
import { useLearningStore } from '@/store/useLearningStore'
import {
  usePlayerStore,
  computeCafeReadiness,
  type DotMode,
  type NudgeMode,
} from '@/store/usePlayerStore'
import { usePatternStore } from '@/store/usePatternStore'
import { usePracticeStore } from '@/store/usePracticeStore'
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
  const dotMode = usePlayerStore((s) => s.dotMode)
  const setDotMode = usePlayerStore((s) => s.setDotMode)
  const nudgeMode = usePlayerStore((s) => s.nudgeMode)
  const setNudgeMode = usePlayerStore((s) => s.setNudgeMode)
  const mastery = usePlayerStore((s) => s.mastery)
  const patterns = usePatternStore((s) => s.patterns)
  const practiceProgress = usePracticeStore((s) => s.practiceProgress)

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

  const dotModes: { mode: DotMode; label: string }[] = [
    { mode: 'always', label: t('game.dotsAlways') },
    { mode: 'adaptive', label: t('game.dotsAdaptive') },
    { mode: 'on_request', label: t('game.dotsOnRequest') },
    { mode: 'off', label: t('game.dotsOff') },
  ]

  const nudgeModes: { mode: NudgeMode; label: string }[] = [
    { mode: 'on', label: t('coaching.nudgesOn') },
    { mode: 'subtle', label: t('coaching.nudgesSubtle') },
    { mode: 'off', label: t('game.dotsOff') },
  ]

  // Café readiness computation
  const resolvedCount = Object.values(patterns).filter((p) => p.resolved).length
  const totalWithOccurrences = Object.values(patterns).filter((p) => p.occurrences > 0).length
  const solveRate =
    practiceProgress.length > 0
      ? practiceProgress.filter((p) => p.lastCorrect).length / practiceProgress.length
      : 0
  const cafeReadiness = computeCafeReadiness(
    mastery,
    dotMode,
    displayMode,
    resolvedCount,
    totalWithOccurrences,
    solveRate,
  )

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
        {/* Close handle + button */}
        <div className="mb-3 flex items-center justify-between">
          <div className="w-8" />
          <button
            onClick={onClose}
            className="mx-auto h-1 w-10 rounded-full bg-stone-300"
            aria-label={t('game.close')}
          />
          <button onClick={onClose} className="text-xs font-medium text-stone-500">
            {t('game.close')}
          </button>
        </div>

        {/* Café Readiness */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {t('coaching.cafeReadiness')}
          </h3>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{ width: `${cafeReadiness}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {cafeReadiness}% —{' '}
            {cafeReadiness >= 80
              ? t('coaching.almostReady')
              : cafeReadiness >= 40
                ? t('coaching.gettingThere')
                : t('coaching.justStarting')}
          </p>
        </section>

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

        {/* Move Dots */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {t('game.legalMoveDots')}
          </h3>
          <div className="flex gap-2">
            {dotModes.map((d) => (
              <button
                key={d.mode}
                onClick={() => setDotMode(d.mode)}
                className={dotMode === d.mode ? btnOn : btnOff}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* Coaching Nudges */}
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            {t('coaching.nudges')}
          </h3>
          <div className="flex gap-2">
            {nudgeModes.map((d) => (
              <button
                key={d.mode}
                onClick={() => setNudgeMode(d.mode)}
                className={nudgeMode === d.mode ? btnOn : btnOff}
              >
                {d.label}
              </button>
            ))}
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
