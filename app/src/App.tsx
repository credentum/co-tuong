import { Board } from './components/Board'
import { TurnIndicator } from './components/TurnIndicator'
import { GameControls } from './components/GameControls'
import { ConfirmMoveBar } from './components/ConfirmMoveBar'
import { Toast } from './components/Toast'

export default function App() {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center bg-amber-50">
      <TurnIndicator />
      <Board />
      <GameControls />
      <ConfirmMoveBar />
      <Toast />
    </div>
  )
}
