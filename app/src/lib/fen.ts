import type { Piece, PieceType, Side } from '@/types/game'

/**
 * Cờ tướng FEN format (similar to Xiangqi FEN):
 * - Board encoded row by row from row 9 (top/black) to row 0 (bottom/red)
 * - Rows separated by '/'
 * - Pieces: uppercase = Red, lowercase = Black
 *   K=Tướng, A=Sĩ, E=Tượng, R=Xe, C=Pháo, N=Mã, P=Tốt
 * - Empty squares: digit = consecutive empty count
 * - Space then 'r' or 'b' for turn
 */

const PIECE_TO_CHAR: Record<PieceType, string> = {
  tuong: 'K',
  si: 'A',
  tuongVoi: 'E',
  xe: 'R',
  phao: 'C',
  ma: 'N',
  tot: 'P',
}

const CHAR_TO_PIECE: Record<string, PieceType> = {
  K: 'tuong',
  A: 'si',
  E: 'tuongVoi',
  R: 'xe',
  C: 'phao',
  N: 'ma',
  P: 'tot',
}

export function boardToFen(pieces: Piece[], currentTurn: Side): string {
  const rows: string[] = []

  // Encode from row 9 (top) to row 0 (bottom)
  for (let row = 9; row >= 0; row--) {
    let rowStr = ''
    let emptyCount = 0

    for (let col = 0; col < 9; col++) {
      const piece = pieces.find((p) => p.position.col === col && p.position.row === row)
      if (piece) {
        if (emptyCount > 0) {
          rowStr += emptyCount
          emptyCount = 0
        }
        const char = PIECE_TO_CHAR[piece.type]
        rowStr += piece.side === 'red' ? char : char.toLowerCase()
      } else {
        emptyCount++
      }
    }
    if (emptyCount > 0) rowStr += emptyCount
    rows.push(rowStr)
  }

  return rows.join('/') + ' ' + (currentTurn === 'red' ? 'r' : 'b')
}

export function fenToBoard(fen: string): { pieces: Piece[]; currentTurn: Side } {
  const [boardPart, turnPart] = fen.split(' ')
  const pieces: Piece[] = []
  const rows = boardPart!.split('/')

  for (let i = 0; i < rows.length; i++) {
    const row = 9 - i // Row 9 is first in FEN
    let col = 0
    for (const ch of rows[i]!) {
      const digit = parseInt(ch)
      if (!isNaN(digit)) {
        col += digit
      } else {
        const upper = ch.toUpperCase()
        const type = CHAR_TO_PIECE[upper]
        if (type) {
          const side: Side = ch === upper ? 'red' : 'black'
          pieces.push({ type, side, position: { col, row } })
        }
        col++
      }
    }
  }

  return { pieces, currentTurn: turnPart === 'r' ? 'red' : 'black' }
}
