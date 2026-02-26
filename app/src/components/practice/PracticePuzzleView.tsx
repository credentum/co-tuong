import { useTranslation } from 'react-i18next'
import { usePracticeStore } from '@/store/usePracticeStore'
import { PracticePuzzleBoard } from './PracticePuzzleBoard'
import { PracticeSessionComplete } from './PracticeSessionComplete'

export function PracticePuzzleView() {
  const { t } = useTranslation()
  const puzzle = usePracticeStore((s) => s.getCurrentPuzzle())
  const sessionIndex = usePracticeStore((s) => s.sessionIndex)
  const sessionPuzzleIds = usePracticeStore((s) => s.sessionPuzzleIds)
  const phaseStatus = usePracticeStore((s) => s.phaseStatus)
  const attempts = usePracticeStore((s) => s.attempts)
  const showSolution = usePracticeStore((s) => s.showSolution)
  const hintShown = usePracticeStore((s) => s.hintShown)
  const engineHintMove = usePracticeStore((s) => s.engineHintMove)
  const nextPuzzle = usePracticeStore((s) => s.nextPuzzle)
  const skipPuzzle = usePracticeStore((s) => s.skipPuzzle)
  const requestHint = usePracticeStore((s) => s.requestHint)

  // Session complete
  if (sessionIndex >= sessionPuzzleIds.length) {
    return <PracticeSessionComplete />
  }

  if (!puzzle) return null

  const isActive = phaseStatus === 'awaiting_player_move'
  const canNext = phaseStatus === 'puzzle_solved' || phaseStatus === 'puzzle_failed'

  return (
    <div className="flex flex-1 flex-col">
      {/* Progress bar */}
      <div className="flex items-center justify-between px-4 py-1">
        <span className="text-xs text-stone-500">
          {t('practice.puzzleProgress', {
            current: sessionIndex + 1,
            total: sessionPuzzleIds.length,
          })}
        </span>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
          {puzzle.concept.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Board */}
      <div className="relative flex w-full max-w-lg flex-1 items-center justify-center self-center px-1">
        <PracticePuzzleBoard />
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-3 pt-2">
        {/* Prompt */}
        <p className="mb-2 text-center text-sm font-medium text-stone-700">{puzzle.prompt}</p>

        {/* Hint */}
        {hintShown && puzzle.hint && (
          <p className="mb-2 text-center text-xs italic text-amber-700">{puzzle.hint}</p>
        )}
        {hintShown && engineHintMove && (
          <p className="mb-1 text-center text-xs text-blue-600">{t('practice.engineHint')}</p>
        )}

        {/* Status messages */}
        {phaseStatus === 'opponent_responding' && (
          <p className="mb-2 text-center text-xs text-stone-500">
            {t('practice.opponentThinking')}
          </p>
        )}

        {phaseStatus === 'puzzle_solved' && (
          <p className="mb-2 text-center text-sm font-semibold text-green-700">
            {t('practice.correct')}
          </p>
        )}

        {phaseStatus === 'puzzle_failed' && (
          <>
            <p className="mb-1 text-center text-sm text-stone-600">{t('practice.showSolution')}</p>
            {engineHintMove && (
              <p className="mb-2 text-center text-xs text-stone-500">
                {t('practice.otherValidMoves')}
              </p>
            )}
          </>
        )}

        {attempts === 1 && isActive && (
          <p className="mb-2 text-center text-sm text-red-600">{t('practice.tryAgain')}</p>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          {isActive && !hintShown && puzzle.hint && (
            <button
              onClick={requestHint}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700"
            >
              {t('practice.hint')}
            </button>
          )}

          {isActive && !showSolution && (
            <button
              onClick={skipPuzzle}
              className="rounded-lg border border-stone-300 bg-white px-4 py-1.5 text-xs font-medium text-stone-600"
            >
              {t('practice.skip')}
            </button>
          )}

          {canNext && (
            <button
              onClick={nextPuzzle}
              className="rounded-lg bg-red-600 px-5 py-1.5 text-sm font-medium text-white"
            >
              {t('practice.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
