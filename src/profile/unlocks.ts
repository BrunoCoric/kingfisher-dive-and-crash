import type { KingfisherID } from '../game/kingfishers'
import { KINGFISHERS } from '../game/kingfishers'
import type { MatchSummary, Profile, UnlockId } from './types'
import { LOCKED_BIRDS } from './types'

export const UNLOCK_META: Record<UnlockId, { name: string; flavor: string }> = {
  pied: {
    name: KINGFISHERS.pied.displayName,
    flavor: 'Win a match against the bots.',
  },
  orientalDwarf: {
    name: KINGFISHERS.orientalDwarf.displayName,
    flavor: 'Keep a Golden Trout in your pile.',
  },
  belted: {
    name: KINGFISHERS.belted.displayName,
    flavor: 'Crash 3+ times and still finish top two.',
  },
  azure: {
    name: KINGFISHERS.azure.displayName,
    flavor: 'Finish five vs-bots matches.',
  },
  yellowBilled: {
    name: KINGFISHERS.yellowBilled.displayName,
    flavor: 'Steal a fish with Drop.',
  },
  banded: {
    name: KINGFISHERS.banded.displayName,
    flavor: 'Get blocked by a Splash once.',
  },
  green: {
    name: KINGFISHERS.green.displayName,
    flavor: 'Keep a Perch in your pile.',
  },
  kookaburra: {
    name: KINGFISHERS.kookaburra.displayName,
    flavor: 'Play Dive, Drop, Splash, and Hover in one match.',
  },
}

export const STARTER_FLAVOR = 'Starter — ready to dive.'

/** Pure: which bird unlocks fire given current profile + the match just recorded. */
export function evaluateUnlocks(profile: Profile, match: MatchSummary): UnlockId[] {
  const have = new Set(profile.unlocked)
  const next: UnlockId[] = []
  const add = (id: UnlockId) => {
    if (!have.has(id)) next.push(id)
  }

  if (match.place === 1) add('pied')
  if (profile.stats.fishCaught.Trout >= 1) add('orientalDwarf')
  if (match.outcomes.crash >= 3 && match.place <= 2) add('belted')
  if (profile.stats.matchesPlayed >= 5) add('azure')
  if (match.outcomes.steal >= 1) add('yellowBilled')
  if (match.outcomes.blocked >= 1) add('banded')
  if (profile.stats.fishCaught.Perch >= 1) add('green')
  if (
    match.cardsPlayed.Dive >= 1 &&
    match.cardsPlayed.Drop >= 1 &&
    match.cardsPlayed.Splash >= 1 &&
    match.cardsPlayed.Hover >= 1
  ) {
    add('kookaburra')
  }

  return next
}

export function isBirdUnlocked(profile: Profile, id: KingfisherID): boolean {
  if (id === 'common') return true
  return profile.unlocked.includes(id)
}

/** Birds the player may pick in Create game (Common always first). */
export function playableBirds(profile: Profile): KingfisherID[] {
  return (['common', ...LOCKED_BIRDS] as KingfisherID[]).filter((id) =>
    isBirdUnlocked(profile, id),
  )
}
