import type { CardType, FishType } from '../types'

/**
 * AI-local types, kept separate from the game's `src/game/types.ts' so the
 * bot's private reasoning never leaks into the shared engine shape.
 */

/** A fish the bot has actually seen and (deterministically) predicts in a zone. */
export interface KnownFish {
  id: string
  type: FishType
  points: number
  /** Predicted downstream zone index; drifts +1 each round until it washes out. */
  zone: number
  round: number
}

/**
 * Exact probability distribution over the (≤4-card) universe of subsets an
 * opponent may still hold. Keys are '+' joined, sorted card names; values
 * sum to 1.
 */
export interface OpponentHand {
  dist: Map<string, number>
}

export interface BotMemory {
  /** Last round fish-drift was applied. */
  lastRound: number
  /** Last round opponent hands were reset to a fresh 4-card deck. */
  beliefRound: number
  zoneCount: number
  known: KnownFish[]
  oppHands: Record<string, OpponentHand>
  /** Signature of the last-processed reveal snapshot, so a step isn't double-applied. */
  seenKey: string
}

export type CardBelief = Record<CardType, number>

export interface WeightRecord {
  pikePenalty: number
  diveBias: number
  dropBias: number
  splashBias: number
  hoverBias: number
  dropWeight: number
  splashWeight: number
  collisionCost: number
  intelWeight: number
  repositionWeight: number
  peekWeight: number
  sightlineBonus: number
  hiddenJitter: number
  denyWeight: number
}