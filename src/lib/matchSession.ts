import { GAME_NAME } from './gameServer'

export interface MatchSession {
  matchID: string
  playerID: string
  credentials: string
  numPlayers: number
  playerName: string
}

const KEY = 'kingfisher-match-v1'

export function saveMatchSession(session: MatchSession): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    /* private mode / quota */
  }
}

export function loadMatchSession(): MatchSession | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MatchSession
    if (
      typeof parsed.matchID !== 'string' ||
      typeof parsed.playerID !== 'string' ||
      typeof parsed.credentials !== 'string' ||
      typeof parsed.numPlayers !== 'number'
    ) {
      return null
    }
    return { ...parsed, playerName: parsed.playerName ?? 'Player' }
  } catch {
    return null
  }
}

export function clearMatchSession(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export { GAME_NAME }
