import { FISH_POINTS } from '../fish'
import { STEPS_PER_ROUND } from '../cards'
import type { GameState } from '../types'
import { HIDDEN_FISH } from '../types'
import {
  DEFAULT_WEIGHTS,
  bestPerchValue,
  denyValue,
  expectedFishValue,
  hashOffset,
  opponentDiveZones,
  opponentsReaching,
  perchOf,
  perchValue,
  zoneValue,
} from './values'
import { collisionRisk, soloDiveProb, type BeliefContext } from './risk'

export {
  DEFAULT_WEIGHTS,
  bestPerchValue,
  denyValue,
  expectedFishValue,
  hashOffset,
  opponentDiveZones,
  opponentsReaching,
  perchOf,
  perchValue,
  zoneValue,
}
export { collisionRisk, individualDiveProb, riskFactor, soloDiveProb } from './risk'
export type { BeliefContext } from './risk'

function targetOf(args: unknown[]): number | undefined {
  const sel = args[1] as { target?: number } | undefined
  if (!sel || typeof sel !== 'object') return undefined
  return typeof sel.target === 'number' ? sel.target : undefined
}

function peekOf(args: unknown[]): number | undefined {
  const sel = args[1] as { peek?: number } | undefined
  if (!sel || typeof sel !== 'object') return undefined
  return typeof sel.peek === 'number' ? sel.peek : undefined
}

/** Opponents' upside on a target fish — a fly-to-we claim that contested fish denies. */
function denyTargetUps(G: GameState, target: number, b: BeliefContext): number {
  let sum = 0
  for (const pid in G.players) {
    const v = zoneValue(G, target, pid, b.weights, b.memory)
    if (Number.isFinite(v) && v > 0 && opponentsReaching(G, pid, target) > 0) sum += v
  }
  return sum
}

/** Score one enumerated bot action under the smart belief + memory context. */
export function scoreMove(
  G: GameState,
  playerID: string,
  move: string,
  args: unknown[],
  b: BeliefContext,
  factor: number,
): number {
  const W = b.weights
  switch (move) {
    case 'placePawn': {
      const perch = G.perches.find((p) => p.id === args[0])
      if (!perch) return -Infinity
      const base = perchValue(G, perch, playerID, W, b.memory)
      const bonus = perch.level === 'low' ? W.sightlineBonus : 0
      const deny = W.denyWeight * denyValue(G, perch, playerID, W, b.memory)
      return base + bonus + deny
    }
    case 'peekSightline':
      return zoneValue(G, Number(args[0]), playerID, W, b.memory)
    case 'selectCard': {
      const card = args[0]
      if (card === 'Hover') {
        const current = perchOf(G, playerID)
        const relocateGain = current
          ? Math.max(0, bestPerchValue(G, playerID, W, b.memory) - perchValue(G, current, playerID, W, b.memory))
          : 0
        const peek = peekOf(args)
        let intel = 0
        if (peek !== undefined) {
          const fish = G.zones[peek]?.fish
          if (fish === HIDDEN_FISH) {
            intel = Math.max(0, FISH_POINTS.Trout - expectedFishValue(G, W)) * W.intelWeight
            const reachBonus = zoneValue(G, peek, playerID, W, b.memory)
            if (Number.isFinite(reachBonus) && reachBonus > 0) intel += reachBonus * W.peekWeight
          } else if (fish && fish !== null) {
            intel = Math.max(0, fish.points) * W.peekWeight * 0.25
          }
        }
        // Steeper with 3 steps: Hover on step 3 rarely pays before round end.
        const stepsLeft = STEPS_PER_ROUND - G.step + 1
        const stepScale = stepsLeft / STEPS_PER_ROUND
        // Scarcity tax so Hover is sometimes the unplayed leftover card.
        const actionTax = 0.4
        return (relocateGain * W.repositionWeight + intel) * stepScale + W.hoverBias - actionTax
      }
      const target = targetOf(args)
      if (typeof card !== 'string' || target === undefined) return -Infinity
      const value = zoneValue(G, target, playerID, W, b.memory)
      if (card === 'Dive') {
        // Denial must NOT boost Dive: contested fish are crash magnets, not free points.
        const risk = collisionRisk(G, playerID, target, b)
        const cost = W.collisionCost / factor
        const uncontested = opponentsReaching(G, playerID, target) === 0 ? 0.55 : 0
        // Late push only when the lane looks clear — don't herd into crash magnets.
        const late =
          risk < 0.3 && G.step >= STEPS_PER_ROUND - 1 ? (G.step >= STEPS_PER_ROUND ? 0.25 : 0.12) : 0
        return value * (1 - risk) - cost * risk + W.diveBias * factor + uncontested + late
      }
      if (card === 'Drop') {
        const prob = soloDiveProb(G, playerID, target, b)
        const deny = W.denyWeight * denyTargetUps(G, target, b) * 0.5
        return value * W.dropWeight * prob + W.dropBias * factor + deny - 0.15
      }
      if (card === 'Splash') {
        const contested = opponentsReaching(G, playerID, target) > 0 && value > 0
        if (!contested) return W.splashBias * factor * 0.25 - 0.2
        const diveRisk = collisionRisk(G, playerID, target, b)
        const splashRivals = Math.max(0, opponentsReaching(G, playerID, target) - 1)
        const splashCrash = Math.min(0.85, 0.25 + 0.2 * splashRivals)
        const deny = W.denyWeight * denyTargetUps(G, target, b) * diveRisk
        const style = hashOffset(playerID, target) * W.hiddenJitter * 0.5
        return value * W.splashWeight * diveRisk * (1 - splashCrash) + deny + W.splashBias * factor + style - 0.15
      }
      return -Infinity
    }
    case 'hoverMove': {
      const target = args[0]
      const perch = G.perches.find((p) => p.id === target)
      const current = perchOf(G, playerID)
      if (!perch || !current) return 0
      const gain = perchValue(G, perch, playerID, W, b.memory) - perchValue(G, current, playerID, W, b.memory)
      const denyDiff = W.denyWeight * (denyValue(G, perch, playerID, W, b.memory) - denyValue(G, current, playerID, W, b.memory))
      return gain + denyDiff
    }
    case 'skipTurn':
      return -50
    case 'endStage':
    case 'endTurn':
      return -1000
    default:
      return -Infinity
  }
}
