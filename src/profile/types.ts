import type { CardType, FishType } from '../game/types'
import type { KingfisherID } from '../game/kingfishers'

/** Locked birds that Nest missions unlock (Common is always playable). */
export type UnlockId = Exclude<KingfisherID, 'common'>

export interface OutcomeTallies {
  catch: number
  steal: number
  crash: number
  blocked: number
  pike: number
}

export interface LifetimeStats {
  matchesPlayed: number
  wins: number
  losses: number
  fishCaught: Record<FishType, number>
  cardsPlayed: Record<CardType, number>
  steals: number
  crashes: number
  blocked: number
  pikeEvents: number
}

export interface MatchSummary {
  at: string
  players: number
  place: number
  score: number
  cardsPlayed: Record<CardType, number>
  outcomes: OutcomeTallies
  fishCaught: Record<FishType, number>
}

export interface Profile {
  version: 1
  unlocked: UnlockId[]
  stats: LifetimeStats
  matches: MatchSummary[]
}

export const FISH_TYPES: FishType[] = ['Minnow', 'Perch', 'Trout', 'Trash', 'Pike']
export const CARD_TYPES: CardType[] = ['Dive', 'Drop', 'Splash', 'Hover']

export const LOCKED_BIRDS: UnlockId[] = [
  'pied',
  'orientalDwarf',
  'belted',
  'azure',
  'yellowBilled',
  'banded',
  'green',
  'kookaburra',
]

export function emptyFishCounts(): Record<FishType, number> {
  return { Minnow: 0, Perch: 0, Trout: 0, Trash: 0, Pike: 0 }
}

export function emptyCardCounts(): Record<CardType, number> {
  return { Dive: 0, Drop: 0, Splash: 0, Hover: 0 }
}

export function emptyOutcomes(): OutcomeTallies {
  return { catch: 0, steal: 0, crash: 0, blocked: 0, pike: 0 }
}

export function emptyStats(): LifetimeStats {
  return {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    fishCaught: emptyFishCounts(),
    cardsPlayed: emptyCardCounts(),
    steals: 0,
    crashes: 0,
    blocked: 0,
    pikeEvents: 0,
  }
}

export function emptyProfile(): Profile {
  return { version: 1, unlocked: [], stats: emptyStats(), matches: [] }
}
