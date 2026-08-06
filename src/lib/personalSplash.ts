import type { GameState } from '../game/types'

export type SplashValence = 'good' | 'bad'

export interface PersonalSplash {
  valence: SplashValence
  /** Display callout, e.g. "CATCH +2" / "CRASH!" */
  label: string
}

function pointsSuffix(points: number | undefined): string {
  return points !== undefined ? ` +${points}` : ''
}

/**
 * Local-seat splash for fish gains (catch / steal) or Crash (extra card lost).
 * Crash beats fish if both somehow appear. Null = no splash.
 */
export function personalOutcomeSplash(G: GameState, pid: string): PersonalSplash | null {
  if (!pid || G.outcomeLog.length === 0) return null

  const mine = G.outcomeLog.filter((c) => c.actor === pid)
  if (mine.some((c) => c.kind === 'crash')) return { valence: 'bad', label: 'CRASH!' }

  const fish = mine.find((c) => c.kind === 'steal') ?? mine.find((c) => c.kind === 'catch')
  if (fish) {
    return {
      valence: 'good',
      label: `${fish.kind.toUpperCase()}${pointsSuffix(fish.points)}`,
    }
  }

  return null
}
