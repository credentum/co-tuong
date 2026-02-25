import { useTranslation } from 'react-i18next'
import { usePracticeStore } from '@/store/usePracticeStore'
import { PRACTICE_PUZZLES_BY_DIFFICULTY } from '@/data/practicePuzzles'
import type { PracticeDifficulty } from '@/types/practice'

const DIFFICULTIES: { key: PracticeDifficulty; stars: string }[] = [
  { key: 'easy', stars: '⭐' },
  { key: 'medium', stars: '⭐⭐' },
  { key: 'hard', stars: '⭐⭐⭐' },
]

export function PracticeDifficultyPicker() {
  const { t } = useTranslation()
  const startSession = usePracticeStore((s) => s.startSession)
  const progress = usePracticeStore((s) => s.practiceProgress)

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <h2 className="mb-2 text-lg font-bold text-stone-800">{t('practice.chooseDifficulty')}</h2>

      {DIFFICULTIES.map(({ key, stars }) => {
        const puzzleIds = PRACTICE_PUZZLES_BY_DIFFICULTY[key]
        const solved = puzzleIds.filter((id) =>
          progress.some((p) => p.puzzleId === id && p.lastCorrect),
        ).length

        return (
          <button
            key={key}
            onClick={() => startSession(key)}
            className="w-full max-w-xs rounded-xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm active:bg-stone-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-stone-800">
                  {stars} {t(`practice.${key}`)}
                </div>
                <div className="mt-0.5 text-xs text-stone-500">{t(`practice.${key}Desc`)}</div>
              </div>
              <div className="text-xs text-stone-400">
                {solved}/{puzzleIds.length}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
