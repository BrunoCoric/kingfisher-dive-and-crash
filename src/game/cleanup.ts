import type { Ctx } from 'boardgame.io'
import { ACTION_DECK } from './cards'
import { isFish } from './types'
import type { FishCard, GameState } from './types'

export function endOfRoundCleanup(G: GameState, ctx: Ctx): void {
  driftFish(G)
  restock(G)

  if (G.deck.length === 0 && G.zones.some((z) => z.fish === null)) {
    G.winner = bestPlayer(G, ctx)
  }

  handReset(G)
  G.firstPlayer = nextPlayer(G, ctx)
  G.round += 1

  G.selections = {}
  G.lastReveals = {}
  G.outcomeLog = []
  G.splashes = []
  G.sightlinePeek = {}
  G.peeked = {}
  G.locked = {}
}

function driftFish(G: GameState): void {
  const last = G.zones.length - 1
  const dropped = G.zones[last].fish
  if (isFish(dropped)) G.discard.push(dropped)
  for (let i = last; i >= 1; i--) {
    G.zones[i].fish = G.zones[i - 1].fish
  }
  G.zones[0].fish = null
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
