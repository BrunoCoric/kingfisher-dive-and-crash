import type { GameState } from '../game/types'
import type { ScriptedMove, TutorialGate } from './types'

/**
 * Fixed opponent actions for the 3-seat tutorial.
 * Keys: `${round}|${phase}|${step}|${seat}`
 *
 * Hands are one of each card per round — a seat can Dive only once unless
 * Drop-steal bounces Dive back (not used for bots here).
 */
const BOT: Record<string, ScriptedMove> = {
  // —— Round 1 placement (FP 0 → 0, 1, 2) ——
  '1|placement|1': { move: 'placePawn', args: ['R2'] },
  '1|placement|2': { move: 'placePawn', args: ['L4'] },

  '1|step1|0|1': { move: 'selectCard', args: ['Splash', { target: 0 }] },
  '1|step1|0|2': { move: 'selectCard', args: ['Splash', { target: 3 }] },

  '1|step2|1|1': { move: 'selectCard', args: ['Drop', { target: 0 }] },
  '1|step2|1|2': { move: 'selectCard', args: ['Drop', { target: 4 }] },

  '1|step3|2|1': { move: 'selectCard', args: ['Hover', { peek: 4 }] },
  '1|step3|2|2': { move: 'selectCard', args: ['Hover', { peek: 0 }] },
  '1|hover3|2|1': { move: 'hoverMove', args: [] },
  '1|hover3|2|2': { move: 'hoverMove', args: [] },

  // —— Round 2: Splash block + Drop steal (FP 1 → 1, 2, 0) ——
  '2|placement|1': { move: 'placePawn', args: ['R2'] },
  '2|placement|2': { move: 'placePawn', args: ['L2'] },

  // bot1 Dive blocked by human Splash on z1; bot2 Hovers (Pike on z2 stays put)
  '2|step1|0|1': { move: 'selectCard', args: ['Dive', { target: 1 }] },
  '2|step1|0|2': { move: 'selectCard', args: ['Hover', { peek: 4 }] },
  '2|hover1|0|2': { move: 'hoverMove', args: [] },

  // bot2 solo Dive z1 for human to steal
  '2|step2|1|1': { move: 'selectCard', args: ['Drop', { target: 0 }] },
  '2|step2|1|2': { move: 'selectCard', args: ['Dive', { target: 1 }] },

  '2|step3|2|1': { move: 'selectCard', args: ['Splash', { target: 0 }] },
  '2|step3|2|2': { move: 'selectCard', args: ['Splash', { target: 2 }] },

  // —— Round 3: Dive crash + Drop+Drop (FP 2 → 2, 0, 1) ——
  '3|placement|2': { move: 'placePawn', args: ['L2'] },
  '3|placement|1': { move: 'placePawn', args: ['R2'] },

  // Dive+Dive crash on z2
  '3|step1|0|1': { move: 'selectCard', args: ['Dive', { target: 2 }] },
  '3|step1|0|2': { move: 'selectCard', args: ['Splash', { target: 1 }] },

  // Drop+Drop: bot2 Dives, human + bot1 Drop
  '3|step2|1|1': { move: 'selectCard', args: ['Drop', { target: 1 }] },
  '3|step2|1|2': { move: 'selectCard', args: ['Dive', { target: 1 }] },

  // Bot1 hand is empty after Dive crash + Drop crash discards — only bot2 acts.
  '3|step3|2|2': { move: 'selectCard', args: ['Hover', { peek: 3 }] },
  '3|hover3|2|2': { move: 'hoverMove', args: [] },

  // —— Round 4: Pike (FP 0 → 0, 1, 2) ——
  '4|placement|1': { move: 'placePawn', args: ['R2'] },
  '4|placement|2': { move: 'placePawn', args: ['L4'] },

  '4|step1|0|1': { move: 'selectCard', args: ['Splash', { target: 0 }] },
  '4|step1|0|2': { move: 'selectCard', args: ['Splash', { target: 3 }] },

  '4|step2|1|1': { move: 'selectCard', args: ['Hover', { peek: 0 }] },
  '4|step2|1|2': { move: 'selectCard', args: ['Hover', { peek: 1 }] },
  '4|hover2|1|1': { move: 'hoverMove', args: [] },
  '4|hover2|1|2': { move: 'hoverMove', args: [] },

  '4|step3|2|1': { move: 'selectCard', args: ['Drop', { target: 0 }] },
  '4|step3|2|2': { move: 'selectCard', args: ['Drop', { target: 3 }] },
}

const HUMAN: Record<string, TutorialGate> = {
  '1|placement|place': { perchId: 'L2' },
  '1|placement|peek': { zoneId: 1 },
  '1|step1': { card: 'Dive', zoneId: 1 },
  '1|step2': { card: 'Drop', zoneId: 2 },
  '1|step3': { card: 'Hover', zoneId: 3 },
  '1|hover3': { perchId: 'L3' },
  '1|cleanup': { action: 'continue' },

  '2|placement|place': { perchId: 'L3' },
  '2|step1': { card: 'Splash', zoneId: 1 },
  '2|step2': { card: 'Drop', zoneId: 1 },
  '2|step3': { card: 'Hover', zoneId: 0 },
  '2|hover3': { action: 'stay' },
  '2|cleanup': { action: 'continue' },

  '3|placement|place': { perchId: 'L3' },
  '3|step1': { card: 'Dive', zoneId: 2 },
  '3|step2': { card: 'Drop', zoneId: 1 },
  '3|cleanup': { action: 'continue' },

  '4|placement|place': { perchId: 'R4' },
  '4|step1': { card: 'Dive', zoneId: 4 },
  '4|step2': { card: 'Hover', zoneId: 2 },
  '4|hover2': { action: 'stay' },
  '4|step3': { card: 'Splash', zoneId: 2 },
  '4|cleanup': { action: 'continue' },
}

export function scriptedBotMove(G: GameState, seat: string): ScriptedMove | null {
  if (seat === '0') return null
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
  if (phase.startsWith('hover')) {
    if (G.hovered.includes(playerID)) return null
    if (G.selections[playerID]?.card !== 'Hover') return null
    return `${round}|${phase}`
  }
  if (phase === 'cleanup') return `${round}|cleanup`
  return null
}

export function humanGate(G: GameState, playerID: string): TutorialGate | null {
  const key = humanGateKey(G, playerID)
  if (!key) return null
  return HUMAN[key] ?? null
}
