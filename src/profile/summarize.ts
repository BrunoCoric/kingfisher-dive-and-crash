import type { CardType, FishType, GameState } from '../game/types'
import type { MatchSummary, OutcomeTallies } from './types'
import { emptyCardCounts, emptyFishCounts, emptyOutcomes } from './types'

function countCards(plays: CardType[]): Record<CardType, number> {
  const counts = emptyCardCounts()
  for (const c of plays) counts[c]++
  return counts
}

function countFish(types: FishType[]): Record<FishType, number> {
  const counts = emptyFishCounts()
  for (const t of types) counts[t]++
  return counts
}

function placeOf(G: GameState, playOrder: string[], seat: string): number {
  const standings = [...playOrder].sort((a, b) => {
    const scoreDiff = G.players[b].score - G.players[a].score
    return scoreDiff || G.players[b].fishCount - G.players[a].fishCount
  })
  return standings.indexOf(seat) + 1
}

export function summarizeMatch(
  G: GameState,
  playOrder: string[],
  humanSeat: string,
): MatchSummary {
  const player = G.players[humanSeat]
  const outcomes: OutcomeTallies = { ...emptyOutcomes(), ...(G.matchOutcomes[humanSeat] ?? {}) }
  return {
    at: new Date().toISOString(),
    players: playOrder.length,
    place: placeOf(G, playOrder, humanSeat),
    score: player.score,
    cardsPlayed: countCards(G.matchPlays[humanSeat] ?? []),
    outcomes,
    fishCaught: countFish(player.scored.map((f) => f.type)),
  }
}
