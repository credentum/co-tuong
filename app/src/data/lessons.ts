import type { LessonDef } from '@/types/learning'

export const LESSONS: LessonDef[] = [
  {
    lessonId: 1,
    title: 'The Chariot — Your Strongest Warrior',
    pieceFocus: ['xe'],
    cafeContext:
      'Look at the board next to you. The round discs marked 俥 or 車 are Xe — Chariots. They move exactly like a Rook in Western chess.',
    seeIt: {
      characterDisplay: ['俥', '車'],
      name: 'Xe — Chariot',
      pronunciationHint: "Say 'seh'",
      realWorldTip: 'If you know chess, this is your Rook. Strongest piece on the board.',
      culturalNote:
        "Xe also means 'vehicle' in Vietnamese. You'll see it on street signs — xe máy (motorbike), xe buýt (bus).",
    },
    puzzleIds: ['L1_P1', 'L1_P2', 'L1_P3', 'L1_P4', 'L1_P5'],
    reviewPuzzleIds: [],
    lessonSummary:
      'You now know the strongest piece in Cờ tướng. Next time you see 俥 or 車 on the board at the café, you know what it does.',
  },
  {
    lessonId: 2,
    title: 'The Horse — Jumps, But Watch Its Legs',
    pieceFocus: ['ma'],
    cafeContext:
      "The discs marked 傌 or 馬 are Mã — Horses. They jump in an L-shape like a chess Knight, but there's a catch: if a piece blocks the first step, it can't jump.",
    seeIt: {
      characterDisplay: ['傌', '馬'],
      name: 'Mã — Horse',
      pronunciationHint: "Say 'mah'",
      realWorldTip:
        'Like a chess Knight, but it CAN be blocked. This is the first big difference from Western chess.',
      culturalNote:
        'Mã appears in the Vietnamese zodiac — the Horse is associated with energy and adventure.',
    },
    puzzleIds: ['L2_P1', 'L2_P2', 'L2_P3', 'L2_P4', 'L2_P5'],
    reviewPuzzleIds: ['L1_P3'],
    lessonSummary:
      "The Horse is tricky but powerful. That leg-block rule is what makes Cờ tướng's Horse unique.",
  },
  {
    lessonId: 3,
    title: 'The Fortress — General and Advisors',
    pieceFocus: ['tuong', 'si'],
    cafeContext:
      "See that 3×3 grid with diagonal lines on each end? That's the palace. The General (帥/將) and Advisors (仕/士) can never leave it.",
    seeIt: {
      characterDisplay: ['帥', '將', '仕', '士'],
      name: 'Tướng — General & Sĩ — Advisor',
      pronunciationHint: "Tướng: 'tuh-ung' (rising). Sĩ: 'see'",
      realWorldTip:
        'The General is your King. The Advisors are bodyguards who never leave the fortress.',
      culturalNote:
        "Tướng means 'general' — the same word in the game's name Cờ tướng. This piece IS the game.",
    },
    puzzleIds: ['L3_P1', 'L3_P2', 'L3_P3', 'L3_P4', 'L3_P5'],
    reviewPuzzleIds: ['L1_P4', 'L2_P2'],
    lessonSummary:
      "The palace is the heart of Cờ tướng. Protecting your Tướng while breaking into your opponent's fortress — that's the game.",
  },
  {
    lessonId: 4,
    title: 'The Elephant — Guardian of Your Side',
    pieceFocus: ['tuongVoi'],
    cafeContext:
      'The discs marked 相 or 象 are Tượng — Elephants. They move exactly two intersections diagonally but cannot cross the river.',
    seeIt: {
      characterDisplay: ['相', '象'],
      name: 'Tượng — Elephant',
      pronunciationHint: "Say 'tuh-ung' (falling tone)",
      realWorldTip:
        "Think of a Bishop that can only move exactly 2 squares diagonally and can't cross the center line.",
      culturalNote:
        '象 (tượng) means elephant. War elephants defended the rear. This piece does the same.',
    },
    puzzleIds: ['L4_P1', 'L4_P2', 'L4_P3', 'L4_P4', 'L4_P5'],
    reviewPuzzleIds: ['L2_P1', 'L3_P1'],
    lessonSummary:
      'Elephants are your defensive wall. They never cross the river, but positioned well, they lock down your side.',
  },
  {
    lessonId: 5,
    title: 'The Cannon — The Soul of Cờ tướng',
    pieceFocus: ['phao'],
    cafeContext:
      "The discs marked 炮 or 砲 are Pháo — Cannons. They MOVE like a Chariot. But to CAPTURE, they must jump over exactly one piece — the 'screen.'",
    seeIt: {
      characterDisplay: ['炮', '砲'],
      name: 'Pháo — Cannon',
      pronunciationHint: "Say 'fow' (like 'pow' with an f)",
      realWorldTip:
        'This piece has no equivalent in Western chess. Master this and you understand the game.',
      culturalNote:
        'Pháo means cannon. The character 炮 originally meant catapult — a weapon that launches projectiles OVER obstacles.',
    },
    puzzleIds: ['L5_P1', 'L5_P2', 'L5_P3', 'L5_P4', 'L5_P5'],
    reviewPuzzleIds: ['L2_P4', 'L3_P4', 'L4_P2'],
    lessonSummary:
      'The Pháo is what makes Cờ tướng unique. If you understand the Cannon, you understand Cờ tướng.',
  },
  {
    lessonId: 6,
    title: 'The Soldier — Small But Brave',
    pieceFocus: ['tot'],
    cafeContext:
      'The discs marked 兵 or 卒 are Tốt — Soldiers. They start weak but gain sideways movement after crossing the river.',
    seeIt: {
      characterDisplay: ['兵', '卒'],
      name: 'Tốt — Soldier',
      pronunciationHint: "Say 'toht'",
      realWorldTip:
        "Unlike chess pawns, Soldiers don't move diagonally to capture. And there's no promotion.",
      culturalNote:
        '卒 (tốt) means foot soldier. Five per side — crossed-river Soldiers are surprisingly dangerous.',
    },
    puzzleIds: ['L6_P1', 'L6_P2', 'L6_P3', 'L6_P4', 'L6_P5'],
    reviewPuzzleIds: ['L3_P2', 'L5_P3'],
    lessonSummary:
      'Soldiers look weak but crossed-river Tốt win games. Now you know why experienced players push Soldiers aggressively.',
  },
  {
    lessonId: 7,
    title: 'The Full Game — Flying Generals and You',
    pieceFocus: ['tuong', 'si', 'tuongVoi', 'xe', 'phao', 'ma', 'tot'],
    cafeContext:
      'You now know every piece. One last rule: the two Generals can never face each other on the same file with nothing between them — the Flying General rule.',
    seeIt: {
      characterDisplay: ['帥', '將'],
      name: 'Flying General Rule (Đối mặt Tướng)',
      pronunciationHint: "Đối mặt: 'doy maht' (face to face)",
      realWorldTip:
        'This creates unique tactics: pieces between the Generals are effectively pinned.',
      culturalNote:
        'Using your General as an attacker through an empty file is the most unique tactic in Cờ tướng.',
    },
    puzzleIds: ['L7_P1', 'L7_P2', 'L7_P3', 'L7_P4', 'L7_P5'],
    reviewPuzzleIds: ['L1_P5', 'L2_P5', 'L4_P4', 'L5_P5', 'L6_P2'],
    lessonSummary:
      "You now know every rule of Cờ tướng. You can read the pieces and understand what's happening. Sit down and play.",
  },
]
