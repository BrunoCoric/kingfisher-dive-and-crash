import type { FishCard, FishType } from './types'

export const FISH_POINTS: Record<FishType, number> = {
  Minnow: 1,
  Perch: 2,
  Trout: 3,
  Trash: 0,
  Pike: 0,
}

export const FISH_COUNTS: Record<number, { Minnow: number; Perch: number; Trout: number; Trash: number; Pike: number }> = {
  2: { Minnow: 10, Perch: 8, Trout: 3, Trash: 2, Pike: 2 }, // 25
  3: { Minnow: 12, Perch: 10, Trout: 4, Trash: 3, Pike: 3 }, // 32
  4: { Minnow: 13, Perch: 11, Trout: 6, Trash: 4, Pike: 5 }, // 39
  5: { Minnow: 14, Perch: 12, Trout: 8, Trash: 3, Pike: 6 }, // 43
}

const RIVER_ZONES: Record<number, number> = { 2: 4, 3: 5, 4: 6, 5: 7 }

export function riverZonesFor(playerCount: number): number {
  return Math.min(7, Math.max(4, RIVER_ZONES[playerCount] ?? 5))
}

export function buildDeck(playerCount: number): FishCard[] {
  const counts = FISH_COUNTS[playerCount]
  const deck: FishCard[] = []
  let id = 0
  ;(['Minnow', 'Perch', 'Trout', 'Trash', 'Pike'] as FishType[]).forEach((type) => {
    for (let i = 0; i < counts[type]; i++) {
      deck.push({ id: `fish-${id++}`, type, points: FISH_POINTS[type] })
    }
  })
  return deck
}