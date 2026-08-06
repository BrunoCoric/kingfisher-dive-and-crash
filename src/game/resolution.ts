import type { Ctx, FnContext } from 'boardgame.io'
type Random = FnContext['random']
import { isFish } from './types'
import type { CardType, FishCard, GameState } from './types'

function rotateOrder(playOrder: string[], first: string): string[] {
  const idx = playOrder.indexOf(first)
  if (idx === -1) return playOrder
  return [...playOrder.slice(idx), ...playOrder.slice(0, idx)]
}

function discardOneCard(hand: CardType[], random: Random): void {
  if (hand.length === 0) return
  const [dropped] = random.Shuffle(hand)
  hand.splice(hand.indexOf(dropped), 1)
}

function grantFish(G: GameState, pid: string, fish: FishCard, zone: number): void {
  const player = G.players[pid]
  player.scored.push(fish)
  player.score += fish.points
  player.fishCount = player.scored.length
  if (fish.type === 'Pike') returnPikePenalty(G, pid, zone)
}

function returnPikePenalty(G: GameState, pid: string, zone: number): void {
  const player = G.players[pid]
  const lowest = player.scored
    .filter((fish) => fish.type !== 'Pike')
    .reduce<FishCard | undefined>((lowestFish, fish) =>
      !lowestFish || fish.points < lowestFish.points ? fish : lowestFish,
    undefined)
  if (lowest) {
    const idx = player.scored.indexOf(lowest)
    player.scored.splice(idx, 1)
    player.score -= lowest.points
    G.discard.push(lowest)
  }
  const pikeIndex = player.scored.findIndex((fish) => fish.type === 'Pike')
  if (pikeIndex !== -1) {
    const pike = player.scored.splice(pikeIndex, 1)[0]
    player.score -= pike.points
    G.discard.push(pike)
  }
  player.fishCount = player.scored.length
  G.outcomeLog.push({ zone, kind: 'pike', actor: pid })
}

function discardExtraCard(G: GameState, pid: string, random: Random): void {
  discardOneCard(G.players[pid].hand, random)
}

function crashPlayer(G: GameState, pid: string, zone: number, random: Random): void {
  discardExtraCard(G, pid, random)
  G.outcomeLog.push({ zone, kind: 'crash', actor: pid })
}

function blockPlayer(G: GameState, pid: string, zone: number, random: Random): void {
  discardExtraCard(G, pid, random)
  G.outcomeLog.push({ zone, kind: 'blocked', actor: pid })
}

interface DiveResult {
  solo: boolean
  diver?: string
  fish?: FishCard
}

export function resolveStep(G: GameState, ctx: Ctx, random: Random): void {
  // Snapshot this step's plays for the reveal UI / belief before selections are
  // cleared by the next phase. Keep the previous step's callouts visible until
  // this resolution runs so every seat's bot can fold crashes/steals into hand
  // belief on its first think of the new step.
  G.lastReveals = { ...G.selections }
  G.outcomeLog = []
  const order = rotateOrder(ctx.playOrder, G.firstPlayer)
  resolveSplashes(G, order, random)
  const diveResults = resolveDives(G, order, random)
  resolveDrops(G, order, diveResults, random)
  pruneSettledLog(G)
}

function resolveSplashes(G: GameState, order: string[], random: Random): void {
  const byZone = new Map<number, string[]>()
  for (const pid of order) {
    const sel = G.selections[pid]
    if (sel?.card !== 'Splash' || sel.target === undefined) continue
    const list = byZone.get(sel.target) ?? []
    list.push(pid)
    byZone.set(sel.target, list)
  }
  for (const [zone, pids] of byZone) {
    if (pids.length > 1) {
      for (const pid of pids) crashPlayer(G, pid, zone, random)
      discardZoneFish(G, zone)
    } else {
      G.splashes.push(zone)
    }
  }
}

function discardZoneFish(G: GameState, zone: number): void {
  const fish = G.zones[zone].fish
  if (!isFish(fish)) return
  G.zones[zone].fish = null
  G.discard.push(fish)
}

