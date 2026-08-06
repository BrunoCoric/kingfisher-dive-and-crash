import { Bot } from 'boardgame.io/ai'
import type { Ctx, PlayerID, State } from 'boardgame.io'
import type { AiEnumerate } from 'boardgame.io'
import { filterPlayerView } from '../playerView'
import { ACTION_DECK } from '../cards'
import type { GameState, Perch } from '../types'
import { HIDDEN_FISH } from '../types'
import { expectedFishValue, zoneValue, perchValue, opponentsReaching, bestPerchValue, opponentDiveZones } from './scoring'
import type { BotAction } from './select'

/**
 * The original greedy heuristic, preserved verbatim as `LegacyKingfisherBot`
 * for A/B comparison. It does not use beliefs, memory, or sampling: every move
 * is a hard argmax over the deterministic heuristic policy.
 */

type EnumerateFn = (G: GameState, ctx: Ctx, playerID: PlayerID) => AiEnumerate

const DIVE_BIAS = 0.3
const DROP_BIAS = 0.15
const SPLASH_BIAS = 0.1
const HOVER_BIAS = 0.25
const DROP_WEIGHT = 0.5
const SPLASH_WEIGHT = 0.3
const COLLISION_COST = 0.8
const INTEL_WEIGHT = 0.9
const REPOSITION_WEIGHT = 0.7
const PEEK_WEIGHT = 0.5
const SIGHTLINE_BONUS = 0.6

/** P(opponent still holds a given unplayed action card) after `G.step` cards played. */
function opponentHasCard(G: GameState): number {
  return Math.max(0, (ACTION_DECK.length - G.step) / ACTION_DECK.length)
}

function opponentDiveWeights(G: GameState, opp: string): Map<number, number> {
  const zones = opponentDiveZones(G, opp)
  const weights = new Map<number, number>()
  let sum = 0
  for (const z of zones) {
    const v = Math.max(0.1, zoneValue(G, z, opp))
    weights.set(z, v)
    sum += v
  }
  for (const [z, v] of weights) weights.set(z, (v / sum) * opponentHasCard(G))
  return weights
}

function individualDiveProb(G: GameState, opp: string, target: number): number {
  return opponentDiveWeights(G, opp).get(target) ?? 0
}

function collisionRisk(G: GameState, playerID: string, target: number): number {
  let none = 1
  for (const opp in G.players) {
    if (opp === playerID) continue
    none *= 1 - individualDiveProb(G, opp, target)
  }
  return 1 - none
}

function soloDiveProb(G: GameState, playerID: string, target: number): number {
  const opponents = Object.keys(G.players).filter((pid) => pid !== playerID)
  let total = 0
  for (const i of opponents) {
    let othersNone = 1
    for (const j of opponents) if (j !== i) othersNone *= 1 - individualDiveProb(G, j, target)
    total += individualDiveProb(G, i, target) * othersNone
  }
  return total
}

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

function perchOf(G: GameState, playerID: string): Perch | undefined {
  return G.perches.find((p) => p.id === G.players[playerID]?.perch)
}

function evaluateMove(G: GameState, player: string, move: string, args: unknown[]): number {
  switch (move) {
    case 'placePawn': {
      const perch = G.perches.find((p) => p.id === args[0])
      if (!perch) return -Infinity
      return perchValue(G, perch, player) + (perch.level === 'low' ? SIGHTLINE_BONUS : 0)
    }
    case 'peekSightline':
      return zoneValue(G, Number(args[0]), player)
    case 'selectCard': {
      const card = args[0]
      if (card === 'Hover') {
        const current = perchOf(G, player)
        const repositionGain = current ? Math.max(0, bestPerchValue(G, player) - perchValue(G, current, player)) : 0
        const peek = peekOf(args)
        let intelGain = 0
        if (peek !== undefined) {
          const fish = G.zones[peek]?.fish
          if (fish === HIDDEN_FISH) {
            intelGain = Math.max(0, 3 - expectedFishValue(G)) * INTEL_WEIGHT
            intelGain += Math.max(0, zoneValue(G, peek, player)) * PEEK_WEIGHT
          } else if (fish && fish !== null) {
            intelGain = Math.max(0, fish.points) * PEEK_WEIGHT
          }
        }
        return repositionGain * REPOSITION_WEIGHT + intelGain + HOVER_BIAS
      }
      const target = targetOf(args)
      if (typeof card !== 'string' || target === undefined) return -Infinity
      const value = zoneValue(G, target, player)
      if (card === 'Dive') {
        const risk = collisionRisk(G, player, target)
        return value * (1 - risk) - COLLISION_COST * risk + DIVE_BIAS
      }
      if (card === 'Drop') {
        const prob = soloDiveProb(G, player, target)
        return value * DROP_WEIGHT * prob + DROP_BIAS
      }
      if (card === 'Splash') {
        const contested = opponentsReaching(G, player, target) > 0 && value > 0
        return (contested ? value * SPLASH_WEIGHT : 0) + SPLASH_BIAS
      }
      return -Infinity
    }
    case 'hoverMove': {
      const target = args[0]
      const perch = G.perches.find((p) => p.id === target)
      const current = perchOf(G, player)
      if (!perch || !current) return 0
      return perchValue(G, perch, player) - perchValue(G, current, player)
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

export class LegacyKingfisherBot extends Bot {
  constructor(opts: { enumerate: EnumerateFn; seed?: string | number; difficulty?: number }) {
    super(opts)
  }

  async play(state: State<GameState>, playerID: PlayerID): Promise<{ action: BotAction }> {
    const view = filterPlayerView({ G: state.G, ctx: state.ctx, playerID })
    const candidates = this.enumerate(view, state.ctx, playerID).filter(
      (a): a is BotAction => a != null && a.payload != null,
    )
    if (candidates.length === 0) {
      throw new Error(`LegacyKingfisherBot: no legal actions for ${playerID} in ${view.currentPhase}`)
    }
    let best: BotAction = candidates[0]
    let bestScore = -Infinity
    for (const action of candidates) {
      const score = evaluateMove(view, playerID, action.payload.type, action.payload.args ?? [])
      if (score > bestScore) {
        bestScore = score
        best = action
      }
    }
    return { action: best }
  }
}