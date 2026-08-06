import type { GameState } from './types'

/** Face-down fish the player hasn't already seen (sightline / earlier Hover). */
export function isHoverPeekTarget(G: GameState, playerID: string, zoneId: number): boolean {
  const zone = G.zones[zoneId]
  if (!zone?.fish) return false
  if (G.sightlinePeek[playerID] === zoneId) return false
  if (G.peeked[playerID]?.includes(zoneId)) return false
  return true
}

export function hasHoverPeekTarget(G: GameState, playerID: string): boolean {
  return G.zones.some((zone) => isHoverPeekTarget(G, playerID, zone.id))
}
