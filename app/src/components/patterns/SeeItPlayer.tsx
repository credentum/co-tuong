import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BoardRenderer } from '../BoardRenderer'
import { useLearningStore } from '@/store/useLearningStore'
import type { SeeItDef } from '@/types/patterns'
import type { Piece, Position } from '@/types/game'

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !(p.position.col === to.col && p.position.row === to.row))
    .map((p) =>
      p.position.col === from.col && p.position.row === from.row ? { ...p, position: to } : p,
    )
}

interface SeeItPlayerProps {
  seeIt: SeeItDef
  patternName: string
  concept: string
  onComplete: () => void
}

export function SeeItPlayer({ seeIt, patternName, concept, onComplete }: SeeItPlayerProps) {
  const { t } = useTranslation()
  const displayMode = useLearningStore((s) => s.displayMode)

  const [moveIndex, setMoveIndex] = useState(-1) // -1 = initial position, no moves played
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Compute pieces at current move index
  const currentPieces = (() => {
    let pieces = [...seeIt.startingPieces]
    for (let i = 0; i <= moveIndex && i < seeIt.moves.length; i++) {
      const move = seeIt.moves[i]!
      pieces = applyMove(pieces, move.from, move.to)
    }
    return pieces
  })()

  // Last move highlight
  const lastMove = moveIndex >= 0 && moveIndex < seeIt.moves.length ? seeIt.moves[moveIndex]! : null

  // Current annotation
  const annotation =
    moveIndex >= 0 && moveIndex < seeIt.annotations.length
      ? seeIt.annotations[moveIndex]!.text
      : null

  const isAtEnd = moveIndex >= seeIt.moves.length - 1
  const isAtStart = moveIndex < 0

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const stepForward = useCallback(() => {
    setMoveIndex((prev) => {
      const next = prev + 1
      if (next >= seeIt.moves.length) {
        stopTimer()
        return seeIt.moves.length - 1
      }
      return next
    })
  }, [seeIt.moves.length, stopTimer])

  const stepBack = useCallback(() => {
    stopTimer()
    setMoveIndex((prev) => Math.max(-1, prev - 1))
  }, [stopTimer])

  const restart = useCallback(() => {
    stopTimer()
    setMoveIndex(-1)
  }, [stopTimer])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopTimer()
      return
    }
    // If at end, restart first
    if (isAtEnd) {
      setMoveIndex(-1)
    }
    setIsPlaying(true)
  }, [isPlaying, isAtEnd, stopTimer])

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return
    // Start playing after a short initial delay
    const timer = setInterval(() => {
      setMoveIndex((prev) => {
        const next = prev + 1
        if (next >= seeIt.moves.length) {
          setIsPlaying(false)
          return seeIt.moves.length - 1
        }
        return next
      })
    }, 1500)
    timerRef.current = timer
    // Play first move immediately if at start
    if (moveIndex < 0) {
      setMoveIndex(0)
    }
    return () => clearInterval(timer)
  }, [isPlaying, seeIt.moves.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      {/* Pattern name + concept */}
      <div className="px-4 pb-2">
        <h2 className="text-center text-sm font-bold text-stone-800">{patternName}</h2>
        <p className="mt-1 text-center text-xs leading-relaxed text-stone-500">{concept}</p>
      </div>

      {/* Board */}
      <div className="relative flex w-full max-w-lg flex-1 items-center justify-center self-center px-1">
        <BoardRenderer
          pieces={currentPieces}
          selectedPosition={null}
          legalMoves={[]}
          lastMove={lastMove ? { from: lastMove.from, to: lastMove.to } : undefined}
          onTapSquare={() => {}}
          labelMode={displayMode}
        />
      </div>

      {/* Annotation */}
      <div className="min-h-[3rem] px-4 py-2">
        {annotation ? (
          <p className="text-center text-sm leading-relaxed text-stone-700">{annotation}</p>
        ) : (
          <p className="text-center text-xs text-stone-400">
            {isAtStart ? 'Press play to watch the pattern' : ''}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-center gap-3">
          {/* Restart */}
          <button
            onClick={restart}
            disabled={isAtStart}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 disabled:opacity-30"
          >
            {t('patterns.restart')}
          </button>

          {/* Step back */}
          <button
            onClick={stepBack}
            disabled={isAtStart}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 disabled:opacity-30"
          >
            ←
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="rounded-lg bg-indigo-600 px-5 py-1.5 text-sm font-medium text-white active:bg-indigo-700"
          >
            {isPlaying ? t('patterns.pause') : t('patterns.play')}
          </button>

          {/* Step forward */}
          <button
            onClick={stepForward}
            disabled={isAtEnd}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 disabled:opacity-30"
          >
            →
          </button>
        </div>

        {/* Start puzzles button — visible after watching */}
        {isAtEnd && !isPlaying && (
          <button
            onClick={onComplete}
            className="mt-3 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white active:bg-indigo-700"
          >
            {t('patterns.startPuzzles')}
          </button>
        )}
      </div>
    </div>
  )
}
