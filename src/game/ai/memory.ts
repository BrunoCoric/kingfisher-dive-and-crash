import type { GameState } from '../types'
import { isFish } from '../types'
import type { BotMemory, KnownFish } from './types'

/**
 * Fish-drift memory. The bot only ever sees fish it revealed (sightline /
 * Hover peek) and can never see the deck, so its memory is a private,
 * approximate map of "fish id → predicted zone". Drift is deterministic
 * (+1 zone at cleanup, downstream edge washes out), so remembered fish are
 * shifted once per round change and pruned when they exit the river.
 */
export function initMemory(zoneCount: number): BotMemory {
  return { lastRound: 1, beliefRound: 1, zoneCount, known: [], oppHands: {}, seenKey: '' }
}

export function knownFishIn(memory: BotMemory, zone: number): KnownFish | undefined {
  let best: KnownFish | undefined
  for (const f of memory.known) {
    if (f.zone === zone && (!best || f.round >= best.round)) best = f
  }
  return best
}

/**
 * On a round change, shift every remembered fish one zone downstream and drop
 * any that washed off the downstream edge. Runs exactly once per cleanup.
 */
export function driftMemory(memory: BotMemory, view: GameState): void {
  if (memory.lastRound === view.round) return
  const zoneCount = memory.zoneCount
  const drifted: KnownFish[] = []
  for (const f of memory.known) {
    const zone = f.zone + 1
    if (zone >= zoneCount) continue
    drifted.push({ ...f, zone, round: f.round + 1 })
  }
  memory.known = drifted
  memory.lastRound = view.round
}

/**
 * Fold this step's revealed zones (sightline + Hover peeks) into memory. The
 * player view already hides everything else, so anything `isFish` here is
 * genuinely known to the bot this round.
 */
export function absorbReveals(memory: BotMemory, view: GameState): void {
  for (const zone of view.zones) {
    const fish = zone.fish
    if (!isFish(fish)) continue
    memory.known = memory.known.filter((f) => f.id !== fish.id)
    memory.known.push({
      id: fish.id,
      type: fish.type,
      points: fish.points,
      zone: zone.id,
      round: view.round,
    })
  }
}

/**
 * Drop remembered fish that the outcome log shows leaving the river this step:
 * caught, pike-discarded, or stolen. Crash leaves the fish on the zone.
 */
export function pruneCaught(memory: BotMemory, view: GameState): void {
  const gone = new Set<number>()
  for (const callout of view.outcomeLog) {
    if (callout.kind === 'catch' || callout.kind === 'steal' || callout.kind === 'pike') {
      gone.add(callout.zone)
    }
  }
  if (gone.size === 0) return
  memory.known = memory.known.filter((f) => !gone.has(f.zone))
}

/** Convenience: run the whole round-boundary bookkeeping for a fresh view. */
export function syncMemory(memory: BotMemory, view: GameState): void {
  driftMemory(memory, view)
  pruneCaught(memory, view)
  absorbReveals(memory, view)
}