import type { CalloutKind, CardType, GameState, StepSelection } from '../game/types'
import { playSfx, type SfxId } from './sfx'

/** Dedupes render-time cues (also covers React Strict Mode double-render). */
let lastKey = ''

const OUTCOME_ORDER: CalloutKind[] = ['crash', 'blocked', 'steal', 'catch', 'pike']

const REVEAL_SFX: Partial<Record<CardType, SfxId>> = {
  Hover: 'reveal_hover',
  Splash: 'reveal_splash',
  Dive: 'reveal_dive',
  Drop: 'reveal_drop',
}

function fishSfx(points: number | undefined): SfxId | null {
  if (points === undefined) return null
  if (points <= 0) return 'fish_trash'
  if (points === 1) return 'fish_minnow'
  if (points === 2) return 'fish_perch'
  return 'fish_trout'
}

function revealed(G: GameState): StepSelection[] {
  return Object.values(G.lastReveals).filter((s): s is StepSelection => s != null)
}

/**
 * Play once when a step's reveal / outcome window appears.
 * Call from Board render (no useEffect) — keyed by round/step/outcome count.
 */
export function cueStepSfx(key: string, G: GameState): void {
  if (key === lastKey) return
  const sels = revealed(G)
  if (G.outcomeLog.length === 0 && sels.length === 0) return
  lastKey = key

  playSfx('step_resolve')

  let t = 120
  const cards = new Set(sels.map((s) => s.card))
  for (const card of ['Hover', 'Splash', 'Dive', 'Drop'] as const) {
    const id = REVEAL_SFX[card]
    if (id && cards.has(card)) {
      playSfx(id, t)
      t += 90
    }
  }

  const kinds = new Set(G.outcomeLog.map((c) => c.kind))
  for (const kind of OUTCOME_ORDER) {
    if (!kinds.has(kind)) continue
    playSfx(kind, t)
    t += 110
  }

  for (const c of G.outcomeLog) {
    if (c.kind !== 'catch' && c.kind !== 'steal') continue
    const fish = fishSfx(c.points)
    if (fish) {
      playSfx(fish, t)
      t += 70
    }
  }
}
