import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'
import { useLearningStore } from '@/store/useLearningStore'

interface ActionBarProps {
  onOpenSettings: () => void
}

export function ActionBar({ onOpenSettings }: ActionBarProps) {
  const { t } = useTranslation()
  const undo = useGameStore((s) => s.undo)
  const resetGame = useGameStore((s) => s.resetGame)
  const historyIndex = useGameStore((s) => s.historyIndex)
  const setAppMode = useLearningStore((s) => s.setAppMode)
  const canUndo = historyIndex > 0

  const btnClass =
    'flex items-center justify-center rounded-lg p-2 text-stone-600 active:bg-stone-200 disabled:opacity-30'

  return (
    <div className="flex items-center justify-center gap-4 py-1">
      {/* Undo */}
      <button onClick={undo} disabled={!canUndo} className={btnClass} aria-label={t('game.undo')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V7.19c0-1.44-1.555-2.343-2.805-1.628L12 9.5v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
        </svg>
        <span className="sr-only">{t('game.undo')}</span>
      </button>

      {/* New Game */}
      <button onClick={resetGame} className={btnClass} aria-label={t('game.newGame')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903H14.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-1.5 0v4.956l-1.903-1.903A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.882a.75.75 0 0 0-.163.577 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h4.956a.75.75 0 0 0 0-1.5h-6a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.5 0v-4.956l1.902 1.903A9 9 0 0 0 20.694 14.33a.75.75 0 0 0-1.45-.388Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="sr-only">{t('game.newGame')}</span>
      </button>

      {/* Learn */}
      <button
        onClick={() => setAppMode('learning')}
        className={`${btnClass} text-red-600`}
        aria-label={t('learning.title')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.174v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
          <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.878 47.878 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.205 47.205 0 0 0-1.346-.808c-.349-.21-.57-.573-.57-.97v-.073a1.147 1.147 0 0 1 .854-1.108 48.394 48.394 0 0 0 2.538-.95ZM7.5 13.722v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 2.2-1.173A49.292 49.292 0 0 0 5.577 15.1a.75.75 0 0 1-.632-.38 48.25 48.25 0 0 1-.93-1.72.75.75 0 0 1 .374-.966 50.159 50.159 0 0 0 3.111-1.637Z" />
        </svg>
        <span className="sr-only">{t('learning.title')}</span>
      </button>

      {/* Settings */}
      <button onClick={onOpenSettings} className={btnClass} aria-label={t('game.settings')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.07c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="sr-only">{t('game.settings')}</span>
      </button>
    </div>
  )
}
