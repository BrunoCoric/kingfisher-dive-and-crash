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
  repositionWeight: 0.3,
  peekWeight: 0.2,
  sightlineBonus: 0.55,
  // Large enough that two bots with the same public info still prefer different
  // blind Dive/Splash targets (legacy anti-crash coordination).
  hiddenJitter: 1.35,
  denyWeight: 0.25,
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

/** Zones an opponent could dive this step (to crash you or to be your Drop/reposition). */
export function opponentDiveZones(G: GameState, opp: string): number[] {
  const other = G.players[opp]
  if (!other?.perch) return []
  const perch = G.perches.find((p) => p.id === other.perch)
  if (!perch) return []
  return reachableZones(perch.zone, perch.level, G.zones.length).filter((z) => G.zones[z]?.fish)
}

/**
 * Value a perch has as *denial*: how much target value we remove from each
 * opponent by sitting on a competitive perch they also could dive.
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
    const target = opponentDiveZones(G, pid)
    for (const zone of target) {
      const v = zoneValue(G, zone, pid, weights, memory)
      if (mine.includes(zone) && Number.isFinite(v) && v > 0) total += v
    }
  }
  return total
}

export function perchOf(G: GameState, playerID: string): Perch | undefined {
  return G.perches.find((p) => p.id === G.players[playerID]?.perch)
}
