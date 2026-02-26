import { useGameStore } from '@/store/useGameStore'
import { useLossStore } from '@/store/useLossStore'
import { useLearningStore } from '@/store/useLearningStore'

export function PostGameSheet() {
  const gameResult = useGameStore((s) => s.gameResult)
  const opponentMode = useGameStore((s) => s.opponentMode)
  const resetGame = useGameStore((s) => s.resetGame)
  const startReview = useLearningStore((s) => s.startReview)
  const captureLoss = useLossStore((s) => s.captureLoss)

  if (gameResult === 'ongoing') return null

  // Player loses when playing against AI and black wins
  const isPlayerLoss = opponentMode !== 'pass-and-play' && gameResult === 'black_wins'

  const handleReview = () => {
    const lossId = captureLoss()
    if (lossId) {
      startReview(lossId)
    }
  }

  const handleLater = () => {
    captureLoss()
    resetGame()
  }

  const resultText = gameResult === 'red_wins' ? 'Red wins!' : 'Black wins!'
  const resultColor = gameResult === 'red_wins' ? 'text-red-700' : 'text-stone-800'

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white px-4 pb-6 pt-4 shadow-lg">
      <p className={`mb-4 text-center text-lg font-bold ${resultColor}`}>{resultText}</p>

      {isPlayerLoss ? (
        <div className="flex flex-col gap-2">
          <p className="mb-1 text-center text-sm text-stone-600">
            Want to see where it went wrong?
          </p>
          <button
            onClick={handleReview}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white active:bg-blue-700"
          >
            Review
          </button>
          <button
            onClick={handleLater}
            className="w-full rounded-lg bg-stone-100 py-2.5 text-sm font-semibold text-stone-700 active:bg-stone-200"
          >
            Later
          </button>
          <button
            onClick={resetGame}
            className="w-full rounded-lg bg-stone-100 py-2.5 text-sm font-semibold text-stone-700 active:bg-stone-200"
          >
            New Game
          </button>
        </div>
      ) : (
        <button
          onClick={resetGame}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white active:bg-blue-700"
        >
          New Game
        </button>
      )}
    </div>
  )
}
