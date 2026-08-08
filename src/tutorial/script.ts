import type { GameState } from '../game/types'
import type { ScriptedMove, TutorialGate } from './types'

/**
 * Fixed opponent actions for the 3-seat tutorial (2 rounds).
 * Keys: `${round}|${phase}|${step}|${seat}`
 *
 * Round 1 — solo Dive catch + Hover scout.
 * Round 2 — Splash block, Drop steal, Dive crash.
 */
const BOT: Record<string, ScriptedMove> = {
  // —— Round 1 (FP 0 → 0, 1, 2): stay clear of the human’s catch ——
  '1|placement|1': { move: 'placePawn', args: ['R2'] },
  '1|placement|2': { move: 'placePawn', args: ['L4'] },

  '1|step1|0|1': { move: 'selectCard', args: ['Splash', { target: 0 }] },
  '1|step1|0|2': { move: 'selectCard', args: ['Splash', { target: 3 }] },

  '1|step2|1|1': { move: 'selectCard', args: ['Drop', { target: 0 }] },
  '1|step2|1|2': { move: 'selectCard', args: ['Drop', { target: 4 }] },

  '1|step3|2|1': { move: 'selectCard', args: ['Hover', { peek: 4 }] },
  '1|step3|2|2': { move: 'selectCard', args: ['Hover', { peek: 0 }] },

  // —— Round 2 (FP 1 → 1, 2, 0): Splash block → Drop steal → Dive crash ——
  '2|placement|1': { move: 'placePawn', args: ['R2'] },
  '2|placement|2': { move: 'placePawn', args: ['L2'] },

  // bot1 Dive blocked by human Splash on z1; bot2 Scouts
  '2|step1|0|1': { move: 'selectCard', args: ['Dive', { target: 1 }] },
  '2|step1|0|2': { move: 'selectCard', args: ['Hover', { peek: 3 }] },

  // bot2 solo Dive z1 for human to steal (Dive bounces back)
  '2|step2|1|1': { move: 'selectCard', args: ['Drop', { target: 0 }] },
  '2|step2|1|2': { move: 'selectCard', args: ['Dive', { target: 1 }] },

  // bot2 Dive again on z2 → Crash with human; bot1 burns Splash
  '2|step3|2|1': { move: 'selectCard', args: ['Splash', { target: 0 }] },
  '2|step3|2|2': { move: 'selectCard', args: ['Dive', { target: 2 }] },
}

const HUMAN: Record<string, TutorialGate> = {
  '1|placement|place': { perchId: 'L2' },
  '1|placement|peek': { zoneId: 1 },
  '1|step1': { card: 'Dive', zoneId: 1 },
  '1|step2': { card: 'Hover', zoneId: 0 },
  '1|step3': { card: 'Splash', zoneId: 2 },
  '1|cleanup': { action: 'continue' },

  '2|placement|place': { perchId: 'L3' },
  '2|step1': { card: 'Splash', zoneId: 1 },
  '2|step2': { card: 'Drop', zoneId: 1 },
  '2|step3': { card: 'Dive', zoneId: 2 },
  '2|cleanup': { action: 'continue' },
}

export function scriptedBotMove(G: GameState, seat: string): ScriptedMove | null {
  if (seat === '0') return null
  // Hover phase auto-applies declared targets; race fallback stays put.
  if (G.currentPhase.startsWith('hover')) {
    return { move: 'hoverMove', args: [] }
  }
  if (
    G.currentPhase === 'placement' &&
    G.locked[seat] === true &&
    G.sightlinePeek[seat] === undefined
  ) {
    const perch = G.perches.find((p) => p.id === G.players[seat]?.perch)
    if (perch?.level === 'low') {
      return { move: 'peekSightline', args: [perch.zone] }
    }
  }
  if (G.currentPhase === 'placement') {
    return BOT[`${G.round}|placement|${seat}`] ?? null
  }
  const key = `${G.round}|${G.currentPhase}|${G.step}|${seat}`
  return BOT[key] ?? null
}

export function humanGateKey(G: GameState, playerID: string): string | null {
  if (playerID !== '0') return null
  const { round, currentPhase: phase, step } = G
  if (phase === 'placement') {
    if (!G.players[playerID]?.perch || G.locked[playerID] !== true) {
      return `${round}|placement|place`
    }
    const perch = G.perches.find((p) => p.id === G.players[playerID].perch)
    if (perch?.level === 'low' && G.sightlinePeek[playerID] === undefined) {
      return `${round}|placement|peek`
    }
    return null
  }
  if (phase.startsWith('step')) {
    if (G.selections[playerID] !== undefined) return null
    return `${round}|step${step + 1}`
  }
  // Hover phase auto-applies declared Scout / Relocate — no human gate.
  if (phase.startsWith('hover')) return null
  if (phase === 'cleanup') return `${round}|cleanup`
  return null
}

export function humanGate(G: GameState, playerID: string): TutorialGate | null {
  const key = humanGateKey(G, playerID)
  if (!key) return null
  return HUMAN[key] ?? null
}
