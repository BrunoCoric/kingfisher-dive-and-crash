import type { Ctx, FnContext } from 'boardgame.io'
type Random = FnContext['random']
import { isFish } from './types'
import { hasPower } from './powers'
import type { CalloutKind, CardType, FishCard, GameState, MatchOutcomeTallies } from './types'

const EMPTY_OUTCOMES: MatchOutcomeTallies = {
  catch: 0,
  steal: 0,
  crash: 0,
  blocked: 0,
  pike: 0,
}

function tallyOutcomes(G: GameState): void {
  for (const callout of G.outcomeLog) {
    if (!callout.actor) continue
    const row = (G.matchOutcomes[callout.actor] ??= { ...EMPTY_OUTCOMES })
    const key = callout.kind as CalloutKind
    row[key]++
  }
}

function rotateOrder(playOrder: string[], first: string): string[] {
  const idx = playOrder.indexOf(first)
  if (idx === -1) return playOrder
  return [...playOrder.slice(idx), ...playOrder.slice(0, idx)]
}

/** Extra hand tax on Crash. Tutorial burns Splash first so later Hover lessons stay legal. */
function discardOneCard(hand: CardType[], random: Random, tutorial: boolean): void {
  if (hand.length === 0) return
  if (tutorial) {
    const prefer: CardType[] = ['Splash', 'Drop', 'Dive', 'Hover']
    const pick = prefer.find((c) => hand.includes(c)) ?? hand[0]
    hand.splice(hand.indexOf(pick), 1)
    return
  }
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

/** Pike is 0 VP; if the catcher holds a Minnow, discard that Minnow too. */
function returnPikePenalty(G: GameState, pid: string, zone: number): void {
  const player = G.players[pid]
  // Azure Tough Gut: first Pike this match skips the Minnow tax.
  const shield = hasPower(G, pid, 'toughGut') && !player.pikeShieldUsed
  if (shield) {
    player.pikeShieldUsed = true
  } else {
    const minnowIndex = player.scored.findIndex((fish) => fish.type === 'Minnow')
    if (minnowIndex !== -1) {
      const minnow = player.scored.splice(minnowIndex, 1)[0]
      player.score -= minnow.points
      G.discard.push(minnow)
    }
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

/** Crash: spent played card + one random extra hand card; fish stays on the zone. */
function crashPlayer(G: GameState, pid: string, zone: number, random: Random): void {
  // Common Steady Wing: skip the extra discard (played card already spent).
  if (!hasPower(G, pid, 'steadyWing')) {
    discardOneCard(G.players[pid].hand, random, G.tutorial)
  }
  // Green Speckled Wing: Crash privately peeks the contested zone (fish stays).
  if (hasPower(G, pid, 'speckledWing') && isFish(G.zones[zone]?.fish)) {
    const seen = G.peeked[pid] ?? []
    if (!seen.includes(zone)) G.peeked[pid] = [...seen, zone]
  }
  G.outcomeLog.push({ zone, kind: 'crash', actor: pid })
}

function blockPlayer(G: GameState, pid: string, zone: number): void {
  G.outcomeLog.push({ zone, kind: 'blocked', actor: pid })
  // Banded Barred Watch: blocked Dive privately peeks that zone.
  if (hasPower(G, pid, 'barredWatch') && isFish(G.zones[zone]?.fish)) {
    const seen = G.peeked[pid] ?? []
    if (!seen.includes(zone)) G.peeked[pid] = [...seen, zone]
  }
  // Kookaburra Hearty Dive: blocked Dive returns to hand.
  if (hasPower(G, pid, 'heartyDive')) {
    G.players[pid].hand.push('Dive')
  }
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
  for (const pid of ctx.playOrder) {
    const card = G.selections[pid]?.card
    if (!card) continue
    ;(G.roundPlays[pid] ??= []).push(card)
    ;(G.matchPlays[pid] ??= []).push(card)
  }
  G.outcomeLog = []
  const order = rotateOrder(ctx.playOrder, G.firstPlayer)
  resolveSplashes(G, order, random)
  const diveResults = resolveDives(G, order, random)
  resolveDrops(G, order, diveResults, random)
  pruneSettledLog(G)
  tallyOutcomes(G)
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
      // Fish stays — Crash taxes hands, not the prize.
    } else {
      G.splashes.push(zone)
      // Yellow-billed Sun Bill: solo Splash privately peeks that zone.
      const pid = pids[0]
      if (hasPower(G, pid, 'sunBill') && isFish(G.zones[zone]?.fish)) {
        const seen = G.peeked[pid] ?? []
        if (!seen.includes(zone)) G.peeked[pid] = [...seen, zone]
      }
    }
  }
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
        blockPlayer(G, pid, zone)
      }
      results.set(zone, { solo: false })
      continue
    }
    if (pids.length === 1) {
      // Lift fish pending Drop resolution; Drop+Drop Crash returns it to the zone.
      G.zones[zone].fish = null
      results.set(zone, { solo: true, diver: pids[0], fish })
    } else {
      for (const pid of pids) crashPlayer(G, pid, zone, random)
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

function resolveDrops(
  G: GameState,
  order: string[],
  diveResults: Map<number, DiveResult>,
  random: Random,
): void {
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
        G.zones[zone].fish = dive.fish
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
