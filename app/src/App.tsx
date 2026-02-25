import { useState } from 'react'
import { Board } from './components/Board'
import { TurnIndicator } from './components/TurnIndicator'
import { GameControls } from './components/GameControls'
import { ConfirmMoveBar } from './components/ConfirmMoveBar'
import { MoveHistory } from './components/MoveHistory'
import { Toast } from './components/Toast'
import { PieceInfoCard } from './components/PieceInfoCard'
import { CapturedPieces } from './components/CapturedPieces'
import { useGameStore } from './store/useGameStore'
import type { PieceType } from '@/types/game'

export default function App() {
  const [infoPiece, setInfoPiece] = useState<PieceType | null>(null)
  const flipped = useGameStore((s) => s.boardFlipped)

  // Top captures = pieces taken from the side at the top of the board
  // Normal: Black at top, so show Black's captured pieces at top
  // Flipped: Red at top, so show Red's captured pieces at top
  const topSide = flipped ? 'red' : 'black'
  const bottomSide = flipped ? 'black' : 'red'

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center bg-amber-50">
      <TurnIndicator />
      <CapturedPieces capturedFrom={topSide} />
      <Board onPieceInfo={(type) => setInfoPiece(type as PieceType)} />
      <CapturedPieces capturedFrom={bottomSide} />
      <GameControls />
      <ConfirmMoveBar />
      <MoveHistory />
      <Toast />
      {infoPiece && <PieceInfoCard pieceType={infoPiece} onClose={() => setInfoPiece(null)} />}
    </div>
  )
}
