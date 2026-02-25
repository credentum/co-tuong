import type { Piece, Position, Side } from '@/types/game'

/**
 * WXF notation: PieceColumn Action Distance
 * - Columns numbered 1-9 from the MOVING player's right
 * - Action: + (advance), - (retreat), . (horizontal)
 * - Distance: steps moved, or destination column for horizontal moves
 */

const PIECE_ABBR: Record<string, string> = {
  tuong: 'K',
  si: 'A',
  tuongVoi: 'E',
  xe: 'R',
  phao: 'C',
  ma: 'N',
  tot: 'P',
}

/** Convert internal col (0-8) to WXF column (1-9) from a player's perspective */
function toWxfCol(col: number, side: Side): number {
  // Red's rightmost is col 8, which is WXF column 1
  // Black's rightmost is col 0, which is WXF column 1
  return side === 'red' ? 9 - col : col + 1
}

/** Determine if a piece moves along a rank (horizontally) */
function isHorizontal(from: Position, to: Position): boolean {
  return from.row === to.row
}

/** Determine advance direction for a side */
function isAdvancing(from: Position, to: Position, side: Side): boolean {
  return side === 'red' ? to.row > from.row : to.row < from.row
}

export function moveToWxf(piece: Piece, from: Position, to: Position, allPieces: Piece[]): string {
  const abbr = PIECE_ABBR[piece.type] ?? '?'
  const side = piece.side
  const wxfFromCol = toWxfCol(from.col, side)

  // Check for duplicate pieces of same type on same column
  const sameTypeSameCol = allPieces.filter(
    (p) =>
      p.type === piece.type &&
      p.side === piece.side &&
      p.position.col === from.col &&
      !(p.position.col === from.col && p.position.row === from.row),
  )

  let prefix: string
  if (sameTypeSameCol.length > 0) {
    // Use +/- prefix for front/rear disambiguation
    const isFront =
      side === 'red'
        ? from.row > sameTypeSameCol[0]!.position.row
        : from.row < sameTypeSameCol[0]!.position.row
    prefix = (isFront ? '+' : '-') + abbr
  } else {
    prefix = abbr + wxfFromCol
  }

  if (isHorizontal(from, to)) {
    // Horizontal move: action is '.', distance is destination column
    const wxfToCol = toWxfCol(to.col, side)
    return prefix + '.' + wxfToCol
  }

  // Vertical or diagonal move
  const action = isAdvancing(from, to, side) ? '+' : '-'

  // For pieces that move diagonally (Sĩ, Tượng, Mã), distance is destination column
  if (piece.type === 'si' || piece.type === 'tuongVoi' || piece.type === 'ma') {
    const wxfToCol = toWxfCol(to.col, side)
    return prefix + action + wxfToCol
  }

  // For straight-moving pieces (Xe, Pháo, Tướng, Tốt), distance is number of rows
  const distance = Math.abs(to.row - from.row)
  return prefix + action + distance
}
