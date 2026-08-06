import { reachableZones } from '../reach'
import { FISH_COUNTS } from '../fish'
import type { GameState, Perch } from '../types'
import { HIDDEN_FISH } from '../types'
import type { BotMemory, WeightRecord } from './types'
import { knownFishIn } from './memory'

export const DEFAULT_WEIGHTS: WeightRecord = {
  pikePenalty: -1.5,
  // 3-step rounds: each card is ~⅓ of the round, so Dive must clear setup cards
  // often enough that Hover is sometimes the unplayed leftover.
  diveBias: 0.45,
  dropBias: 0.06,
  splashBias: 0.01,
  hoverBias: 0,
  dropWeight: 0.4,
  splashWeight: 0.2,
  collisionCost: 1.8,
  intelWeight: 0.3,
  // Contest-aware relocate: worth playing Hover to invade a lonely bank.
  repositionWeight: 0.45,
  peekWeight: 0.2,
  sightlineBonus: 0.55,
  // Large enough that two bots with the same public info still prefer different
  // blind Dive/Splash targets (legacy anti-crash coordination).
  hiddenJitter: 1.35,
  // High enough that after someone claims a bank, later placers invade their
  // exclusive reach instead of opening a second free-pickings corridor.
  denyWeight: 0.7,
}

export function expectedFishValue(G: GameState, weights: WeightRecord = DEFAULT_WEIGHTS): number {
  const counts = FISH_COUNTS[Object.keys(G.players).length] ?? FISH_COUNTS[4]
  const total = counts.Minnow + counts.Perch + counts.Trout + counts.Trash + counts.Pike
  return (
    (counts.Minnow * 1 + counts.Perch * 2 + counts.Trout * 3 + counts.Trash * 0 + counts.Pike * weights.pikePenalty) /
    total
  )
}

/** Deterministic per-(player, zone) offset in [-0.5, 0.5] to break hidden ties. */
export function hashOffset(playerID: string, zoneId: number): number {
  let h = 2166136261
  const s = `${playerID}:${zoneId}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000 - 0.5
}

/**
 * Scored value of a zone's fish: explicit when revealed, exact when memory
 * predicts it, and a jittered expected value otherwise (so blind targets don't
 * all tie and mirror-crash).
 */
export function zoneValue(
  G: GameState,
  zoneId: number,
  playerID: string,
  weights: WeightRecord = DEFAULT_WEIGHTS,
  memory?: BotMemory,
): number {
  const zone = G.zones[zoneId]
  if (!zone) return -Infinity
  const fish = zone.fish
  if (fish === null) return -Infinity
  if (fish !== HIDDEN_FISH) return fish.type === 'Pike' ? weights.pikePenalty : fish.points
  if (memory) {
    const known = knownFishIn(memory, zoneId)
    if (known) return known.type === 'Pike' ? weights.pikePenalty : known.points
  }
  return expectedFishValue(G, weights) + weights.hiddenJitter * hashOffset(playerID, zoneId)
}

export function perchValue(
  G: GameState,
  perch: Perch,
  playerID: string,
  weights: WeightRecord = DEFAULT_WEIGHTS,
  memory?: BotMemory,
): number {
  let total = 0
  for (const zone of reachableZones(perch.zone, perch.level, G.zones.length)) {
    const value = zoneValue(G, zone, playerID, weights, memory)
    if (Number.isFinite(value)) total += value
  }
  return total
}

export function opponentsReaching(G: GameState, playerID: string, target: number): number {
  let count = 0
  for (const pid in G.players) {
    if (pid === playerID) continue
    const other = G.players[pid]
    if (!other.perch) continue
    const perch = G.perches.find((p) => p.id === other.perch)
    if (!perch) continue
    if (reachableZones(perch.zone, perch.level, G.zones.length).includes(target)) count++
  }
  return count
}

export function bestPerchValue(
  G: GameState,
  playerID: string,
  weights: WeightRecord = DEFAULT_WEIGHTS,
  memory?: BotMemory,
): number {
  const occupied = new Set(Object.values(G.players).map((p) => p.perch).filter(Boolean))
  let best = -Infinity
  for (const perch of G.perches) {
    if (occupied.has(perch.id)) continue
    const value = perchValue(G, perch, playerID, weights, memory)
    if (value > best) best = value
  }
  return best === -Infinity ? 0 : best
}

/** Best free perch by own EV + exclusive-lane contest (smart Hover relocate). */
export function bestContestedPerchValue(
  G: GameState,
  playerID: string,
  weights: WeightRecord = DEFAULT_WEIGHTS,
  memory?: BotMemory,
): number {
  const occupied = new Set(Object.values(G.players).map((p) => p.perch).filter(Boolean))
  let best = -Infinity
  for (const perch of G.perches) {
    if (occupied.has(perch.id)) continue
    const value = contestedPerchValue(G, perch, playerID, weights, memory)
    if (value > best) best = value
  }
  return best === -Infinity ? 0 : best
}

/** Zones an opponent could dive this step (to crash you or to be your Drop/reposition). */
export function opponentDiveZones(G: GameState, opp: string): number[] {
  const other = G.players[opp]
  if (!other?.perch) return []
  const perch = G.perches.find((p) => p.id === other.perch)
  if (!perch) return []
  return reachableZones(perch.zone, perch.level, G.zones.length).filter((z) => G.zones[z]?.fish)
}

/**
 * Value a perch has as *denial*: spoiling fish an already-placed opponent can
 * dive. Exclusive lanes (one bird only — free pickings) are weighted hardest so
 * later placers / Hover moves contest a lonely side instead of herding mid-river.
 */
export function denyValue(
  G: GameState,
  perch: Perch,
  playerID: string,
  weights: WeightRecord,
  memory?: BotMemory,
): number {
  const mine = reachableZones(perch.zone, perch.level, G.zones.length)
  let total = 0
  for (const pid in G.players) {
    if (pid === playerID) continue
    for (const zone of opponentDiveZones(G, pid)) {
      if (!mine.includes(zone)) continue
      const v = zoneValue(G, zone, pid, weights, memory)
      if (!Number.isFinite(v) || v <= 0) continue
      // holders = placed birds already covering this zone (we aren't placed yet
      // during placePawn, and hoverMove still excludes self via opponentsReaching).
      const holders = opponentsReaching(G, playerID, zone)
      const exclusivity = holders <= 1 ? 1.8 : holders === 2 ? 0.75 : 0.3
      total += v * exclusivity
    }
  }
  return total
}

/** Own reach EV plus contest pressure — used for place / Hover perch choice. */
export function contestedPerchValue(
  G: GameState,
  perch: Perch,
  playerID: string,
  weights: WeightRecord = DEFAULT_WEIGHTS,
  memory?: BotMemory,
): number {
  return perchValue(G, perch, playerID, weights, memory) + weights.denyWeight * denyValue(G, perch, playerID, weights, memory)
}

export function perchOf(G: GameState, playerID: string): Perch | undefined {
  return G.perches.find((p) => p.id === G.players[playerID]?.perch)
}
