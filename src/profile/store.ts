import type { MatchSummary, Profile, UnlockId } from './types'
import { CARD_TYPES, FISH_TYPES, emptyProfile } from './types'
import { evaluateUnlocks } from './unlocks'

const STORAGE_KEY = 'kingfisher-nest-v1'
const MATCH_CAP = 20

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProfile()
    const parsed = JSON.parse(raw) as Profile
    if (parsed?.version !== 1 || !parsed.stats || !Array.isArray(parsed.unlocked)) {
      return emptyProfile()
    }
    return parsed
  } catch {
    return emptyProfile()
  }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Quota / private mode — skip silently.
  }
}

function mergeMatch(profile: Profile, match: MatchSummary): Profile {
  const stats = { ...profile.stats }
  stats.matchesPlayed += 1
  if (match.place === 1) stats.wins += 1
  else stats.losses += 1

  stats.fishCaught = { ...stats.fishCaught }
  for (const t of FISH_TYPES) stats.fishCaught[t] += match.fishCaught[t]

  stats.cardsPlayed = { ...stats.cardsPlayed }
  for (const c of CARD_TYPES) stats.cardsPlayed[c] += match.cardsPlayed[c]

  stats.steals += match.outcomes.steal
  stats.crashes += match.outcomes.crash
  stats.blocked += match.outcomes.blocked
  stats.pikeEvents += match.outcomes.pike

  return {
    ...profile,
    stats,
    matches: [match, ...profile.matches].slice(0, MATCH_CAP),
  }
}

export interface RecordResult {
  profile: Profile
  newlyUnlocked: UnlockId[]
}

/** Merge one finished match into the Nest and persist. */
export function recordMatch(match: MatchSummary): RecordResult {
  let profile = mergeMatch(loadProfile(), match)
  const newlyUnlocked = evaluateUnlocks(profile, match)
  if (newlyUnlocked.length > 0) {
    profile = { ...profile, unlocked: [...profile.unlocked, ...newlyUnlocked] }
  }
  saveProfile(profile)
  return { profile, newlyUnlocked }
}

let lastRecordKey = ''
let lastNewUnlocks: UnlockId[] = []

/** Dedupe GameOver re-renders (same pattern as cueWinSfx). */
export function recordMatchOnce(matchKey: string, match: MatchSummary): UnlockId[] {
  if (matchKey === lastRecordKey) return lastNewUnlocks
  lastRecordKey = matchKey
  lastNewUnlocks = recordMatch(match).newlyUnlocked
  return lastNewUnlocks
}
