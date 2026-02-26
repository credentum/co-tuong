import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore, computeCafeReadiness } from '../usePlayerStore'

beforeEach(() => {
  usePlayerStore.setState({
    dotMode: 'adaptive',
    mastery: Object.fromEntries(
      ['tuong', 'si', 'tuongVoi', 'xe', 'phao', 'ma', 'tot'].map((t) => [
        t,
        { consecutiveClean: 0, graduated: false, recoveryGamesLeft: 0 },
      ]),
    ) as ReturnType<typeof usePlayerStore.getState>['mastery'],
    showDotsOverride: false,
    nudgeMode: 'on',
    activeNudge: null,
    nudgesShownThisGame: [],
    nudgeAvoidCount: {},
    totalGamesPlayed: 0,
    labelSuggestionDismissed: 'none',
  })
})

describe('usePlayerStore — mastery graduation', () => {
  it('starts with all piece types ungraduated', () => {
    const { mastery } = usePlayerStore.getState()
    for (const type of ['tuong', 'si', 'tuongVoi', 'xe', 'phao', 'ma', 'tot'] as const) {
      expect(mastery[type].graduated).toBe(false)
      expect(mastery[type].consecutiveClean).toBe(0)
    }
  })

  it('graduates a piece type after 10 consecutive legal moves', () => {
    const store = usePlayerStore.getState()
    for (let i = 0; i < 10; i++) {
      store.recordLegalMove('ma')
    }
    const { mastery } = usePlayerStore.getState()
    expect(mastery.ma.graduated).toBe(true)
    expect(mastery.ma.consecutiveClean).toBe(10)
  })

  it('does not graduate before reaching threshold', () => {
    const store = usePlayerStore.getState()
    for (let i = 0; i < 9; i++) {
      store.recordLegalMove('xe')
    }
    expect(usePlayerStore.getState().mastery.xe.graduated).toBe(false)
  })

  it('resets consecutiveClean on illegal attempt', () => {
    const store = usePlayerStore.getState()
    for (let i = 0; i < 7; i++) {
      store.recordLegalMove('phao')
    }
    store.recordIllegalAttempt('phao')
    expect(usePlayerStore.getState().mastery.phao.consecutiveClean).toBe(0)
    expect(usePlayerStore.getState().mastery.phao.graduated).toBe(false)
  })

  it('sets recoveryGamesLeft when graduated piece gets illegal attempt', () => {
    const store = usePlayerStore.getState()
    for (let i = 0; i < 10; i++) {
      store.recordLegalMove('si')
    }
    expect(usePlayerStore.getState().mastery.si.graduated).toBe(true)
    store.recordIllegalAttempt('si')
    const { mastery } = usePlayerStore.getState()
    expect(mastery.si.graduated).toBe(false)
    expect(mastery.si.recoveryGamesLeft).toBe(3)
    expect(mastery.si.consecutiveClean).toBe(0)
  })

  it('onGameEnd decrements recoveryGamesLeft', () => {
    const store = usePlayerStore.getState()
    for (let i = 0; i < 10; i++) store.recordLegalMove('tot')
    store.recordIllegalAttempt('tot')
    expect(usePlayerStore.getState().mastery.tot.recoveryGamesLeft).toBe(3)

    store.onGameEnd()
    expect(usePlayerStore.getState().mastery.tot.recoveryGamesLeft).toBe(2)

    store.onGameEnd()
    expect(usePlayerStore.getState().mastery.tot.recoveryGamesLeft).toBe(1)

    // Build up clean moves again
    for (let i = 0; i < 10; i++) store.recordLegalMove('tot')

    store.onGameEnd()
    expect(usePlayerStore.getState().mastery.tot.recoveryGamesLeft).toBe(0)
    expect(usePlayerStore.getState().mastery.tot.graduated).toBe(true)
  })

  it('does not re-graduate if consecutiveClean is below threshold on recovery end', () => {
    const store = usePlayerStore.getState()
    for (let i = 0; i < 10; i++) store.recordLegalMove('xe')
    store.recordIllegalAttempt('xe')

    for (let i = 0; i < 5; i++) store.recordLegalMove('xe')
    store.onGameEnd()
    store.onGameEnd()
    store.onGameEnd()
    expect(usePlayerStore.getState().mastery.xe.recoveryGamesLeft).toBe(0)
    expect(usePlayerStore.getState().mastery.xe.graduated).toBe(false)
  })

  it('only affects the targeted piece type', () => {
    const store = usePlayerStore.getState()
    for (let i = 0; i < 10; i++) store.recordLegalMove('ma')
    store.recordIllegalAttempt('xe')
    const { mastery } = usePlayerStore.getState()
    expect(mastery.ma.graduated).toBe(true)
    expect(mastery.xe.consecutiveClean).toBe(0)
  })
})

