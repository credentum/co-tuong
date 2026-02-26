import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useGameStore } from '@/store/useGameStore'
import { useLearningStore } from '@/store/useLearningStore'
import { NUDGE_MESSAGES } from '@/lib/patternPuzzleMap'
import type { DisplayMode } from '@/constants/board'

const NUDGE_DURATION = 3000
const LABEL_GAMES_THRESHOLD = 20

export function Toast() {
  const { t } = useTranslation()

  // Nudge state
  const activeNudge = usePlayerStore((s) => s.activeNudge)
  const nudgeMode = usePlayerStore((s) => s.nudgeMode)
  const clearNudge = usePlayerStore((s) => s.clearNudge)

  // Label suggestion state
  const totalGamesPlayed = usePlayerStore((s) => s.totalGamesPlayed)
  const labelSuggestionDismissed = usePlayerStore((s) => s.labelSuggestionDismissed)
  const mastery = usePlayerStore((s) => s.mastery)
  const displayMode = useLearningStore((s) => s.displayMode)
  const setDisplayMode = useLearningStore((s) => s.setDisplayMode)
  const setLabelSuggestionDismissed = usePlayerStore((s) => s.setLabelSuggestionDismissed)
  const gameResult = useGameStore((s) => s.gameResult)

  const [showLabelSuggestion, setShowLabelSuggestion] = useState(false)
  const [labelSuggestionType, setLabelSuggestionType] = useState<'vietnamese' | 'characters_only'>(
    'vietnamese',
  )

  // Auto-dismiss nudge after duration
  useEffect(() => {
    if (!activeNudge) return
    const id = setTimeout(clearNudge, NUDGE_DURATION)
    return () => clearTimeout(id)
  }, [activeNudge, clearNudge])

  // Check for label suggestion on game end
  useEffect(() => {
    if (gameResult === 'ongoing') return

    // Suggest Vietnamese labels after 20 games
    if (
      displayMode === 'english' &&
      totalGamesPlayed >= LABEL_GAMES_THRESHOLD &&
      labelSuggestionDismissed === 'none'
    ) {
      setLabelSuggestionType('vietnamese')
      setShowLabelSuggestion(true)
      return
    }

    // Suggest no labels when all pieces graduated
    if (
      displayMode === 'vietnamese' &&
      labelSuggestionDismissed !== 'characters_only' &&
      Object.values(mastery).every((m) => m.graduated)
    ) {
      setLabelSuggestionType('characters_only')
      setShowLabelSuggestion(true)
    }
  }, [gameResult, displayMode, totalGamesPlayed, labelSuggestionDismissed, mastery])

  const handleLabelAccept = () => {
    const newMode: DisplayMode =
      labelSuggestionType === 'vietnamese' ? 'vietnamese' : 'characters_only'
    setDisplayMode(newMode)
    setLabelSuggestionDismissed(labelSuggestionType)
    setShowLabelSuggestion(false)
  }

  const handleLabelDismiss = () => {
    setLabelSuggestionDismissed(labelSuggestionType)
    setShowLabelSuggestion(false)
  }

  // Label suggestion toast (higher priority — shows with buttons)
  if (showLabelSuggestion) {
    const message =
      labelSuggestionType === 'vietnamese'
        ? t('coaching.suggestVietnamese')
        : t('coaching.suggestNoLabels')

    return (
      <div className="fixed inset-x-4 bottom-20 z-30 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-lg">
        <p className="mb-2 text-sm font-medium text-blue-800">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={handleLabelAccept}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white"
          >
            {t('coaching.yes')}
          </button>
          <button
            onClick={handleLabelDismiss}
            className="rounded-lg bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700"
          >
            {t('coaching.notYet')}
          </button>
        </div>
      </div>
    )
  }

  // Nudge toast
  if (!activeNudge || nudgeMode === 'off') return null

  if (nudgeMode === 'subtle') {
    // Subtle mode: thin amber line only
    return (
      <div className="fixed inset-x-0 bottom-16 z-30 flex justify-center">
        <div className="h-1 w-32 animate-pulse rounded-full bg-amber-400" />
      </div>
    )
  }

  // Full nudge with text
  return (
    <div className="fixed inset-x-4 bottom-20 z-30 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-lg">
      <p className="text-center text-sm font-medium text-amber-800">
        {NUDGE_MESSAGES[activeNudge]}
      </p>
    </div>
  )
}
