import { isFish } from './types'
import type { FishCard, RiverZone, ZoneFish, ZoneKind } from './types'

export type { ZoneKind }

export const ZONE_KIND_LABEL: Record<ZoneKind, string> = {
  open: 'Open water',
  eddy: 'Eddy',
  rapids: 'Rapids',
  clear: 'Clear shallows',
}

/** Compact chip label for the river tile (full name lives in the tip). */
export const ZONE_KIND_SHORT: Record<Exclude<ZoneKind, 'open'>, string> = {
  eddy: 'Eddy',
  rapids: 'Rapids',
  clear: 'Clear',
}

export const ZONE_KIND_BLURB: Record<Exclude<ZoneKind, 'open'>, string> = {
  eddy: 'Fish stays. Upstream fish skips past if the Eddy is occupied.',
  rapids: 'Fish drifts +2 (washes off the river if past the last zone).',
  clear: 'Fish here is face-up for everyone, and stays face-up as it drifts.',
}

export const MIN_SPECIAL_ZONES = 0
export const MAX_SPECIAL_ZONES = 3

/** Pool of special kinds (never duplicates on one river). */
export const SPECIAL_KIND_POOL: Exclude<ZoneKind, 'open'>[] = ['clear', 'eddy', 'rapids']

export function clampSpecialZones(n: number, zoneCount: number): number {
  const max = Math.min(MAX_SPECIAL_ZONES, Math.max(0, zoneCount - 1))
  return Math.max(MIN_SPECIAL_ZONES, Math.min(max, Math.floor(n)))
}

/**
 * Pick `specialCount` distinct kinds from the pool and place each on a random
 * zone. `shuffle` must return a new order (e.g. boardgame.io `random.Shuffle`).
 */
export function assignZoneKinds(
  zoneCount: number,
  specialCount: number,
  shuffle: <T>(items: T[]) => T[],
): ZoneKind[] {
  const kinds: ZoneKind[] = Array.from({ length: zoneCount }, () => 'open')
  const n = clampSpecialZones(specialCount, zoneCount)
  if (n < 1 || zoneCount < 1) return kinds

  const chosen = shuffle([...SPECIAL_KIND_POOL]).slice(0, n)
  const seats = shuffle(Array.from({ length: zoneCount }, (_, i) => i)).slice(0, n)
  for (let i = 0; i < n; i++) {
    kinds[seats[i]] = chosen[i]
  }
  return kinds
}

/** Specials present on the board, stable pool order for Rules copy. */
export function specialKindsIn(
  zones: readonly { kind: ZoneKind }[],
): Exclude<ZoneKind, 'open'>[] {
  const present = new Set(zones.map((z) => z.kind))
  return SPECIAL_KIND_POOL.filter((k) => present.has(k))
}

export function driftStep(kind: ZoneKind): number {
  if (kind === 'eddy') return 0
  if (kind === 'rapids') return 2
  return 1
}

/** Eddy seats that keep their fish this cleanup (skip targets for upstream fish). */
export function stickyEddyZones(
  zones: readonly { kind: ZoneKind; fish: ZoneFish; id?: number }[],
): Set<number> {
  const sticky = new Set<number>()
  zones.forEach((z, i) => {
    if (z.kind === 'eddy' && isFish(z.fish)) sticky.add(z.id ?? i)
  })
  return sticky
}

/**
 * Destination after end-of-round drift, or `null` if the fish washes off.
 * Occupied Eddies are skipped; further occupied seats keep skipping downstream.
 */
export function destinationAfterDrift(
  from: number,
  kinds: readonly ZoneKind[],
  sticky: ReadonlySet<number>,
  occupied: ReadonlySet<number> = sticky,
): number | null {
  const step = driftStep(kinds[from] ?? 'open')
  if (step === 0) return from

  let dest = from + step
  while (dest < kinds.length && occupied.has(dest)) {
    dest += 1
  }
  if (dest >= kinds.length) return null
  return dest
}

export interface DriftPlan {
  /** Fish that remain on the river, index = zone id. */
  next: (FishCard | null)[]
  washed: FishCard[]
  /** Per source zone: where that zone's fish goes (`null` = none / washed). */
  fromTo: (number | null)[]
}

/** Pure drift of current zone fish (empties stay empty until restock). */
export function planFishDrift(zones: readonly RiverZone[]): DriftPlan {
  const n = zones.length
  const kinds = zones.map((z) => z.kind)
  const sticky = stickyEddyZones(zones)
  const next: (FishCard | null)[] = Array.from({ length: n }, () => null)
  const washed: FishCard[] = []
  const fromTo: (number | null)[] = Array.from({ length: n }, () => null)
  const claimed = new Set<number>(sticky)

  // Pin Eddy fish first so skip logic sees them as occupied.
  for (let i = 0; i < n; i++) {
    if (!sticky.has(i)) continue
    const fish = zones[i].fish
    if (!isFish(fish)) continue
    next[i] = fish
    fromTo[i] = i
  }

  for (let i = 0; i < n; i++) {
    if (sticky.has(i)) continue
    const fish = zones[i].fish
    if (!isFish(fish)) continue

    const dest = destinationAfterDrift(i, kinds, sticky, claimed)
    fromTo[i] = dest
    if (dest === null) {
      washed.push(fish)
      continue
    }
    next[dest] = fish
    claimed.add(dest)
  }

  return { next, washed, fromTo }
}

export type DriftVisual = 'stay' | 'drift' | 'fast' | 'off' | null

/** CSS cue for the pre-cleanup drift beat (best-effort when skips happen). */
export function driftVisualFor(zone: RiverZone, plan: DriftPlan): DriftVisual {
  if (!isFish(zone.fish)) return null
  const dest = plan.fromTo[zone.id]
  if (dest === null) return 'off'
  if (dest === zone.id) return 'stay'
  if (zone.kind === 'rapids' || dest - zone.id >= 2) return 'fast'
  return 'drift'
}
