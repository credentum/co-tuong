import type { MistakeCategory } from '@/types/analysis'

/** Map puzzle concepts to the mistake categories they help address */
const CONCEPT_TO_PATTERN: Record<string, MistakeCategory[]> = {
  cannon_screen: ['cannon_screen_missed'],
  horse_fork: ['early_horse_loss', 'hung_piece'],
  pin: ['broke_pin'],
  checkmate_in_1: ['missed_checkmate'],
  checkmate_in_2: ['missed_checkmate'],
  checkmate_in_3: ['missed_checkmate'],
  material_gain: ['missed_capture', 'hung_piece'],
  discovered_check: ['undefended_general'],
}

/** Get which mistake patterns a puzzle concept addresses */
export function getPuzzlePatterns(concept: string): MistakeCategory[] {
  return CONCEPT_TO_PATTERN[concept] ?? []
}

/** Get which puzzle concepts help with a given mistake category */
export function getConceptsForPattern(category: MistakeCategory): string[] {
  return Object.entries(CONCEPT_TO_PATTERN)
    .filter(([, cats]) => cats.includes(category))
    .map(([concept]) => concept)
}

/** Pattern alert descriptions shown in PostGameSheet */
export const PATTERN_DESCRIPTIONS: Record<MistakeCategory, { alert: string; suggestion: string }> =
  {
    hung_piece: {
      alert: "You've left pieces unprotected in {{n}} of your last {{m}} games",
      suggestion: 'Check if your piece is defended after every move',
    },
    missed_capture: {
      alert: "You've missed winning captures in {{n}} of your last {{m}} games",
      suggestion: 'Before moving, scan for undefended enemy pieces',
    },
    broke_pin: {
      alert: "You've moved pinned pieces in {{n}} of your last {{m}} games",
      suggestion: 'Check if your piece is protecting the General before moving it',
    },
    early_horse_loss: {
      alert: "You've lost a Horse early in {{n}} of your last {{m}} games",
      suggestion: 'Develop Elephants before Horses to block Cannon screens',
    },
    undefended_general: {
      alert: "You've left your General exposed in {{n}} of your last {{m}} games",
      suggestion: 'Keep at least one Advisor or Elephant defending the palace',
    },
    cannon_screen_missed: {
      alert: "You've missed Cannon screen attacks in {{n}} of your last {{m}} games",
      suggestion: 'Look for pieces that can serve as a Cannon platform',
    },
    elephant_ignored: {
      alert: "You've neglected Elephant development in {{n}} of your last {{m}} games",
      suggestion: 'Develop Elephants early to protect the palace diagonals',
    },
    missed_checkmate: {
      alert: "You've missed checkmate opportunities in {{n}} of your last {{m}} games",
      suggestion: 'When ahead in material, look for forcing moves',
    },
    general_mistake: {
      alert: "You've made significant positional errors in {{n}} of your last {{m}} games",
      suggestion: 'Take a moment to evaluate the position before each move',
    },
  }

/** In-game nudge messages — gentle warnings, not hints */
export const NUDGE_MESSAGES: Record<MistakeCategory, string> = {
  hung_piece: 'Is your piece protected after this move?',
  early_horse_loss: 'Watch your Horse — is it safe?',
  cannon_screen_missed: 'Check for Cannon screens on this file',
  broke_pin: 'Is this piece protecting your General?',
  undefended_general: 'Your General looks exposed — careful!',
  missed_capture: 'Look around — any free captures?',
  elephant_ignored: 'Have you developed your Elephants?',
  missed_checkmate: 'Can you deliver checkmate here?',
  general_mistake: 'Take a moment to evaluate the position',
}

/** Map piece types to the mistake categories they're most associated with */
export const PIECE_TYPE_PATTERNS: Record<string, MistakeCategory[]> = {
  ma: ['early_horse_loss', 'hung_piece'],
  phao: ['cannon_screen_missed'],
  si: ['undefended_general', 'broke_pin'],
  tuongVoi: ['elephant_ignored'],
  xe: ['hung_piece', 'missed_capture'],
  tot: ['hung_piece'],
  tuong: ['undefended_general'],
}
