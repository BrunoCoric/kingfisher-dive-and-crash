import type { Ctx } from 'boardgame.io'
import type { GameState, StepSelection, ZoneFish } from './types'
import { HIDDEN_FISH } from './types'

function revealZone(G: GameState, playerID: string, zoneId: number): boolean {
  if (G.zones[zoneId]?.kind === 'clear') return true
  if (G.faceUp.includes(zoneId)) return true
  return G.sightlinePeek[playerID] === zoneId || (G.peeked[playerID]?.includes(zoneId) ?? false)
}

/**
 * Hidden-information view for one player. The master always holds full state
 * (real `FishCard`s); client views and bot decision inputs are filtered here.
 * Must stay pure: the engine diffs filtered states to build sync patches.
 * Online Socket.IO matches rely on this — never ship unfiltered G to clients.
 *
 * After a step resolves, `lastReveals` (incl. Hover peek *zones*) stay public so
 * board chips can show who Hovered where — only the fish face stays private
 * via zone filtering / `peeked`.
 */
export function filterPlayerView({
  G,
  playerID,
}: {
  G: GameState
  ctx: Ctx
  playerID: string | null
}): GameState {
  if (playerID === null) return G

  const zones = G.zones.map((zone) => {
    const revealed = revealZone(G, playerID, zone.id)
    const fish: ZoneFish = revealed ? zone.fish : zone.fish ? HIDDEN_FISH : null
    return { ...zone, fish }
  })

  const players: Record<string, GameState['players'][string]> = {}
  for (const pid in G.players) {
    // Hands stay private; scoring piles are public table info.
    players[pid] = pid === playerID ? G.players[pid] : { ...G.players[pid], hand: [] }
  }

  // Pending picks stay private until the step resolves into lastReveals.
  const selections: Record<string, StepSelection | null> =
    playerID in G.selections ? { [playerID]: G.selections[playerID] } : {}

  const sightlinePeek: Record<string, number> =
    playerID in G.sightlinePeek ? { [playerID]: G.sightlinePeek[playerID] } : {}

  // Peeks are private and persist across rounds — never leak other seats' lists.
  const peeked: Record<string, number[]> =
    playerID in G.peeked ? { [playerID]: G.peeked[playerID] } : {}

  return {
    ...G,
    zones,
    players,
    selections,
    sightlinePeek,
    peeked,
    deck: [],
    deckCount: G.deck.length,
  }
}
