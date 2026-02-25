import { useState } from 'react'
import { Board } from './components/Board'
import { TurnIndicator } from './components/TurnIndicator'
import { GameControls } from './components/GameControls'
import { ConfirmMoveBar } from './components/ConfirmMoveBar'
import { MoveHistory } from './components/MoveHistory'
import { Toast } from './components/Toast'
import { PieceInfoCard } from './components/PieceInfoCard'
import { CapturedPieces } from './components/CapturedPieces'
import { LearningScreen } from './components/learning/LearningScreen'
import { useGameStore } from './store/useGameStore'
import { useLearningStore } from './store/useLearningStore'
import type { PieceType } from '@/types/game'

export default function App() {
  const [infoPiece, setInfoPiece] = useState<PieceType | null>(null)
  const flipped = useGameStore((s) => s.boardFlipped)
  const appMode = useLearningStore((s) => s.appMode)

  if (appMode === 'learning') {
    return <LearningScreen />
  }

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
