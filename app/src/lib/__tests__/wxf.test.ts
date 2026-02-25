import { describe, it, expect } from 'vitest'
import { moveToWxf } from '../wxf'
import type { Piece } from '@/types/game'

const mkPiece = (type: Piece['type'], side: Piece['side'], col: number, row: number): Piece => ({
  type,
  side,
  position: { col, row },
})

describe('moveToWxf', () => {
  it('Xe horizontal move: R1.4', () => {
    const piece = mkPiece('xe', 'red', 0, 0)
    const wxf = moveToWxf(piece, { col: 0, row: 0 }, { col: 5, row: 0 }, [piece])
    // Red col 0 → WXF col 9, destination col 5 → WXF col 4
    expect(wxf).toBe('R9.4')
  })

  it('Xe advance: R1+2', () => {
    const piece = mkPiece('xe', 'red', 8, 0)
    const wxf = moveToWxf(piece, { col: 8, row: 0 }, { col: 8, row: 2 }, [piece])
    // Red col 8 → WXF col 1, advance 2 rows
    expect(wxf).toBe('R1+2')
  })

  it('Xe retreat: R1-3', () => {
    const piece = mkPiece('xe', 'red', 8, 5)
    const wxf = moveToWxf(piece, { col: 8, row: 5 }, { col: 8, row: 2 }, [piece])
    expect(wxf).toBe('R1-3')
  })

  it('Mã advance: N8+7', () => {
    // Red Mã at col 1, row 0 → moves to col 2, row 2
    const piece = mkPiece('ma', 'red', 1, 0)
    const wxf = moveToWxf(piece, { col: 1, row: 0 }, { col: 2, row: 2 }, [piece])
    // Red col 1 → WXF col 8, destination col 2 → WXF col 7
    expect(wxf).toBe('N8+7')
  })

  it('Pháo advance: C2+5', () => {
    const piece = mkPiece('phao', 'red', 7, 2)
    const wxf = moveToWxf(piece, { col: 7, row: 2 }, { col: 7, row: 7 }, [piece])
    // Red col 7 → WXF col 2, advance 5 rows
    expect(wxf).toBe('C2+5')
  })

  it('Black Xe advance (moving down): r9+1', () => {
    const piece = mkPiece('xe', 'black', 0, 9)
    const wxf = moveToWxf(piece, { col: 0, row: 9 }, { col: 0, row: 8 }, [piece])
    // Black col 0 → WXF col 1, advance (down for black) 1 row
    expect(wxf).toBe('R1+1')
  })

  it('Tốt advance: P5+1', () => {
    const piece = mkPiece('tot', 'red', 4, 3)
    const wxf = moveToWxf(piece, { col: 4, row: 3 }, { col: 4, row: 4 }, [piece])
    // Red col 4 → WXF col 5, advance 1
    expect(wxf).toBe('P5+1')
  })
})
