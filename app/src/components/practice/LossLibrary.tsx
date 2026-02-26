import { useLossStore } from '@/store/useLossStore'
import { useLearningStore } from '@/store/useLearningStore'
import { usePracticeStore } from '@/store/usePracticeStore'
import { lossToPuzzle } from '@/lib/lossToPuzzle'
import type { SavedLoss } from '@/types/loss'

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function difficultyLabel(mode: string): string {
  const labels: Record<string, string> = {
    'random-bot': 'Easy',
    medium: 'Medium',
    minimax: 'Hard',
  }
  return labels[mode] ?? mode
}

function LossEntry({
  loss,
  onReview,
  onDelete,
  onConvert,
}: {
  loss: SavedLoss
  onReview: () => void
  onDelete: () => void
  onConvert: () => void
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        loss.reviewed ? 'border-stone-200 bg-white' : 'border-blue-200 bg-blue-50'
      }`}
    >
      <button onClick={onReview} className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-800">{formatDate(loss.timestamp)}</span>
          {!loss.reviewed && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
              New
            </span>
          )}
          {loss.convertedToPuzzle && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
              Puzzle
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-stone-500">
          vs {difficultyLabel(loss.aiDifficulty)} AI
          {loss.reviewed ? ' — reviewed' : ''}
        </div>
        {loss.turningPointDrop != null ? (
          <div className="mt-0.5 text-xs text-red-500">
            Lost {loss.turningPointDrop} points on a single move
          </div>
        ) : loss.evalHistory && loss.evalHistory.length > 0 ? (
          <div className="mt-0.5 text-xs text-stone-400">Position near game end</div>
        ) : null}
      </button>
      <div className="ml-3 flex gap-1">
        {!loss.convertedToPuzzle && (
          <button
            onClick={onConvert}
            className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 active:bg-amber-100"
          >
            To Puzzle
          </button>
        )}
        <button
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs text-stone-400 active:bg-stone-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export function LossLibrary({ onBack }: { onBack: () => void }) {
  const losses = useLossStore((s) => s.losses)
  const deleteLoss = useLossStore((s) => s.deleteLoss)
  const markConverted = useLossStore((s) => s.markConverted)
  const startReview = useLearningStore((s) => s.startReview)
  const addLossPuzzle = usePracticeStore((s) => s.addLossPuzzle)

  const handleConvert = (loss: SavedLoss) => {
    const puzzle = lossToPuzzle(loss)
    if (!puzzle) return
    addLossPuzzle(puzzle)
    markConverted(loss.id)
  }

  // Sort: most recent first, unreviewed on top
  const sorted = [...losses].sort((a, b) => {
    if (a.reviewed !== b.reviewed) return a.reviewed ? 1 : -1
    return b.timestamp - a.timestamp
  })

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 py-2">
      <button onClick={onBack} className="self-start text-sm font-medium text-blue-600">
        &larr; Back
      </button>
      <h2 className="text-lg font-bold text-stone-800">My Mistakes</h2>

      {sorted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-stone-500">
          No saved losses yet. Play against the AI and your mistakes will appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {sorted.map((loss) => (
            <LossEntry
              key={loss.id}
              loss={loss}
              onReview={() => startReview(loss.id)}
              onDelete={() => deleteLoss(loss.id)}
              onConvert={() => handleConvert(loss)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
