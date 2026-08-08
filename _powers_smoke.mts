/**
 * Headless smoke for species powers helpers + setup flag.
 * Run: npx tsx _powers_smoke.mts
 */
import { Client } from 'boardgame.io/client'
import { Local } from 'boardgame.io/multiplayer'
import { Game, setup } from './src/game/Game'
import {
  SPECIES_POWERS,
  hasPower,
  openHoverTargets,
  reachLevel,
} from './src/game/powers'
import type { GameState } from './src/game/types'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

function fresh(speciesPowers: boolean, numPlayers = 5): GameState {
  const client = Client({
    game: {
      ...Game,
      setup: (ctx) => setup(ctx, { humanSeats: ['0'], speciesPowers }),
    },
    numPlayers,
    multiplayer: Local(),
  })
  client.start()
  return client.getState()!.G as GameState
}

function main() {
  const off = fresh(false, 2)
  assert(off.speciesPowers === false, 'powers default off when unset path uses false')
  assert(!hasPower(off, '0', 'steadyWing'), 'inert when flag off')

  const G = fresh(true, 5)
  assert(G.speciesPowers === true, 'powers on')
  assert(hasPower(G, '0', 'steadyWing'), 'Common')
  assert(hasPower(G, '1', 'longHover'), 'Pied')
  assert(hasPower(G, '2', 'keenSight'), 'Dwarf')
  assert(hasPower(G, '3', 'wideBank'), 'Belted')
  assert(hasPower(G, '4', 'toughGut'), 'Azure')
  assert(SPECIES_POWERS.azure.name === 'Tough Gut', 'manifest label')
  assert(SPECIES_POWERS.yellowBilled.id === 'sunBill', 'Yellow-billed power')
  assert(SPECIES_POWERS.banded.id === 'barredWatch', 'Banded power')
  assert(SPECIES_POWERS.green.id === 'speckledWing', 'Green power')
  assert(SPECIES_POWERS.kookaburra.id === 'heartyDive', 'Kookaburra power')

  const yb = Client({
    game: {
      ...Game,
      setup: (ctx) =>
        setup(ctx, { humanSeats: ['0'], humanSpecies: 'yellowBilled', speciesPowers: true }),
    },
    numPlayers: 2,
    multiplayer: Local(),
  })
  yb.start()
  const Y = yb.getState()!.G as GameState
  assert(hasPower(Y, '0', 'sunBill'), 'Yellow-billed Sun Bill')
  assert(hasPower(Y, '1', 'steadyWing'), 'bot fills flock order')

  const bd = Client({
    game: {
      ...Game,
      setup: (ctx) =>
        setup(ctx, { humanSeats: ['0'], humanSpecies: 'banded', speciesPowers: true }),
    },
    numPlayers: 2,
    multiplayer: Local(),
  })
  bd.start()
  assert(hasPower(bd.getState()!.G as GameState, '0', 'barredWatch'), 'Banded Barred Watch')

  const gr = Client({
    game: {
      ...Game,
      setup: (ctx) =>
        setup(ctx, { humanSeats: ['0'], humanSpecies: 'green', speciesPowers: true }),
    },
    numPlayers: 2,
    multiplayer: Local(),
  })
  gr.start()
  assert(hasPower(gr.getState()!.G as GameState, '0', 'speckledWing'), 'Green Speckled Wing')

  const kk = Client({
    game: {
      ...Game,
      setup: (ctx) =>
        setup(ctx, { humanSeats: ['0'], humanSpecies: 'kookaburra', speciesPowers: true }),
    },
    numPlayers: 2,
    multiplayer: Local(),
  })
  kk.start()
  assert(hasPower(kk.getState()!.G as GameState, '0', 'heartyDive'), 'Kookaburra Hearty Dive')

  const low = G.perches.find((p) => p.level === 'low')!
  assert(reachLevel(G, '3', low) === 'high', 'Belted Wide Bank')
  assert(reachLevel(G, '0', low) === 'low', 'others stay low')

  const mid = G.perches.find((p) => p.zone === 2) ?? G.perches[2]
  const occupied = [mid.id]
  const baseG = { ...G, speciesPowers: false }
  const base = openHoverTargets(baseG, '1', mid.id, occupied)
  const pied = openHoverTargets(G, '1', mid.id, occupied)
  assert(pied.length > base.length, `Pied 2-hop (${pied.length} > ${base.length})`)

  const tut = Client({
    game: {
      ...Game,
      setup: (ctx) => setup(ctx, { humanSeats: ['0'], tutorial: true, speciesPowers: true }),
    },
    numPlayers: 3,
    multiplayer: Local(),
  })
  tut.start()
  assert((tut.getState()!.G as GameState).speciesPowers === false, 'tutorial forces powers off')

  console.log('_ok powers smoke')
}

main()
