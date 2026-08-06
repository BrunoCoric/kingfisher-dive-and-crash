import type { Perch, PerchLevel } from './types'

export function reachableZones(zone: number, level: PerchLevel, zoneCount: number): number[] {
  if (level === 'low') {
    const down = zone + 1
    if (down < zoneCount) return [zone, down]
    return [zone, zone - 1]
  }
  const hasUp = zone - 1 >= 0
  const hasDown = zone + 1 < zoneCount
  if (!hasDown) return [zone, zone - 1, zone - 2]
  if (!hasUp) return [zone, zone + 1, zone + 2]
  return [zone - 1, zone, zone + 1]
}

export function adjacentPerches(perches: Perch[], perchId: string): Perch[] {
  const current = perches.find((p) => p.id === perchId)
  if (!current) return []
  return perches.filter((p) => {
    const otherBankSameZone = p.bank !== current.bank && p.zone === current.zone
    const sameBankAdjacent = p.bank === current.bank && Math.abs(p.zone - current.zone) === 1
    return otherBankSameZone || sameBankAdjacent
  })
}

/** Adjacent perches that are free for a Hover reposition. */
export function openHoverPerches(
  perches: Perch[],
  perchId: string,
  occupied: Iterable<string>,
): Perch[] {
  const taken = occupied instanceof Set ? occupied : new Set(occupied)
  return adjacentPerches(perches, perchId).filter((p) => !taken.has(p.id))
}