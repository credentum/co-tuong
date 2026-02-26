import { useTranslation } from 'react-i18next'
import { usePatternCurriculumStore } from '@/store/usePatternCurriculumStore'
import { getPatternById } from '@/data/patternDefs'
import { PatternSelector } from './PatternSelector'
import { SeeItPlayer } from './SeeItPlayer'
import { PatternPuzzleView } from './PatternPuzzleView'

export function PatternsScreen() {
  const { t } = useTranslation()
  const currentPatternId = usePatternCurriculumStore((s) => s.currentPatternId)
  const currentStep = usePatternCurriculumStore((s) => s.currentStep)
  const backToSelector = usePatternCurriculumStore((s) => s.backToSelector)
  const exitPatterns = usePatternCurriculumStore((s) => s.exitPatterns)
  const completeSeeIt = usePatternCurriculumStore((s) => s.completeSeeIt)

  const pattern = currentPatternId ? getPatternById(currentPatternId) : null

  const handleBack = () => {
    if (currentPatternId) {
      backToSelector()
    } else {
      exitPatterns()
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2">
        <button onClick={handleBack} className="text-sm font-medium text-indigo-600">
          {currentPatternId ? t('patterns.backToSelector') : t('patterns.backToGame')}
        </button>
        {pattern ? (
          <span className="flex-1 truncate text-center text-sm font-semibold text-stone-700">
            {pattern.name}
          </span>
        ) : (
          <h1 className="text-sm font-bold text-stone-800">{t('patterns.title')}</h1>
        )}
        {pattern && <div className="w-16" />}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {currentStep === 'selector' && <PatternSelector />}
        {currentStep === 'see_it' && pattern && (
          <SeeItPlayer
            seeIt={pattern.seeIt}
            patternName={pattern.name}
            concept={pattern.concept}
            onComplete={() => completeSeeIt(pattern.patternId)}
          />
        )}
        {currentStep === 'puzzles' && <PatternPuzzleView />}
      </div>
    </div>
  )
}
