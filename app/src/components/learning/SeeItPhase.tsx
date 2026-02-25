import { useTranslation } from 'react-i18next'
import { useLearningStore } from '@/store/useLearningStore'
import { LESSONS } from '@/data/lessons'
import { BoardRenderer } from '../BoardRenderer'
import { getFullyLegalMoves } from '@/lib/moves/legality'
import type { Piece, PieceType, Position } from '@/types/game'
import { useMemo } from 'react'

export function SeeItPhase() {
  const { t } = useTranslation()
  const currentLesson = useLearningStore((s) => s.currentLesson)
  const setPhase = useLearningStore((s) => s.setPhase)
  const completePhase = useLearningStore((s) => s.completePhase)

  const lesson = LESSONS.find((l) => l.lessonId === currentLesson)

  const demoPieces: Piece[] = useMemo(() => {
    if (!lesson) return []
    const type = lesson.pieceFocus[0]! as PieceType
    const all: Piece[] = [
      { type, side: 'red' as const, position: { col: 4, row: 4 } },
      { type: 'tuong' as const, side: 'red' as const, position: { col: 4, row: 0 } },
      { type: 'tuong' as const, side: 'black' as const, position: { col: 4, row: 9 } },
    ]
    return all.filter(
      (p, i, arr) =>
        arr.findIndex(
          (a) => a.position.col === p.position.col && a.position.row === p.position.row,
        ) === i,
    )
  }, [lesson])

  const demoMoves: Position[] = useMemo(() => {
    if (demoPieces.length === 0) return []
    const focusPiece = demoPieces[0]!
    return getFullyLegalMoves(focusPiece, demoPieces)
  }, [demoPieces])

  if (!lesson) return null

  const { seeIt, cafeContext } = lesson

  const handleGotIt = () => {
    if (currentLesson) {
      completePhase(currentLesson, 'see_it')
      setPhase('test_it')
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      {/* Character display */}
      <div className="flex items-center justify-center gap-4 pt-2">
        {seeIt.characterDisplay.map((char, i) => (
          <div
            key={i}
            className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-2xl font-bold ${
              i % 2 === 0
                ? 'border-red-600 bg-red-50 text-red-600'
                : 'border-stone-800 bg-stone-50 text-stone-800'
            }`}
          >
            {char}
          </div>
        ))}
      </div>

      {/* Name + pronunciation */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-stone-800">{seeIt.name}</h2>
        <p className="text-sm text-stone-500">{seeIt.pronunciationHint}</p>
      </div>

      {/* Board demo showing movement */}
      <div className="mx-auto w-full max-w-xs">
        <BoardRenderer
          pieces={demoPieces}
          selectedPosition={demoPieces[0]?.position ?? null}
          legalMoves={demoMoves}
          onTapSquare={() => {}}
        />
      </div>

      {/* Tips */}
      <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
        <p className="text-sm text-stone-700">{seeIt.realWorldTip}</p>
        <p className="text-xs leading-relaxed text-stone-500 italic">{seeIt.culturalNote}</p>
      </div>

      {/* Café context */}
      <p className="text-xs leading-relaxed text-stone-500">{cafeContext}</p>

      {/* Got it button */}
      <button
        onClick={handleGotIt}
        className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white active:bg-red-700"
      >
        {t('learning.gotIt')}
      </button>
    </div>
  )
}
