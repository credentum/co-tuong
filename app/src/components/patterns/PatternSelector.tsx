import { useTranslation } from 'react-i18next'
import { usePatternCurriculumStore } from '@/store/usePatternCurriculumStore'
import { PATTERN_DEFS, getPatternsByLevel } from '@/data/patternDefs'

export function PatternSelector() {
  const { t } = useTranslation()
  const selectPattern = usePatternCurriculumStore((s) => s.selectPattern)
  const isPatternUnlocked = usePatternCurriculumStore((s) => s.isPatternUnlocked)
  const isPatternComplete = usePatternCurriculumStore((s) => s.isPatternComplete)
  const getCompletion = usePatternCurriculumStore((s) => s.getCompletion)

  const survivalPatterns = getPatternsByLevel('survival')
  const attackPatterns = getPatternsByLevel('attack')

  const handleTap = (patternId: number) => {
    if (isPatternUnlocked(patternId)) {
      selectPattern(patternId)
    }
  }

  const renderPatternCard = (patternId: number, name: string, vietnamese: string) => {
    const unlocked = isPatternUnlocked(patternId)
    const complete = isPatternComplete(patternId)
    const completion = getCompletion(patternId)

    return (
      <button
        key={patternId}
        onClick={() => handleTap(patternId)}
        className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
          complete
            ? 'border-green-300 bg-green-50'
            : unlocked
              ? 'border-indigo-200 bg-white active:bg-indigo-50'
              : 'border-stone-200 bg-stone-50 opacity-50'
        }`}
      >
        {/* Number badge */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            complete
              ? 'bg-green-600 text-white'
              : unlocked
                ? 'bg-indigo-600 text-white'
                : 'bg-stone-300 text-stone-500'
          }`}
        >
          {complete ? '✓' : patternId}
        </div>

        {/* Name + progress */}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              unlocked ? 'text-stone-800' : 'text-stone-400'
            }`}
          >
            {name}
          </p>
          <p className={`text-xs ${unlocked ? 'text-stone-500' : 'text-stone-400'}`}>
            {vietnamese}
          </p>
        </div>

        {/* Progress or lock */}
        <div className="shrink-0 text-right">
          {complete ? (
            <span className="text-xs font-medium text-green-600">{t('patterns.complete')}</span>
          ) : unlocked ? (
            <span className="text-xs text-stone-500">
              {t('patterns.progress', { solved: completion.puzzlesSolved })}
            </span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-stone-400"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-6 px-4 pb-6">
      {/* Survival section */}
      {survivalPatterns.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-base font-bold text-stone-800">{t('patterns.survival')}</h2>
            <p className="text-xs text-stone-500">{t('patterns.survivalSubtitle')}</p>
          </div>
          <div className="space-y-2">
            {survivalPatterns.map((p) => renderPatternCard(p.patternId, p.name, p.vietnamese))}
          </div>
        </section>
      )}

      {/* Attack section */}
      {attackPatterns.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-base font-bold text-stone-800">{t('patterns.attack')}</h2>
            <p className="text-xs text-stone-500">{t('patterns.attackSubtitle')}</p>
          </div>
          <div className="space-y-2">
            {attackPatterns.map((p) => renderPatternCard(p.patternId, p.name, p.vietnamese))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {PATTERN_DEFS.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm text-stone-500">Patterns coming soon!</p>
          <p className="text-xs text-stone-400">Complete your Learn lessons to prepare.</p>
        </div>
      )}
    </div>
  )
}