describe('usePlayerStore — dotMode', () => {
  it('defaults to adaptive', () => {
    expect(usePlayerStore.getState().dotMode).toBe('adaptive')
  })

  it('can change dot mode', () => {
    usePlayerStore.getState().setDotMode('always')
    expect(usePlayerStore.getState().dotMode).toBe('always')
  })
})

describe('usePlayerStore — showDotsOverride', () => {
  it('defaults to false', () => {
    expect(usePlayerStore.getState().showDotsOverride).toBe(false)
  })

  it('can be toggled', () => {
    usePlayerStore.getState().setShowDotsOverride(true)
    expect(usePlayerStore.getState().showDotsOverride).toBe(true)
    usePlayerStore.getState().setShowDotsOverride(false)
    expect(usePlayerStore.getState().showDotsOverride).toBe(false)
  })
})

describe('usePlayerStore — nudges', () => {
  it('defaults to nudgeMode on', () => {
    expect(usePlayerStore.getState().nudgeMode).toBe('on')
  })

  it('can change nudge mode', () => {
    usePlayerStore.getState().setNudgeMode('subtle')
    expect(usePlayerStore.getState().nudgeMode).toBe('subtle')
  })

  it('shows a nudge and tracks it', () => {
    usePlayerStore.getState().showNudge('hung_piece')
    const state = usePlayerStore.getState()
    expect(state.activeNudge).toBe('hung_piece')
    expect(state.nudgesShownThisGame).toContain('hung_piece')
  })

  it('clears nudge', () => {
    usePlayerStore.getState().showNudge('hung_piece')
    usePlayerStore.getState().clearNudge()
    expect(usePlayerStore.getState().activeNudge).toBeNull()
  })

  it('resets nudges for game', () => {
    usePlayerStore.getState().showNudge('hung_piece')
    usePlayerStore.getState().resetNudgesForGame()
    const state = usePlayerStore.getState()
    expect(state.activeNudge).toBeNull()
    expect(state.nudgesShownThisGame).toEqual([])
  })

  it('records nudge avoidance', () => {
    usePlayerStore.getState().recordNudgeAvoided('hung_piece')
    expect(usePlayerStore.getState().nudgeAvoidCount.hung_piece).toBe(1)
    usePlayerStore.getState().recordNudgeAvoided('hung_piece')
    expect(usePlayerStore.getState().nudgeAvoidCount.hung_piece).toBe(2)
  })

  it('auto-downgrades to subtle after 3 avoidances', () => {
    const store = usePlayerStore.getState()
    store.recordNudgeAvoided('hung_piece')
    store.recordNudgeAvoided('hung_piece')
    expect(usePlayerStore.getState().nudgeMode).toBe('on')
    usePlayerStore.getState().recordNudgeAvoided('hung_piece')
    expect(usePlayerStore.getState().nudgeMode).toBe('subtle')
  })
})

describe('usePlayerStore — label fade', () => {
  it('defaults to zero games played', () => {
    expect(usePlayerStore.getState().totalGamesPlayed).toBe(0)
  })

  it('increments totalGamesPlayed on game end', () => {
    usePlayerStore.getState().onGameEnd()
    expect(usePlayerStore.getState().totalGamesPlayed).toBe(1)
    usePlayerStore.getState().onGameEnd()
    expect(usePlayerStore.getState().totalGamesPlayed).toBe(2)
  })

  it('can dismiss label suggestion', () => {
    usePlayerStore.getState().setLabelSuggestionDismissed('vietnamese')
    expect(usePlayerStore.getState().labelSuggestionDismissed).toBe('vietnamese')
  })
})

describe('computeCafeReadiness', () => {
  it('returns 0 for a brand new player', () => {
    const mastery = Object.fromEntries(
      ['tuong', 'si', 'tuongVoi', 'xe', 'phao', 'ma', 'tot'].map((t) => [
        t,
        { consecutiveClean: 0, graduated: false, recoveryGamesLeft: 0 },
      ]),
    ) as ReturnType<typeof usePlayerStore.getState>['mastery']
    expect(computeCafeReadiness(mastery, 'always', 'english', 0, 0, 0)).toBe(20)
  })

  it('returns 100 for a fully mastered player', () => {
    const mastery = Object.fromEntries(
      ['tuong', 'si', 'tuongVoi', 'xe', 'phao', 'ma', 'tot'].map((t) => [
        t,
        { consecutiveClean: 10, graduated: true, recoveryGamesLeft: 0 },
      ]),
    ) as ReturnType<typeof usePlayerStore.getState>['mastery']
    expect(computeCafeReadiness(mastery, 'off', 'characters_only', 3, 3, 1)).toBe(100)
  })
})
