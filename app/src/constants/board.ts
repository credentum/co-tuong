// Board dimensions
export const COLS = 9
export const ROWS = 10

// SVG coordinate system
export const BOARD_PADDING = 60
export const CELL_SIZE = 100

// Computed SVG dimensions
export const BOARD_WIDTH = BOARD_PADDING * 2 + (COLS - 1) * CELL_SIZE // 920
export const BOARD_HEIGHT = BOARD_PADDING * 2 + (ROWS - 1) * CELL_SIZE // 1020

// Palace columns (0-indexed)
export const PALACE_COLS = [3, 4, 5] as const

// Palace rows (Red at bottom 0-2, Black at top 7-9)
export const PALACE_ROWS_RED = [0, 1, 2] as const
export const PALACE_ROWS_BLACK = [7, 8, 9] as const

// River between rows 4 and 5
export const RIVER_ROW_BOTTOM = 4
export const RIVER_ROW_TOP = 5

// Piece radius in SVG units
export const PIECE_RADIUS = 40

// Tap target size in SVG units (≥44px physical on iPhone 8 at 375pt width)
export const TAP_TARGET_SIZE = 80

// Chinese characters for pieces (Red / Black)
export const PIECE_CHARS: Record<string, { red: string; black: string }> = {
  tuong: { red: '帥', black: '將' },
  si: { red: '仕', black: '士' },
  tuongVoi: { red: '相', black: '象' },
  xe: { red: '俥', black: '車' },
  phao: { red: '炮', black: '砲' },
  ma: { red: '傌', black: '馬' },
  tot: { red: '兵', black: '卒' },
}
