import { useState, useCallback, useRef } from 'react'
import { BoardRenderer } from '../BoardRenderer'
import { useLearningStore } from '@/store/useLearningStore'
import { useLossStore } from '@/store/useLossStore'
import { fenToBoard } from '@/lib/fen'
import { getFullyLegalMoves, getGameResult, type GameResult } from '@/lib/moves/legality'
import { posEq } from '@/lib/moves/helpers'
import { getRandomBotMove } from '@/lib/bot'
import { getMinimaxMove, getMediumMove } from '@/lib/ai'
import type { Piece, Position, Side } from '@/types/game'
import type { OpponentMode } from '@/store/useGameStore'

interface BoardSnapshot {
  pieces: Piece[]
  currentTurn: Side
}

function applyMove(pieces: Piece[], from: Position, to: Position): Piece[] {
  return pieces
    .filter((p) => !posEq(p.position, to))
    .map((p) => (posEq(p.position, from) ? { ...p, position: to } : p))
}

function getAiMove(pieces: Piece[], side: Side, mode: OpponentMode) {
  if (mode === 'minimax') return getMinimaxMove(pieces, side, 2)
  if (mode === 'medium') return getMediumMove(pieces, side)
  return getRandomBotMove(pieces, side)
}

export function ReviewScreen() {
  const reviewLossId = useLearningStore((s) => s.reviewLossId)
  const setAppMode = useLearningStore((s) => s.setAppMode)
  const losses = useLossStore((s) => s.losses)
  const markReviewed = useLossStore((s) => s.markReviewed)

  const loss = losses.find((l) => l.id === reviewLossId)

  // Parse initial position
  const initial = loss ? fenToBoard(loss.fen) : null

  const [pieces, setPieces] = useState<Piece[]>(initial?.pieces ?? [])
  const [currentTurn, setCurrentTurn] = useState<Side>(initial?.currentTurn ?? 'red')
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [legalMoves, setLegalMoves] = useState<Position[]>([])
  const [gameResult, setGameResult] = useState<GameResult>('ongoing')
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null)
  const [history, setHistory] = useState<BoardSnapshot[]>(
    initial ? [{ pieces: initial.pieces, currentTurn: initial.currentTurn }] : [],
  )

  const aiPendingRef = useRef(false)

  const playerSide = 'red' as Side
  const aiDifficulty = loss?.aiDifficulty ?? 'medium'

  const executeMove = useCallback(
    (from: Position, to: Position, pcs: Piece[], turn: Side) => {
      const newPieces = applyMove(pcs, from, to)
      const nextTurn: Side = turn === 'red' ? 'black' : 'red'
      const result = getGameResult(newPieces, nextTurn)

      setPieces(newPieces)
      setCurrentTurn(nextTurn)
      setGameResult(result)
      setSelectedPosition(null)
      setLegalMoves([])
      setLastMove({ from, to })
      setHistory((h) => [...h, { pieces: newPieces, currentTurn: nextTurn }])

      // Schedule AI move if it's AI's turn and game is ongoing
      if (result === 'ongoing' && nextTurn !== playerSide) {
        aiPendingRef.current = true
        setTimeout(() => {
          if (!aiPendingRef.current) return
          aiPendingRef.current = false
          const aiMove = getAiMove(newPieces, nextTurn, aiDifficulty)
          if (!aiMove) return

          const afterAi = applyMove(newPieces, aiMove.from, aiMove.to)
          const turnAfterAi: Side = nextTurn === 'red' ? 'black' : 'red'
          const resultAfterAi = getGameResult(afterAi, turnAfterAi)

          setPieces(afterAi)
          setCurrentTurn(turnAfterAi)
          setGameResult(resultAfterAi)
          setLastMove({ from: aiMove.from, to: aiMove.to })
          setHistory((h) => [...h, { pieces: afterAi, currentTurn: turnAfterAi }])
        }, 400)
      }
    },
    [aiDifficulty, playerSide],
  )

  const handleTapSquare = useCallback(
    (pos: Position) => {
      if (gameResult !== 'ongoing') return
      if (currentTurn !== playerSide) return

      const tappedPiece = pieces.find((p) => posEq(p.position, pos))

      if (!selectedPosition) {
        if (tappedPiece && tappedPiece.side === playerSide) {
          const moves = getFullyLegalMoves(tappedPiece, pieces)
          setSelectedPosition(pos)
          setLegalMoves(moves)
        }
        return
      }

      if (posEq(selectedPosition, pos)) {
        setSelectedPosition(null)
        setLegalMoves([])
        return
      }

      if (tappedPiece && tappedPiece.side === playerSide) {
        const moves = getFullyLegalMoves(tappedPiece, pieces)
        setSelectedPosition(pos)
        setLegalMoves(moves)
        return
      }

      if (legalMoves.some((m) => posEq(m, pos))) {
        executeMove(selectedPosition, pos, pieces, currentTurn)
      } else {
        setSelectedPosition(null)
        setLegalMoves([])
      }
    },
    [pieces, currentTurn, selectedPosition, legalMoves, gameResult, playerSide, executeMove],
  )

  const handleUndo = () => {
    // Undo back to last player move (undo AI + player move = 2 steps)
    aiPendingRef.current = false
    const stepsBack = history.length >= 3 ? 2 : history.length >= 2 ? 1 : 0
    if (stepsBack === 0) return

    const targetIdx = history.length - 1 - stepsBack
    const snapshot = history[targetIdx]!
    setPieces(snapshot.pieces)
    setCurrentTurn(snapshot.currentTurn)
    setGameResult('ongoing')
    setSelectedPosition(null)
    setLegalMoves([])
    setLastMove(null)
    setHistory(history.slice(0, targetIdx + 1))
  }

  const handleBack = () => {
    if (loss) markReviewed(loss.id)
    setAppMode('game')
  }

  if (!loss || !initial) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4">
        <p className="text-stone-500">Loss not found</p>
        <button
          onClick={() => setAppMode('game')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Game
        </button>
      </div>
    )
  }

  const resultText =
    gameResult === 'red_wins'
      ? 'You won! Nice recovery!'
      : gameResult === 'black_wins'
        ? 'Black wins again'
        : null

  return (
    <div className="flex h-[100dvh] flex-col items-center">
      {/* Header */}
      <div className="flex w-full items-center gap-3 px-4 py-2">
        <button onClick={handleBack} className="text-sm text-blue-600 font-semibold">
          &larr; Back
        </button>
        <h1 className="flex-1 text-center text-sm font-bold text-stone-800">Review</h1>
        <div className="w-12" />
      </div>

      {/* Turn indicator */}
      <div className="flex items-center gap-2 py-1">
        {resultText ? (
          <span
            className={`text-sm font-bold ${gameResult === 'red_wins' ? 'text-green-700' : 'text-stone-700'}`}
          >
            {resultText}
          </span>
        ) : (
          <>
            <span
              className={`inline-block h-3 w-3 rounded-full ${currentTurn === 'red' ? 'bg-red-600' : 'bg-stone-800'}`}
            />
            <span
              className={`text-sm font-semibold ${currentTurn === 'red' ? 'text-red-700' : 'text-stone-800'}`}
            >
              {currentTurn === 'red' ? 'Your turn' : 'AI thinking...'}
            </span>
          </>
        )}
      </div>

      {/* Board */}
      <BoardRenderer
        pieces={pieces}
        selectedPosition={selectedPosition}
        legalMoves={legalMoves}
        lastMove={lastMove}
        onTapSquare={handleTapSquare}
      />

      {/* Controls */}
      <div className="flex w-full max-w-md items-center justify-center gap-3 px-4 py-3">
        <button
          onClick={handleUndo}
          disabled={history.length <= 1}
          className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40 active:bg-stone-200"
        >
          Undo
        </button>
        {gameResult !== 'ongoing' && (
          <button
            onClick={handleBack}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white active:bg-blue-700"
          >
            Done
          </button>
        )}
      </div>

      {/* Prompt */}
      <p className="px-4 text-center text-xs text-stone-500">
        This is where things went wrong. Try a different approach.
      </p>
    </div>
  )
}
