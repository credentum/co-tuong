# WXF Notation Convention

## Decision
This project uses **WXF (World Cờ Tướng Federation) standard notation** for all move representation.

## Rationale
WXF is the international standard for Cờ tướng notation, used in Vietnamese tournament play. Western algebraic notation (Files A-I, Ranks 0-9) is a chess-world invention with no cultural connection to the game. Since this app teaches the real Vietnamese game, WXF is the appropriate choice.

## Format
- Columns are numbered **1-9** from the moving player's right
- Each move is written as: **Piece Column Action Distance**
  - Piece: abbreviation (R=Xe, H=Mã, E=Tượng, A=Sĩ, K=Tướng, C=Pháo, P=Tốt)
  - Column: the column number the piece starts on (1-9)
  - Action: `+` (advance), `-` (retreat), `.` (horizontal)
  - Distance: number of points moved, or destination column for horizontal moves

## Examples
- `C2+5` — Cannon on column 2 advances 5 points
- `R1.4` — Chariot on column 1 moves horizontally to column 4
- `H8+7` — Horse on column 8 advances to column 7

## Decided
Sprint 1, before any move generation code is written.
