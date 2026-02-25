import { useState } from 'react'
import { Board } from './components/Board'
import { TurnIndicator } from './components/TurnIndicator'
import { GameControls } from './components/GameControls'
import { ConfirmMoveBar } from './components/ConfirmMoveBar'
import { MoveHistory } from './components/MoveHistory'
import { Toast } from './components/Toast'
import { PieceInfoCard } from './components/PieceInfoCard'
import type { PieceType } from '@/types/game'

export default function App() {
  const [infoPiece, setInfoPiece] = useState<PieceType | null>(null)

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center bg-amber-50">
      <TurnIndicator />
      <Board onPieceInfo={(type) => setInfoPiece(type as PieceType)} />
      <GameControls />
      <ConfirmMoveBar />
      <MoveHistory />
      <Toast />
      {infoPiece && <PieceInfoCard pieceType={infoPiece} onClose={() => setInfoPiece(null)} />}
    </div>
  )
}
