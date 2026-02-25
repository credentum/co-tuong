import { useTranslation } from 'react-i18next'
import { useLearningStore } from '@/store/useLearningStore'
import { LessonSelector } from './LessonSelector'
import { SeeItPhase } from './SeeItPhase'
import { TestItPhase } from './TestItPhase'
import { LESSONS } from '@/data/lessons'

export function LearningScreen() {
  const { t } = useTranslation()
  const currentLesson = useLearningStore((s) => s.currentLesson)
  const currentPhase = useLearningStore((s) => s.currentPhase)
  const setAppMode = useLearningStore((s) => s.setAppMode)
  const backToSelector = useLearningStore((s) => s.backToSelector)

  const lesson = currentLesson ? LESSONS.find((l) => l.lessonId === currentLesson) : null

  return (
    <div className="flex h-[100dvh] flex-col bg-amber-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={currentLesson ? backToSelector : () => setAppMode('game')}
          className="text-sm font-medium text-red-600"
        >
          {currentLesson ? '← Back' : t('learning.backToGame')}
        </button>
        {lesson && (
          <span className="flex-1 truncate text-center text-sm font-semibold text-stone-700">
            {lesson.title}
          </span>
        )}
        {lesson && <div className="w-12" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!currentLesson && <LessonSelector />}
        {currentLesson && currentPhase === 'see_it' && <SeeItPhase />}
        {currentLesson && currentPhase === 'test_it' && <TestItPhase />}
        {currentLesson && currentPhase === 'try_it' && (
          <div className="flex flex-col items-center gap-4 px-4 py-8">
            <p className="text-sm text-stone-500">Mini-games coming in Sprint 8</p>
            <button
              onClick={backToSelector}
              className="rounded-lg bg-stone-200 px-4 py-2 text-sm text-stone-700"
            >
              {t('learning.backToLessons')}
            </button>
          </div>
        )}
        {currentLesson && currentPhase === 'use_it' && (
          <div className="flex flex-col items-center gap-4 px-4 py-8">
            <p className="text-sm text-stone-500">Practice games coming in Sprint 8</p>
            <button
              onClick={backToSelector}
              className="rounded-lg bg-stone-200 px-4 py-2 text-sm text-stone-700"
            >
              {t('learning.backToLessons')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
