import { useState } from 'react'
import { Board } from './components/Board'
import { TurnIndicator } from './components/TurnIndicator'
import { ActionBar } from './components/ActionBar'
import { SettingsPanel } from './components/SettingsPanel'
import { Toast } from './components/Toast'
import { PieceInfoCard } from './components/PieceInfoCard'
import { LearningScreen } from './components/learning/LearningScreen'
import { useLearningStore } from './store/useLearningStore'
import type { PieceType } from '@/types/game'

export default function App() {
  const [infoPiece, setInfoPiece] = useState<PieceType | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const appMode = useLearningStore((s) => s.appMode)

  if (appMode === 'learning') {
    return <LearningScreen />
  }

  return (
    <div className="flex h-[100dvh] flex-col items-center">
      <TurnIndicator />
      <Board onPieceInfo={(type) => setInfoPiece(type as PieceType)} />
      <ActionBar onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Toast />
      {infoPiece && <PieceInfoCard pieceType={infoPiece} onClose={() => setInfoPiece(null)} />}
    </div>
  )
}
