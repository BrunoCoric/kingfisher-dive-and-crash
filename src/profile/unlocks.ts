import type { MatchSummary, Profile, UnlockId } from './types'
import { CARD_TYPES } from './types'

export const UNLOCK_META: Record<UnlockId, { name: string; flavor: string }> = {
  'first-win': { name: 'First Splash of Glory', flavor: 'Win a match against the bots.' },
  'drop-only-win': { name: 'Ambush Artist', flavor: 'Win a match playing only Drop.' },
  'first-trout': { name: 'Golden Catch', flavor: 'Keep a Golden Trout in your pile.' },
  'crash-and-place': { name: 'Ruffled but Rising', flavor: 'Crash 3+ times and still finish top two.' },
  'five-matches': { name: 'River Regular', flavor: 'Finish five vs-bots matches.' },
}

function onlyDrops(cards: MatchSummary['cardsPlayed']): boolean {
  const total = CARD_TYPES.reduce((n, c) => n + cards[c], 0)
  return total > 0 && CARD_TYPES.every((c) => c === 'Drop' || cards[c] === 0)
}

/** Pure: which unlocks fire given current profile + the match just recorded. */
export function evaluateUnlocks(profile: Profile, match: MatchSummary): UnlockId[] {
  const have = new Set(profile.unlocked)
  const next: UnlockId[] = []
  const add = (id: UnlockId) => {
    if (!have.has(id)) next.push(id)
  }

  if (match.place === 1) add('first-win')
  if (match.place === 1 && onlyDrops(match.cardsPlayed)) add('drop-only-win')
  if (profile.stats.fishCaught.Trout >= 1) add('first-trout')
  if (match.outcomes.crash >= 3 && match.place <= 2) add('crash-and-place')
  if (profile.stats.matchesPlayed >= 5) add('five-matches')

  return next
}
