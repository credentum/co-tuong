import { BOARD_PADDING, CELL_SIZE, COLS, ROWS } from '@/constants/board'

/**
 * Convert board coordinates (col 0-8, row 0-9) to SVG pixel position.
 * Row 0 is at the bottom (Red's side), rendered at the bottom of the SVG.
 * When flipped, the board is rotated 180° so Black is at the bottom.
 */
export function boardToSVG(col: number, row: number, flipped?: boolean): { x: number; y: number } {
  if (flipped) {
    return {
      x: BOARD_PADDING + (COLS - 1 - col) * CELL_SIZE,
      y: BOARD_PADDING + row * CELL_SIZE,
    }
  }
  return {
    x: BOARD_PADDING + col * CELL_SIZE,
    y: BOARD_PADDING + (ROWS - 1 - row) * CELL_SIZE,
  }
}
