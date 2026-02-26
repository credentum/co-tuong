import { useTranslation } from 'react-i18next'
import { usePracticeStore } from '@/store/usePracticeStore'
import { usePatternCurriculumStore } from '@/store/usePatternCurriculumStore'
import { PracticePuzzleBoard } from '../practice/PracticePuzzleBoard'
import { getPatternById } from '@/data/patternDefs'

export function PatternPuzzleView() {
  const { t } = useTranslation()
  const puzzle = usePracticeStore((s) => s.getCurrentPuzzle())
  const sessionIndex = usePracticeStore((s) => s.sessionIndex)
  const sessionPuzzleIds = usePracticeStore((s) => s.sessionPuzzleIds)
  const phaseStatus = usePracticeStore((s) => s.phaseStatus)
  const attempts = usePracticeStore((s) => s.attempts)
  const hintShown = usePracticeStore((s) => s.hintShown)
  const engineHintMove = usePracticeStore((s) => s.engineHintMove)
  const nextPuzzle = usePracticeStore((s) => s.nextPuzzle)
  const skipPuzzle = usePracticeStore((s) => s.skipPuzzle)
  const requestHint = usePracticeStore((s) => s.requestHint)

  const currentPatternId = usePatternCurriculumStore((s) => s.currentPatternId)
  const recordPuzzleSolved = usePatternCurriculumStore((s) => s.recordPuzzleSolved)
  const backToSelector = usePatternCurriculumStore((s) => s.backToSelector)
  const pattern = currentPatternId ? getPatternById(currentPatternId) : null

  // Session complete — all 5 puzzles done
  if (sessionIndex >= sessionPuzzleIds.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <div className="text-center">
          <p className="text-lg font-bold text-stone-800">{t('patterns.patternComplete')}</p>
          {pattern && <p className="mt-1 text-sm text-stone-500">{pattern.name}</p>}
        </div>
        <button
          onClick={backToSelector}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white active:bg-indigo-700"
        >
          {t('patterns.backToPatterns')}
        </button>
      </div>
    )
  }

  if (!puzzle) return null

  const isActive = phaseStatus === 'awaiting_player_move'
  const canNext = phaseStatus === 'puzzle_solved' || phaseStatus === 'puzzle_failed'

  // Determine step label (Spot It for puzzles 1-3, Survive/Deliver It for 4-5)
  const stepLabel =
    sessionIndex < 3
      ? t('patterns.spotIt')
      : pattern?.level === 'attack'
        ? t('patterns.deliverIt')
        : t('patterns.surviveIt')

  const handleNext = () => {
    // Record solved puzzle in pattern curriculum
    if (phaseStatus === 'puzzle_solved' && currentPatternId) {
      recordPuzzleSolved(currentPatternId)
    }
    nextPuzzle()
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Progress bar */}
      <div className="flex items-center justify-between px-4 py-1">
        <span className="text-xs text-stone-500">
          {t('patterns.puzzleProgress', {
            current: sessionIndex + 1,
            total: sessionPuzzleIds.length,
          })}
        </span>
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
          {stepLabel}
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

          {isActive && (
            <button
              onClick={skipPuzzle}
              className="rounded-lg border border-stone-300 bg-white px-4 py-1.5 text-xs font-medium text-stone-600"
            >
              {t('practice.skip')}
            </button>
          )}

          {canNext && (
            <button
              onClick={handleNext}
              className="rounded-lg bg-indigo-600 px-5 py-1.5 text-sm font-medium text-white"
            >
              {t('practice.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