function resolveDives(G: GameState, order: string[], random: Random): Map<number, DiveResult> {
  const byZone = new Map<number, string[]>()
  for (const pid of order) {
    const sel = G.selections[pid]
    if (sel?.card !== 'Dive' || sel.target === undefined) continue
    const list = byZone.get(sel.target) ?? []
    list.push(pid)
    byZone.set(sel.target, list)
  }

  const results = new Map<number, DiveResult>()
  for (const [zone, pids] of byZone) {
    const fish = G.zones[zone].fish
    if (!isFish(fish)) continue
    if (G.splashes.includes(zone)) {
      for (const pid of pids) {
        blockPlayer(G, pid, zone, random)
      }
      results.set(zone, { solo: false })
      continue
    }
    if (pids.length === 1) {
      // Defer grant until after Drops — Drop+Drop Crash discards the fish.
      G.zones[zone].fish = null
      results.set(zone, { solo: true, diver: pids[0], fish })
    } else {
      for (const pid of pids) crashPlayer(G, pid, zone, random)
      discardZoneFish(G, zone)
      results.set(zone, { solo: false })
    }
  }
  return results
}

function grantSoloCatch(G: GameState, zone: number, dive: DiveResult): void {
  if (dive.diver === undefined || dive.fish === undefined) return
  grantFish(G, dive.diver, dive.fish, zone)
  if (dive.fish.type !== 'Pike') {
    G.outcomeLog.push({ zone, kind: 'catch', actor: dive.diver, points: dive.fish.points })
  }
}

function resolveDrops(G: GameState, order: string[], diveResults: Map<number, DiveResult>, random: Random): void {
  const byZone = new Map<number, string[]>()
  for (const pid of order) {
    const sel = G.selections[pid]
    if (sel?.card !== 'Drop' || sel.target === undefined) continue
    const list = byZone.get(sel.target) ?? []
    list.push(pid)
    byZone.set(sel.target, list)
  }

  const settled = new Set<number>()
  for (const [zone, pids] of byZone) {
    const dive = diveResults.get(zone)
    const successful = Boolean(dive?.solo && dive.diver !== undefined && dive.fish !== undefined)

    // Same-action Crash: 2+ Drops always collide, even if the Dive failed.
    if (pids.length > 1) {
      for (const pid of pids) crashPlayer(G, pid, zone, random)
      if (successful && dive?.fish) {
        settled.add(zone)
        G.discard.push(dive.fish)
      } else {
        discardZoneFish(G, zone)
      }
      continue
    }

    // Steal only from a successful solo Dive (Splash-blocked / crashed Dive → nothing).
    if (!successful || !dive?.diver || !dive.fish) continue
    settled.add(zone)
    const dropper = pids[0]
    grantSoloCatch(G, zone, dive)
    stealFish(G, dropper, dive.diver, dive.fish)
    if (G.players[dropper].scored.some((fish) => fish.id === dive.fish?.id)) {
      G.outcomeLog.push({ zone, kind: 'steal', actor: dropper, points: dive.fish.points })
    }
  }

  for (const [zone, dive] of diveResults) {
    if (!dive.solo || settled.has(zone)) continue
    grantSoloCatch(G, zone, dive)
  }
}

function stealFish(G: GameState, dropper: string, diver: string, fish: FishCard): void {
  const victim = G.players[diver]
  const idx = victim.scored.findIndex((f) => f.id === fish.id)
  if (idx === -1) return
  victim.scored.splice(idx, 1)
  victim.score -= fish.points
  victim.fishCount = victim.scored.length
  G.players[diver].hand.push('Dive')
  grantFish(G, dropper, fish, -1)
}

function pruneSettledLog(G: GameState): void {
  const stolenZones = new Set(G.outcomeLog.filter((c) => c.kind === 'steal').map((c) => c.zone))
  if (stolenZones.size === 0) return
  G.outcomeLog = G.outcomeLog.filter((c) => !(c.kind === 'catch' && stolenZones.has(c.zone)))
}
