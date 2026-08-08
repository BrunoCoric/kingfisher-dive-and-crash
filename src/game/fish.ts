import type { FishCard, FishType } from './types'

export const FISH_POINTS: Record<FishType, number> = {
  Minnow: 1,
  Perch: 2,
  Trout: 3,
  Trash: 0,
  Pike: 0,
}

export type FishCounts = {
  Minnow: number
  Perch: number
  Trout: number
  Trash: number
  Pike: number
}

export const FISH_COUNTS: Record<number, FishCounts> = {
  2: { Minnow: 10, Perch: 8, Trout: 3, Trash: 2, Pike: 2 }, // 25
  3: { Minnow: 12, Perch: 10, Trout: 4, Trash: 3, Pike: 3 }, // 32
  4: { Minnow: 13, Perch: 11, Trout: 6, Trash: 4, Pike: 5 }, // 39
  5: { Minnow: 14, Perch: 12, Trout: 8, Trash: 3, Pike: 6 }, // 43
}

const FISH_TYPES: FishType[] = ['Minnow', 'Perch', 'Trout', 'Trash', 'Pike']

const RIVER_ZONES: Record<number, number> = { 2: 4, 3: 5, 4: 6, 5: 7 }

export const MIN_ZONES = 4
export const MAX_ZONES = 7
export const MIN_DECK = 12
export const MAX_DECK = 60

export function countsTotal(counts: FishCounts): number {
  return FISH_TYPES.reduce((sum, type) => sum + counts[type], 0)
}

export function deckTotalFor(playerCount: number): number {
  return countsTotal(FISH_COUNTS[playerCount] ?? FISH_COUNTS[4])
}

export function clampZoneCount(n: number): number {
  return Math.min(MAX_ZONES, Math.max(MIN_ZONES, Math.round(n)))
}

export function clampDeckSize(n: number, zoneCount: number): number {
  const min = Math.max(MIN_DECK, zoneCount)
  return Math.min(MAX_DECK, Math.max(min, Math.round(n)))
}

export function riverZonesFor(playerCount: number, override?: number): number {
  if (override !== undefined) return clampZoneCount(override)
  return clampZoneCount(RIVER_ZONES[playerCount] ?? 5)
}

/** Largest-remainder scale of a player-count mix toward `target` cards. */
export function scaleCounts(base: FishCounts, target: number): FishCounts {
  const baseTotal = countsTotal(base)
  if (baseTotal <= 0 || target <= 0) {
    return { Minnow: target, Perch: 0, Trout: 0, Trash: 0, Pike: 0 }
  }
  const parts = FISH_TYPES.map((type) => {
    const exact = (base[type] * target) / baseTotal
    const n = Math.floor(exact)
    return { type, n, frac: exact - n }
  })
  let used = parts.reduce((sum, p) => sum + p.n, 0)
  parts.sort((a, b) => b.frac - a.frac || a.type.localeCompare(b.type))
  for (let i = 0; used < target; i++, used++) {
    parts[i % parts.length].n += 1
  }
  const out: FishCounts = { Minnow: 0, Perch: 0, Trout: 0, Trash: 0, Pike: 0 }
  for (const p of parts) out[p.type] = p.n
  return out
}

export function fishCountsFor(playerCount: number, deckSize?: number): FishCounts {
  const base = FISH_COUNTS[playerCount] ?? FISH_COUNTS[4]
  if (deckSize === undefined || deckSize === countsTotal(base)) return base
  return scaleCounts(base, clampDeckSize(deckSize, MIN_ZONES))
}

export function buildDeck(playerCount: number, deckSize?: number): FishCard[] {
  const counts = fishCountsFor(playerCount, deckSize)
  const deck: FishCard[] = []
  let id = 0
  for (const type of FISH_TYPES) {
    for (let i = 0; i < counts[type]; i++) {
      deck.push({ id: `fish-${id++}`, type, points: FISH_POINTS[type] })
    }
  }
  return deck
}
