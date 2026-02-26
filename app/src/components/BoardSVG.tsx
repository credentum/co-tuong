import { useMemo, useCallback } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { useLearningStore } from '@/store/useLearningStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { posEq } from '@/lib/moves/helpers'
import { BoardRenderer } from './BoardRenderer'
import type { PieceType } from '@/types/game'

interface BoardSVGProps {
  onPieceInfo?: (type: string) => void
}

export function BoardSVG({ onPieceInfo }: BoardSVGProps) {
  const pieces = useGameStore((s) => s.pieces)
  const selectedPosition = useGameStore((s) => s.selectedPosition)
  const legalMoves = useGameStore((s) => s.legalMoves)
  const selectPosition = useGameStore((s) => s.selectPosition)
  const flipped = useGameStore((s) => s.boardFlipped)
  const lastMove = useGameStore((s) => s.lastMove)
  const aiHighlightPos = useGameStore((s) => s.aiHighlightPos)
  const displayMode = useLearningStore((s) => s.displayMode)
  const dotMode = usePlayerStore((s) => s.dotMode)
  const mastery = usePlayerStore((s) => s.mastery)
  const showDotsOverride = usePlayerStore((s) => s.showDotsOverride)

  // Compute effective legal moves for dot display
  const effectiveLegalMoves = useMemo(() => {
    if (dotMode === 'always') return legalMoves
    if (dotMode === 'off') return []
    if (dotMode === 'on_request') return showDotsOverride ? legalMoves : []

    // adaptive mode
    if (!selectedPosition || legalMoves.length === 0) return legalMoves
    if (showDotsOverride) return legalMoves

    const selectedPiece = pieces.find((p) => posEq(p.position, selectedPosition))
    if (!selectedPiece) return legalMoves

    const m = mastery[selectedPiece.type as PieceType]
    if (m && m.graduated && m.recoveryGamesLeft === 0) return []
    return legalMoves
  }, [dotMode, legalMoves, selectedPosition, pieces, mastery, showDotsOverride])

  const handleLongPress = useCallback(
    (type: string) => {
      onPieceInfo?.(type)
      if (dotMode === 'adaptive' || dotMode === 'on_request') {
        usePlayerStore.getState().setShowDotsOverride(true)
      }
    },
    [onPieceInfo, dotMode],
  )

  return (
    <BoardRenderer
      pieces={pieces}
      selectedPosition={selectedPosition}
      legalMoves={effectiveLegalMoves}
      lastMove={lastMove}
      aiHighlightPos={aiHighlightPos}
      onTapSquare={selectPosition}
      onLongPressPiece={handleLongPress}
      flipped={flipped}
      labelMode={displayMode}
    />
  )
}
