import type { KingfisherID } from './kingfishers'
import { adjacentPerches, openHoverPerches, reachableZones } from './reach'
import type { GameState, Perch, PerchLevel } from './types'

/** Seat index → species (must match `KINGFISHERS` insertion order / UI seats). */
const SPECIES_ORDER: KingfisherID[] = [
  'common',
  'pied',
  'orientalDwarf',
  'belted',
  'azure',
]

export function speciesIdForSeat(pid: string): KingfisherID {
  return SPECIES_ORDER[Number(pid) % SPECIES_ORDER.length]
}

export type PowerId =
  | 'steadyWing'
  | 'longHover'
  | 'keenSight'
  | 'wideBank'
  | 'toughGut'

export interface SpeciesPower {
  id: PowerId
  name: string
  blurb: string
}

/** One soft passive per species — same deck & crash math for everyone. */
export const SPECIES_POWERS: Record<KingfisherID, SpeciesPower> = {
  common: {
    id: 'steadyWing',
    name: 'Steady Wing',
    blurb: 'On Crash, keep your extra hand card (played card still spent).',
  },
  pied: {
    id: 'longHover',
    name: 'Long Hover',
    blurb: 'Hover Relocate may move up to two perch hops (free seats only).',
  },
  orientalDwarf: {
    id: 'keenSight',
    name: 'Keen Sight',
    blurb: 'High perch also gets a placement sightline peek.',
  },
  belted: {
    id: 'wideBank',
    name: 'Wide Bank',
    blurb: 'Low perch uses High’s three-zone reach.',
  },
  azure: {
    id: 'toughGut',
    name: 'Tough Gut',
    blurb: 'Your first Pike each match does not eat a Minnow.',
  },
}

export function powerForSeat(G: GameState, pid: string): SpeciesPower | null {
  if (!G.speciesPowers) return null
  return SPECIES_POWERS[speciesIdForSeat(pid)]
}

export function hasPower(G: GameState, pid: string, id: PowerId): boolean {
  return powerForSeat(G, pid)?.id === id
}

/** Belted low → treat as high for reach only. */
export function reachLevel(G: GameState, pid: string, perch: Perch): PerchLevel {
  if (hasPower(G, pid, 'wideBank') && perch.level === 'low') return 'high'
  return perch.level
}

export function playerReach(G: GameState, pid: string): number[] {
  const player = G.players[pid]
  const perch = player ? G.perches.find((p) => p.id === player.perch) : undefined
  if (!player || !perch) return []
  return reachableZones(perch.zone, reachLevel(G, pid, perch), G.zones.length)
}

/** Preview reach as if this seat sat on `perch` (placement / bank hover). */
export function reachFromPerch(G: GameState, pid: string, perch: Perch): number[] {
  return reachableZones(perch.zone, reachLevel(G, pid, perch), G.zones.length)
}

export function canSightline(G: GameState, pid: string, perch: Perch): boolean {
  return perch.level === 'low' || hasPower(G, pid, 'keenSight')
}

/** Pied: BFS up to 2 hops; everyone else: adjacent free only. */
export function openHoverTargets(
  G: GameState,
  pid: string,
  perchId: string,
  occupied: Iterable<string>,
): Perch[] {
  const hops = hasPower(G, pid, 'longHover') ? 2 : 1
  if (hops === 1) return openHoverPerches(G.perches, perchId, occupied)

  const taken = occupied instanceof Set ? occupied : new Set(occupied)
  const start = G.perches.find((p) => p.id === perchId)
  if (!start) return []

  const best = new Map<string, number>()
  best.set(start.id, 0)
  const queue: string[] = [start.id]
  while (queue.length > 0) {
    const id = queue.shift()!
    const dist = best.get(id)!
    if (dist >= hops) continue
    for (const next of adjacentPerches(G.perches, id)) {
      const prev = best.get(next.id)
      if (prev !== undefined && prev <= dist + 1) continue
      best.set(next.id, dist + 1)
      queue.push(next.id)
    }
  }

  return G.perches.filter((p) => {
    if (p.id === start.id) return false
    const d = best.get(p.id)
    return d !== undefined && d >= 1 && d <= hops && !taken.has(p.id)
  })
}
