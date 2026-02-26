import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePracticeStore } from '@/store/usePracticeStore'
import { useLossStore } from '@/store/useLossStore'
import { PRACTICE_PUZZLES_BY_DIFFICULTY } from '@/data/practicePuzzles'
import { LossLibrary } from './LossLibrary'
import type { PracticeDifficulty } from '@/types/practice'

const DIFFICULTIES: { key: PracticeDifficulty; stars: string }[] = [
  { key: 'easy', stars: '⭐' },
  { key: 'medium', stars: '⭐⭐' },
  { key: 'hard', stars: '⭐⭐⭐' },
]

export function PracticeDifficultyPicker() {
  const { t } = useTranslation()
  const startSession = usePracticeStore((s) => s.startSession)
  const startLossSession = usePracticeStore((s) => s.startLossSession)
  const progress = usePracticeStore((s) => s.practiceProgress)
  const lossPuzzleCount = usePracticeStore((s) => s.lossPuzzles.length)
  const unreviewedCount = useLossStore((s) => s.getUnreviewedCount())
  const lossCount = useLossStore((s) => s.losses.length)
  const [showLosses, setShowLosses] = useState(false)

  if (showLosses) {
    return <LossLibrary onBack={() => setShowLosses(false)} />
  }

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

      {/* My Puzzles — from converted losses */}
      {lossPuzzleCount > 0 && (
        <>
          <div className="mt-4 w-full max-w-xs border-t border-stone-200" />
          <button
            onClick={() => startLossSession()}
            className="w-full max-w-xs rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-left shadow-sm active:bg-amber-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-stone-800">
                  {t('practice.myPuzzles')}
                </div>
                <div className="mt-0.5 text-xs text-stone-500">{t('practice.myPuzzlesDesc')}</div>
              </div>
              <div className="text-xs text-stone-400">{lossPuzzleCount}</div>
            </div>
          </button>
        </>
      )}

      {/* My Mistakes section */}
      {lossCount > 0 && (
        <>
          <div className="mt-4 w-full max-w-xs border-t border-stone-200" />
          <button
            onClick={() => setShowLosses(true)}
            className="w-full max-w-xs rounded-xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm active:bg-stone-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-stone-800">My Mistakes</div>
                <div className="mt-0.5 text-xs text-stone-500">
                  Review positions from your losses
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreviewedCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {unreviewedCount}
                  </span>
                )}
                <span className="text-xs text-stone-400">{lossCount}</span>
              </div>
            </div>
          </button>
        </>
      )}
    </div>
  )
}
