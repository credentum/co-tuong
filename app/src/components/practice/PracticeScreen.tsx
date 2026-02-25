import { useTranslation } from 'react-i18next'
import { useLearningStore } from '@/store/useLearningStore'
import { usePracticeStore } from '@/store/usePracticeStore'
import { PracticeDifficultyPicker } from './PracticeDifficultyPicker'
import { PracticePuzzleView } from './PracticePuzzleView'

export function PracticeScreen() {
  const { t } = useTranslation()
  const setAppMode = useLearningStore((s) => s.setAppMode)
  const difficulty = usePracticeStore((s) => s.difficulty)
  const exitPractice = usePracticeStore((s) => s.exitPractice)

  const handleBack = () => {
    if (difficulty) {
      exitPractice()
    } else {
      setAppMode('game')
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2">
        <button onClick={handleBack} className="text-sm font-medium text-red-600">
          {difficulty ? t('practice.backToPicker') : t('practice.backToGame')}
        </button>
        <h1 className="text-sm font-bold text-stone-800">{t('practice.title')}</h1>
      </div>

      {/* Content */}
      {difficulty ? <PracticePuzzleView /> : <PracticeDifficultyPicker />}
    </div>
  )
}
