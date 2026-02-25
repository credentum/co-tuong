import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'

export function MoveHistory() {
  const { t } = useTranslation()
  const moveList = useGameStore((s) => s.moveList)
  const historyIndex = useGameStore((s) => s.historyIndex)
  const undo = useGameStore((s) => s.undo)
  const redo = useGameStore((s) => s.redo)
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < useGameStore((s) => s.history).length - 1

  if (moveList.length === 0 && !canUndo && !canRedo) return null

  // Group moves into pairs (red, black)
  const pairs: { num: number; red?: string; black?: string }[] = []
  for (let i = 0; i < moveList.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      red: moveList[i]?.wxf,
      black: moveList[i + 1]?.wxf,
    })
  }

  const btnClass =
    'rounded border border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-600 disabled:opacity-30'

  return (
    <div className="flex w-full max-w-md flex-col gap-1 px-2">
      <div className="flex items-center gap-2">
        <button onClick={undo} disabled={!canUndo} className={btnClass}>
          {t('game.undo')}
        </button>
        <button onClick={redo} disabled={!canRedo} className={btnClass}>
          {t('game.redo')}
        </button>
        <div className="flex flex-1 gap-x-3 overflow-x-auto text-xs text-stone-600">
          {pairs.slice(-5).map((p) => (
            <span key={p.num} className="shrink-0">
              <span className="text-stone-400">{p.num}.</span>{' '}
              <span className="text-red-700">{p.red}</span>
              {p.black && <span className="ml-1 text-stone-800">{p.black}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
