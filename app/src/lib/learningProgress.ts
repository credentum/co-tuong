import type { LeitnerBox, LessonProgress, PuzzleProgress } from '@/types/learning'

const STORAGE_KEY = 'cotuong_learning'

export interface StoredProgress {
  lessonProgress: LessonProgress[]
  puzzleProgress: PuzzleProgress[]
  sessionCount: number
}

const DEFAULT_PROGRESS: StoredProgress = {
  lessonProgress: [],
  puzzleProgress: [],
  sessionCount: 0,
}

function canUseLocalStorage(): boolean {
  try {
    const key = '__test__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function loadProgress(): StoredProgress {
  if (!canUseLocalStorage()) return DEFAULT_PROGRESS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROGRESS
    return JSON.parse(raw) as StoredProgress
  } catch {
    return DEFAULT_PROGRESS
  }
}

export function saveProgress(data: StoredProgress): void {
  if (!canUseLocalStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Safari private browsing may throw
  }
}

export function advanceBox(current: LeitnerBox): LeitnerBox {
  if (current >= 4) return 4
  return (current + 1) as LeitnerBox
}

export function resetBox(): LeitnerBox {
  return 1
}

// Review intervals: Box 1 = same/next session, Box 2 = +2 sessions, Box 3 = +5 sessions, Box 4 = retired
const REVIEW_INTERVALS: Record<LeitnerBox, number> = { 1: 0, 2: 2, 3: 5, 4: Infinity }

export function shouldReview(puzzle: PuzzleProgress, currentSession: number): boolean {
  if (puzzle.box >= 4) return false
  const interval = REVIEW_INTERVALS[puzzle.box]
  return currentSession - puzzle.lastAttemptSession >= interval
}

export function getReviewPuzzles(
  progress: PuzzleProgress[],
  currentSession: number,
  limit: number,
): string[] {
  return progress
    .filter((p) => shouldReview(p, currentSession))
    .sort((a, b) => a.box - b.box) // lowest box first
    .slice(0, limit)
    .map((p) => p.puzzleId)
}
