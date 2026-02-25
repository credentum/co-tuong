import { BOARD_PADDING, CELL_SIZE, ROWS } from '@/constants/board'

/**
 * Convert board coordinates (col 0-8, row 0-9) to SVG pixel position.
 * Row 0 is at the bottom (Red's side), rendered at the bottom of the SVG.
 */
export function boardToSVG(col: number, row: number): { x: number; y: number } {
  return {
    x: BOARD_PADDING + col * CELL_SIZE,
    y: BOARD_PADDING + (ROWS - 1 - row) * CELL_SIZE,
  }
}
