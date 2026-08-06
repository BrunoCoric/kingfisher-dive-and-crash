import type { CardType } from './types'

export const ACTION_DECK: CardType[] = ['Dive', 'Drop', 'Splash', 'Hover']

/** Simultaneous card steps per round. Hand stays 4 cards; one is left unplayed. */
export const STEPS_PER_ROUND = 3

export const VALID_CARDS: Record<CardType, string> = {
  Dive: 'Catch a fish on one adjacent zone.',
  Drop: 'Steal a fish only if a solo Dive succeeded on that zone this step.',
  Splash: 'Block all Dives on one adjacent zone for this step.',
  Hover: 'Peek at one face-down card, then move to an adjacent perch or stay.',
}