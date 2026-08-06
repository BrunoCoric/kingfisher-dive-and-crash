import type { KingfisherID } from './kingfishers'

export type CardType = 'Dive' | 'Drop' | 'Splash' | 'Hover'

export type FishType = 'Minnow' | 'Perch' | 'Trout' | 'Trash' | 'Pike'

export interface FishCard {
  id: string
  type: FishType
  points: number
}

/** Sentinel for a face-down fish as seen through a player view. */
export const HIDDEN_FISH = 'hidden' as const

export type ZoneFish = FishCard | typeof HIDDEN_FISH | null

/** Narrows a zone's fish to a real card (full-state alias for engine code). */
export function isFish(fish: ZoneFish): fish is FishCard {
  return fish !== null && fish !== HIDDEN_FISH
}

export type PerchLevel = 'high' | 'low'

export interface Perch {
  id: string
  level: PerchLevel
  zone: number
  bank: 'left' | 'right'
}

export interface RiverZone {
  id: number
  fish: ZoneFish
}

export type GamePhase =
  | 'placement'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'hover1'
  | 'hover2'
  | 'hover3'
  | 'cleanup'

export interface StepSelection {
  card: CardType
  target?: number
  moveTo?: string
  peek?: number
}

export type CalloutKind = 'catch' | 'crash' | 'steal' | 'blocked' | 'pike'

export interface OutcomeCallout {
  zone: number
  kind: CalloutKind
  actor?: string
  /** Points gained on catch / steal (public table info). */
  points?: number
}

/** Per-seat outcome counts across the whole match (Nest / unlocks). */
export interface MatchOutcomeTallies {
  catch: number
  steal: number
  crash: number
  blocked: number
  pike: number
}

export interface PlayerState {
  hand: CardType[]
  score: number
  fishCount: number
  scored: FishCard[]
  perch: string
  /** Azure Tough Gut: first Pike already used its shield this match. */
  pikeShieldUsed: boolean
}

export interface GameState {
  zones: RiverZone[]
  perches: Perch[]
  deck: FishCard[]
  /** Public remaining fish-deck size (card faces stay hidden via playerView). */
  deckCount: number
  discard: FishCard[]
  players: Record<string, PlayerState>
  currentPhase: GamePhase
  firstPlayer: string
  round: number
  step: number
  selections: Record<string, StepSelection | null>
  /** Selections from the previous step, kept for zone chips / opponent reveal rows. */
  lastReveals: Record<string, StepSelection | null>
  /**
   * Cards each seat played so far this round (public after each step resolve).
   * Cleared at end-of-round cleanup. Lets the roster show action history /
   * remaining-hand inference across the 3 steps.
   */
  roundPlays: Record<string, CardType[]>
  /**
   * Cards each seat played across the whole match (never cleared mid-game).
   * Used by Nest match summaries / unlocks at game over.
   */
  matchPlays: Record<string, CardType[]>
  /** Per-seat outcome tallies for the whole match (Nest). */
  matchOutcomes: Record<string, MatchOutcomeTallies>
  /** Zone each low-perch player peeked during placement (private sightline). */
  sightlinePeek: Record<string, number>
  /**
   * Zones revealed face-up to each player (Hover peeks + sightline). Persists
   * across rounds: drifts +1 with the fish, drops when a fish washes off or
   * leaves the river (catch / crash discard).
   */
  peeked: Record<string, number[]>
  /** Players who have locked in a selection / placement for the current step. */
  locked: Record<string, boolean>
  /** Players who have resolved their Hover move in the current hover phase. */
  hovered: string[]
  splashes: number[]
  outcomeLog: OutcomeCallout[]
  winner: string | null
  /**
   * Seats that must click Next round at cleanup. Empty = anyone (pass-and-play /
   * headless sims). Vs-bots sets the human seat so bots don't auto-skip the review.
   */
  humanSeats: string[]
  /** Scripted sandbox: fixed river + TutorialBot opponents. */
  tutorial: boolean
  /**
   * When true, each seat’s species grants one soft passive (see `powers.ts`).
   * Off for tutorial / classic symmetric play.
   */
  speciesPowers: boolean
  /** Seat → species (Create game picks human bird; bots fill the rest). */
  speciesBySeat: Record<string, KingfisherID>
}
