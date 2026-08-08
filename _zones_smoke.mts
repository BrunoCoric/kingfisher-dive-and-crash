import assert from 'node:assert/strict'
import { assignZoneKinds, planFishDrift, specialKindsIn } from './src/game/zones.ts'
import type { FishCard, RiverZone, ZoneKind } from './src/game/types.ts'

function fish(id: string): FishCard {
  return { id, type: 'Minnow', points: 1 }
}

function river(kinds: ZoneKind[], ids: (string | null)[]): RiverZone[] {
  return kinds.map((kind, i) => ({
    id: i,
    kind,
    fish: ids[i] ? fish(ids[i]!) : null,
  }))
}

function ids(plan: ReturnType<typeof planFishDrift>): (string | null)[] {
  return plan.next.map((f) => f?.id ?? null)
}

/** Deterministic shuffle: reverse (stable for tests). */
function rev<T>(items: T[]): T[] {
  return [...items].reverse()
}

assert.deepEqual(assignZoneKinds(5, 0, rev), ['open', 'open', 'open', 'open', 'open'])

{
  // Pool reverse → rapids, eddy, clear; seats reverse → 4,3,2,…
  // n=2 → kinds[4]=rapids, kinds[3]=eddy
  assert.deepEqual(assignZoneKinds(5, 2, rev), ['open', 'open', 'open', 'eddy', 'rapids'])
  assert.deepEqual(assignZoneKinds(5, 3, rev), ['open', 'open', 'clear', 'eddy', 'rapids'])
  assert.deepEqual(assignZoneKinds(5, 1, rev), ['open', 'open', 'open', 'open', 'rapids'])
}

{
  const kinds: ZoneKind[] = ['clear', 'open', 'eddy', 'open', 'rapids']
  const plan = planFishDrift(river(kinds, ['A', 'B', 'C', 'D', 'E']))
  assert.deepEqual(ids(plan), [null, 'A', 'C', 'B', 'D'])
  assert.deepEqual(
    plan.washed.map((f) => f.id),
    ['E'],
  )
  assert.deepEqual(specialKindsIn(river(kinds, [null, null, null, null, null])), [
    'clear',
    'eddy',
    'rapids',
  ])
}

{
  // Mid-river Rapids: fish jumps +2
  const kinds: ZoneKind[] = ['open', 'rapids', 'open', 'open']
  const plan = planFishDrift(river(kinds, ['A', 'B', 'C', 'D']))
  assert.deepEqual(ids(plan), [null, 'A', null, 'B'])
  assert.deepEqual(
    plan.washed.map((f) => f.id).sort(),
    ['C', 'D'].sort(),
  )
}

console.log('_ok zones smoke')
