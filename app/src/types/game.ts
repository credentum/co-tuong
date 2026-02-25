export type PieceType = 'tuong' | 'si' | 'tuongVoi' | 'xe' | 'phao' | 'ma' | 'tot'

export type Side = 'red' | 'black'

export interface Position {
  col: number // 0-8 (left to right)
  row: number // 0-9 (bottom to top, Red's perspective)
}

export interface Piece {
  type: PieceType
  side: Side
  position: Position
}

export interface Move {
  from: Position
  to: Position
}

export interface BoardState {
  pieces: Piece[]
  currentTurn: Side
}
