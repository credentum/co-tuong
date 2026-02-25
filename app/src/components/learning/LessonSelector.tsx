import { useTranslation } from 'react-i18next'
import { useLearningStore } from '@/store/useLearningStore'
import { LESSONS } from '@/data/lessons'
import type { LessonId } from '@/types/learning'

export function LessonSelector() {
  const { t } = useTranslation()
  const setLesson = useLearningStore((s) => s.setLesson)
  const isUnlocked = useLearningStore((s) => s.isLessonUnlocked)
  const lessonProgress = useLearningStore((s) => s.lessonProgress)

  const getProgress = (id: LessonId) => {
    const p = lessonProgress.find((lp) => lp.lessonId === id)
    if (!p) return 0
    let count = 0
    if (p.seeItComplete) count++
    if (p.tryItComplete) count++
    if (p.testItComplete) count++
    if (p.useItComplete) count++
    return count
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      <h2 className="mb-2 text-center text-lg font-bold text-stone-800">{t('learning.title')}</h2>
      <div className="flex flex-col gap-1">
        {LESSONS.map((lesson) => {
          const unlocked = isUnlocked(lesson.lessonId)
          const progress = getProgress(lesson.lessonId)

          return (
            <button
              key={lesson.lessonId}
              onClick={() => unlocked && setLesson(lesson.lessonId)}
              disabled={!unlocked}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                unlocked ? 'bg-white shadow-sm active:bg-stone-50' : 'bg-stone-100 opacity-50'
              }`}
            >
              {/* Lesson number */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  unlocked ? 'bg-red-600 text-white' : 'bg-stone-300 text-stone-500'
                }`}
              >
                {lesson.lessonId}
              </div>

              {/* Title + characters */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-stone-800">{lesson.title}</div>
                <div className="text-xs text-stone-500">
                  {lesson.seeIt.characterDisplay.join(' ')}
                  {unlocked && progress > 0 && (
                    <span className="ml-2 text-green-600">
                      {'●'.repeat(progress)}
                      {'○'.repeat(4 - progress)}
                    </span>
                  )}
                </div>
              </div>

              {!unlocked && (
                <span className="text-xs text-stone-400">{t('learning.lessonLocked')}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
