import { useTranslation } from 'react-i18next'
import { useLearningStore } from '@/store/useLearningStore'
import { PuzzleBoard } from './PuzzleBoard'
import { BottomSheet } from './BottomSheet'

export function TestItPhase() {
  const { t } = useTranslation()
  const puzzle = useLearningStore((s) => s.getCurrentPuzzle())
  const currentPuzzleIndex = useLearningStore((s) => s.currentPuzzleIndex)
  const puzzleIds = useLearningStore((s) => s.getPuzzleIds())
  const puzzleFeedback = useLearningStore((s) => s.puzzleFeedback)
  const showSolution = useLearningStore((s) => s.showSolution)
  const submitTapAnswer = useLearningStore((s) => s.submitTapAnswer)
  const nextPuzzle = useLearningStore((s) => s.nextPuzzle)
  const backToSelector = useLearningStore((s) => s.backToSelector)
  const tfCurrentIndex = useLearningStore((s) => s.tfCurrentIndex)
  const tfExplanation = useLearningStore((s) => s.tfExplanation)
  const submitTfAnswer = useLearningStore((s) => s.submitTfAnswer)

  if (!puzzle) {
    // All puzzles completed
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-8">
        <div className="text-4xl">🎉</div>
        <h2 className="text-lg font-bold text-stone-800">{t('learning.lessonComplete')}</h2>
        <button
          onClick={backToSelector}
          className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white"
        >
          {t('learning.backToLessons')}
        </button>
      </div>
    )
  }

  const isLastPuzzle = currentPuzzleIndex >= puzzleIds.length - 1
  const canSubmitTap = puzzle.type === 'tap_all_targets' && puzzleFeedback === 'none'
  const isTfActive =
    puzzle.type === 'true_false_series' &&
    puzzleFeedback === 'none' &&
    tfCurrentIndex < (puzzle.highlightPositions?.length ?? 0)
  const canRetry = puzzleFeedback === 'incorrect' && !showSolution
  const canNext = puzzleFeedback === 'correct' || showSolution

  const handleRetry = () => {
    const currentPuzzle = useLearningStore.getState().getCurrentPuzzle()
    useLearningStore.setState({
      puzzleFeedback: 'none',
      tappedPositions: [],
      highlightSquares:
        currentPuzzle?.type === 'true_false_series' && currentPuzzle.highlightPositions?.[0]
          ? [currentPuzzle.highlightPositions[0]]
          : [],
      highlightStyle: 'target' as const,
      selectedPosition: null,
      legalMoves: [],
      tfCurrentIndex: 0,
      tfAnswers: [],
    })
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Progress bar */}
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-xs text-stone-500">
          {t('learning.puzzleProgress', {
            current: currentPuzzleIndex + 1,
            total: puzzleIds.length,
          })}
        </span>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-stone-200">
            <div
              className="h-1.5 rounded-full bg-red-600 transition-all"
              style={{
                width: `${((currentPuzzleIndex + 1) / puzzleIds.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="mx-auto w-full max-w-md flex-1 p-2">
        <PuzzleBoard />
      </div>

      {/* Bottom sheet */}
      <BottomSheet>
        {/* Puzzle title + prompt */}
        <h3 className="mb-1 text-sm font-bold text-stone-800">{puzzle.title}</h3>
        <p className="mb-3 text-sm text-stone-600">{puzzle.prompt}</p>

        {/* Feedback */}
        {puzzleFeedback === 'correct' && (
          <p className="mb-3 text-sm font-semibold text-green-600">{t('learning.correct')}</p>
        )}
        {puzzleFeedback === 'incorrect' && !showSolution && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-red-600">{t('learning.tryAgain')}</p>
            {tfExplanation && <p className="mt-1 text-sm text-stone-600">{tfExplanation}</p>}
          </div>
        )}
        {showSolution && (
          <p className="mb-3 text-sm text-stone-500">{t('learning.showSolution')}</p>
        )}

        {/* True/false question indicator */}
        {isTfActive && puzzle.highlightPositions && (
          <p className="mb-2 text-xs text-stone-500">
            {t('learning.tfProgress', {
              current: tfCurrentIndex + 1,
              total: puzzle.highlightPositions.length,
            })}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {isTfActive && (
            <>
              <button
                onClick={() => submitTfAnswer(true)}
                className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white"
              >
                {t('learning.yes')}
              </button>
              <button
                onClick={() => submitTfAnswer(false)}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white"
              >
                {t('learning.no')}
              </button>
            </>
          )}

          {canSubmitTap && (
            <button
              onClick={submitTapAnswer}
              className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white"
            >
              {t('learning.submit')}
            </button>
          )}

          {canRetry && (
            <button
              onClick={handleRetry}
              className="flex-1 rounded-lg bg-stone-200 py-2.5 text-sm font-semibold text-stone-700"
            >
              {t('learning.tryAgain')}
            </button>
          )}

          {canNext && (
            <button
              onClick={nextPuzzle}
              className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white"
            >
              {isLastPuzzle ? t('learning.backToLessons') : t('learning.next')}
            </button>
          )}
        </div>

        {/* Teaches hint — show on any feedback */}
        {puzzle.teaches && puzzleFeedback !== 'none' && (
          <p className="mt-2 text-xs text-stone-400 italic">{puzzle.teaches}</p>
        )}
      </BottomSheet>
    </div>
  )
}
