import { useState, useEffect } from 'react'
import { useGameStore, getEvalHistory, getAiBlunderCount } from '@/store/useGameStore'
import { useLossStore } from '@/store/useLossStore'
import { useLearningStore } from '@/store/useLearningStore'
import { usePatternStore } from '@/store/usePatternStore'
import { analyzeGame } from '@/lib/analysis'
import { fenToBoard } from '@/lib/fen'
import { PATTERN_DESCRIPTIONS } from '@/lib/patternPuzzleMap'
import { MiniBoardSVG } from './MiniBoardSVG'
import type { GameAnalysis, AnalyzedMistake, MistakeCategory } from '@/types/analysis'

function AnalysisCard({ mistake, onReplay }: { mistake: AnalyzedMistake; onReplay: () => void }) {
  const { pieces } = fenToBoard(mistake.snapshot.fenBefore)
  return (
    <div className="flex gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <MiniBoardSVG
        pieces={pieces}
        highlightSquares={mistake.highlightSquares}
        className="h-24 w-24 flex-shrink-0 rounded-lg"
      />
      <div className="flex flex-1 flex-col justify-between">
        <p className="text-xs leading-tight text-stone-700">{mistake.description}</p>
        <button
          onClick={onReplay}
          className="mt-2 self-start rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-blue-700"
        >
          Replay
        </button>
      </div>
    </div>
  )
}

export function PostGameSheet() {
  const gameResult = useGameStore((s) => s.gameResult)
  const opponentMode = useGameStore((s) => s.opponentMode)
  const resetGame = useGameStore((s) => s.resetGame)
  const startReview = useLearningStore((s) => s.startReview)
  const startReviewFromFen = useLearningStore((s) => s.startReviewFromFen)
  const captureLoss = useLossStore((s) => s.captureLoss)

  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null)

  const isAiGame = opponentMode !== 'pass-and-play'
  const isPlayerLoss = isAiGame && gameResult === 'black_wins'

  const [patternAlerts, setPatternAlerts] = useState<MistakeCategory[]>([])
  const [resolvedPatterns, setResolvedPatterns] = useState<MistakeCategory[]>([])

  useEffect(() => {
    if (gameResult === 'ongoing') {
      setAnalysis(null)
      setPatternAlerts([])
      setResolvedPatterns([])
      return
    }
    if (!isAiGame) return

    const snapshots = getEvalHistory()
    const blunders = getAiBlunderCount()
    const id = setTimeout(() => {
      const result = analyzeGame(snapshots, blunders)
      setAnalysis(result)

      // Record game for pattern tracking
      const categories = result.isCleanGame ? [] : result.mistakes.map((m) => m.category)
      const patternStore = usePatternStore.getState()
      patternStore.recordGame(categories)

      // Check for active patterns triggered this game
      const triggered = patternStore.getNewlyTriggered(categories)
      setPatternAlerts(triggered)
      triggered.forEach((cat) => patternStore.markShown(cat))

      // Check for newly resolved patterns
      setResolvedPatterns(patternStore.getNewlyResolved())
    }, 0)
    return () => clearTimeout(id)
  }, [gameResult, isAiGame])

  if (gameResult === 'ongoing') return null

  const handleReview = () => {
    const lossId = captureLoss()
    if (lossId) startReview(lossId)
  }

  const handleLater = () => {
    captureLoss()
    resetGame()
  }

  const handleReplay = (fen: string) => {
    if (isPlayerLoss) captureLoss()
    startReviewFromFen(fen, opponentMode)
  }

  const resultText = gameResult === 'red_wins' ? 'Red wins!' : 'Black wins!'
  const resultColor = gameResult === 'red_wins' ? 'text-red-700' : 'text-stone-800'

  // Analysis header text
  let analysisHeader = ''
  if (analysis && !analysis.isCleanGame) {
    analysisHeader = isPlayerLoss
      ? "Here's where things went wrong"
      : 'Nice win! One moment you could have played better'
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-6 pt-4 shadow-lg">
      <p className={`mb-3 text-center text-lg font-bold ${resultColor}`}>{resultText}</p>

      {/* Analysis section — AI games only */}
      {isAiGame && (
        <div className="mb-3">
          {analysis === null ? (
            <p className="text-center text-sm text-stone-400">Analysing...</p>
          ) : analysis.isCleanGame ? (
            analysis.aiBlunders > 0 && gameResult === 'red_wins' ? (
              <p className="text-center text-sm font-medium text-green-700">
                Nice win — but the opponent missed some opportunities. Try Hard for a tougher
                challenge.
              </p>
            ) : (
              <p className="text-center text-sm font-medium text-green-700">
                Clean game! No significant mistakes.
              </p>
            )
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-stone-700">{analysisHeader}</p>
              {analysis.mistakes.map((mistake) => (
                <AnalysisCard
                  key={mistake.rank}
                  mistake={mistake}
                  onReplay={() => handleReplay(mistake.snapshot.fenBefore)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pattern alerts */}
      {patternAlerts.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {patternAlerts.map((cat) => {
            const entry = usePatternStore.getState().patterns[cat]
            const games = entry.lastGames ?? entry.last5Games ?? []
            const n = games.filter(Boolean).length
            const m = games.length
            const desc = PATTERN_DESCRIPTIONS[cat]
            return (
              <div key={cat} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-800">
                  {desc.alert.replace('{{n}}', String(n)).replace('{{m}}', String(m))}
                </p>
                <p className="mt-1 text-xs text-amber-700">{desc.suggestion}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Resolved pattern congratulations */}
      {resolvedPatterns.length > 0 && (
        <div className="mb-3">
          {resolvedPatterns.map((cat) => (
            <p key={cat} className="text-center text-sm font-medium text-green-700">
              Great improvement! You haven&apos;t made that mistake in 5 games.
            </p>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {isPlayerLoss && (
          <>
            <button
              onClick={handleReview}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white active:bg-blue-700"
            >
              Review Full Game
            </button>
            <button
              onClick={handleLater}
              className="w-full rounded-lg bg-stone-100 py-2.5 text-sm font-semibold text-stone-700 active:bg-stone-200"
            >
              Later
            </button>
          </>
        )}
        <button
          onClick={resetGame}
          className="w-full rounded-lg bg-stone-100 py-2.5 text-sm font-semibold text-stone-700 active:bg-stone-200"
        >
          New Game
        </button>
      </div>
    </div>
  )
}
