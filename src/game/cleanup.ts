import type { Ctx } from 'boardgame.io'
import { ACTION_DECK } from './cards'
import { isFish } from './types'
import type { FishCard, GameState } from './types'
import { planFishDrift, stickyEddyZones, destinationAfterDrift } from './zones'

export function endOfRoundCleanup(G: GameState, ctx: Ctx): void {
  // Shift reveals before fish move so zone ids stay tied to the same cards.
  driftPeeked(G)
  driftFaceUp(G)
  driftFish(G)
  restock(G)
  markClearFaceUp(G)

  if (G.deck.length === 0 && G.zones.some((z) => z.fish === null)) {
    G.winner = bestPlayer(G, ctx)
  }

  handReset(G)
  G.firstPlayer = nextPlayer(G, ctx)
  G.round += 1

  G.selections = {}
  G.lastReveals = {}
  G.roundPlays = {}
  G.outcomeLog = []
  G.splashes = []
  G.sightlinePeek = {}
  G.locked = {}
}

/** Move a set of zone ids with the fish; drop catches / wash-offs. */
function driftZoneIds(G: GameState, zones: number[]): number[] {
  const kinds = G.zones.map((z) => z.kind)
  const sticky = stickyEddyZones(G.zones)
  const next: number[] = []
  for (const z of zones) {
    // Caught / empty — don't reveal whatever restocks that slot.
    if (!isFish(G.zones[z]?.fish)) continue
    const dest = destinationAfterDrift(z, kinds, sticky)
    if (dest === null) continue
    next.push(dest)
  }
  return next
}

/** Keep each player's face-up peeks on the same fish after downstream drift. */
function driftPeeked(G: GameState): void {
  const next: Record<string, number[]> = {}
  for (const pid of Object.keys(G.peeked)) {
    const zones = driftZoneIds(G, G.peeked[pid])
    if (zones.length > 0) next[pid] = zones
  }
  G.peeked = next
}

/** Public Clear reveals travel with the fish after it leaves Clear water. */
function driftFaceUp(G: GameState): void {
  G.faceUp = driftZoneIds(G, G.faceUp)
}

/** Any fish currently in Clear is public (including freshly restocked). */
function markClearFaceUp(G: GameState): void {
  const set = new Set(G.faceUp)
  for (const zone of G.zones) {
    if (zone.kind === 'clear' && isFish(zone.fish)) set.add(zone.id)
  }
  G.faceUp = [...set]
}

function driftFish(G: GameState): void {
  const plan = planFishDrift(G.zones)
  for (const fish of plan.washed) G.discard.push(fish)
  for (let i = 0; i < G.zones.length; i++) {
    G.zones[i].fish = plan.next[i]
  }
  for (const zone of G.zones) {
    if (zone.fish === null) zone.fish = drawOne(G)
  }
}

function drawOne(G: GameState): FishCard | null {
  const card = G.deck.pop() ?? null
  G.deckCount = G.deck.length
  return card
}

function restock(G: GameState): void {
  for (const zone of G.zones) {
    if (zone.fish === null) zone.fish = drawOne(G)
  }
}

function handReset(G: GameState): void {
  for (const pid in G.players) {
    G.players[pid].hand = [...ACTION_DECK]
  }
}

function nextPlayer(G: GameState, ctx: Ctx): string {
  const order = ctx.playOrder
  const idx = order.indexOf(G.firstPlayer)
  return order[(idx + 1) % order.length]
}

export function bestPlayer(G: GameState, ctx: Ctx): string | null {
  const order = ctx.playOrder
  if (order.length === 0) return null
  return order.reduce((best, pid) => {
    const a = G.players[pid]
    const b = G.players[best]
    if (a.score > b.score) return pid
    if (a.score === b.score && a.fishCount > b.fishCount) return pid
    return best
  })
}
