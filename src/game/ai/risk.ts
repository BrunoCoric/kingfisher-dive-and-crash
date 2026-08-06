import { STEPS_PER_ROUND } from '../cards'
import type { GameState } from '../types'
import type { BotMemory, WeightRecord } from './types'
import { expectedLeft, pOfHeld } from './belief'
import { expectedFishValue, hashOffset, opponentDiveZones } from './values'

export interface BeliefContext {
  memory: BotMemory
  weights: WeightRecord
}

/**
 * What an opponent is assumed to think a zone is worth. Our playerView may
 * reveal fish we peeked; opponents do not share that private info, so modeling
 * them with our reveals makes every smart bot avoid the same tile and collide
 * on the runner-up. Use deck expectation + their personal jitter instead.
 */
function oppZoneAppeal(G: GameState, zoneId: number, opp: string, b: BeliefContext): number {
  const zone = G.zones[zoneId]
  if (!zone || zone.fish === null) return -Infinity
  return expectedFishValue(G, b.weights) + b.weights.hiddenJitter * hashOffset(opp, zoneId)
}

/**
 * P(opponent dives `target`) scaled by whether they may still hold a Dive.
 * Uses a sharpened softmax over zone values so opponents are assumed to
 * concentrate on the best fish (mirror-crash prior), not spread uniformly.
 */
export function individualDiveProb(G: GameState, opp: string, target: number, b: BeliefContext): number {
  const zones = opponentDiveZones(G, opp)
  if (zones.length === 0) return 0
  const hand = b.memory.oppHands[opp]
  const dive = hand ? pOfHeld(hand, 'Dive') : 1
  let max = -Infinity
  const vals = new Map<number, number>()
  for (const z of zones) {
    const score = oppZoneAppeal(G, z, opp, b)
    const v = Number.isFinite(score) ? score : 0
    vals.set(z, v)
    if (v > max) max = v
  }
  if (max === -Infinity) max = 0
  const sharp = 0.65
  let sum = 0
  const weights = new Map<number, number>()
  for (const [z, score] of vals) {
    const w = Math.exp((score - max) / sharp)
    weights.set(z, w)
    sum += w
  }
  const w = weights.get(target) ?? 0
  if (sum <= 0) return 0
  // With STEPS_PER_ROUND < hand size, Dive may be the leftover card. Scale down
  // when more cards remain than steps left so late-round risk isn't overstated.
  const left = hand ? Math.max(1, expectedLeft(hand)) : Math.max(1, 5 - G.step)
  const stepsLeft = STEPS_PER_ROUND - G.step + 1
  const playFrac = Math.min(1, stepsLeft / left)
  const intent = 0.55 + 0.45 * playFrac
  return (w / sum) * dive * intent
}

/** P(at least one opponent dives `target`) — the crash risk to a solo Dive. */
export function collisionRisk(G: GameState, playerID: string, target: number, b: BeliefContext): number {
  let none = 1
  let reachers = 0
  for (const opp in G.players) {
    if (opp === playerID) continue
    const p = individualDiveProb(G, opp, target, b)
    if (p > 0) reachers++
    none *= 1 - p
  }
  let risk = 1 - none
  // Mirror tax: only when 3+ birds share a tile — 2p independent risk is enough
  // once hand belief is honest; over-taxing starves the bot of catches.
  if (reachers >= 3) risk = Math.min(0.92, risk + 0.08 * (reachers - 2))
  return risk
}

/** P(exactly one opponent solo-dives `target`) — a Drop ambush succeeds. */
export function soloDiveProb(G: GameState, playerID: string, target: number, b: BeliefContext): number {
  const opponents = Object.keys(G.players).filter((pid) => pid !== playerID)
  let total = 0
  for (const i of opponents) {
    let othersNone = 1
    for (const j of opponents) if (j !== i) othersNone *= 1 - individualDiveProb(G, j, target, b)
    total += individualDiveProb(G, i, target, b) * othersNone
  }
  return total
}

/**
 * Score-aware risk appetite: a trailing bot presses (higher Dive/Drop bias and
 * a cheaper collision), a leading bot plays safe (protection of its perch).
 */
export function riskFactor(G: GameState, playerID: string): number {
  const mine = G.players[playerID]?.score ?? 0
  let maxOpp = -Infinity
  for (const pid in G.players) {
    if (pid === playerID) continue
    maxOpp = Math.max(maxOpp, G.players[pid].score)
  }
  const diff = mine - (maxOpp === -Infinity ? 0 : maxOpp)
  if (diff > 6) return 0.7
  if (diff < -4) return 1.2
  return 1.0
}
