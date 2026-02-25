import { useTranslation } from 'react-i18next'
import { usePracticeStore } from '@/store/usePracticeStore'

export function PracticeSessionComplete() {
  const { t } = useTranslation()
  const sessionResults = usePracticeStore((s) => s.sessionResults)
  const difficulty = usePracticeStore((s) => s.difficulty)
  const startSession = usePracticeStore((s) => s.startSession)
  const exitPractice = usePracticeStore((s) => s.exitPractice)

  const correct = sessionResults.filter(Boolean).length
  const total = sessionResults.length

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <div className="mb-2 text-4xl">
          {correct === total ? '🎉' : correct >= total / 2 ? '👍' : '💪'}
        </div>
        <h2 className="text-lg font-bold text-stone-800">{t('practice.sessionComplete')}</h2>
        <p className="mt-1 text-sm text-stone-600">{t('practice.score', { correct, total })}</p>
      </div>

      <div className="flex gap-3">
        {difficulty && (
          <button
            onClick={() => startSession(difficulty)}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white"
          >
            {t('practice.practiceAgain')}
          </button>
        )}
        <button
          onClick={exitPractice}
          className="rounded-lg border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700"
        >
          {t('practice.changeDifficulty')}
        </button>
      </div>
    </div>
  )
}
