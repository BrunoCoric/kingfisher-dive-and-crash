import type { FnContext, Game as GameConfig, PhaseConfig } from 'boardgame.io'
import { buildDeck, riverZonesFor } from './fish'
import { ACTION_DECK } from './cards'
import { placePawn, peekSightline, selectCard, hoverMove, skipTurn, continueRound } from './moves'
import { resolveStep } from './resolution'
import { endOfRoundCleanup } from './cleanup'
import { filterPlayerView } from './playerView'
import { enumerateLegalMoves } from './enumerate'
import { openHoverPerches } from './reach'
import type { GameState, GamePhase, Perch, PlayerState } from './types'

function buildPerches(zoneCount: number): Perch[] {
  const perches: Perch[] = []
  for (let i = 0; i < zoneCount; i++) {
    const level: Perch['level'] = i % 2 === 0 ? 'high' : 'low'
    perches.push({ id: `L${i + 1}`, level, zone: i, bank: 'left' })
    perches.push({ id: `R${i + 1}`, level: level === 'high' ? 'low' : 'high', zone: i, bank: 'right' })
  }
  return perches
}

function rotateOrder(playOrder: string[], first: string): string[] {
  const idx = playOrder.indexOf(first)
  if (idx === -1) return playOrder
  return [...playOrder.slice(idx), ...playOrder.slice(0, idx)]
}

export interface KingfisherSetupData {
  humanSeats?: string[]
}

export function setup(
  { ctx, random }: Pick<FnContext<GameState>, 'ctx' | 'random'>,
  setupData?: KingfisherSetupData,
): GameState {
  const zoneCount = riverZonesFor(ctx.numPlayers)
  const deck = random.Shuffle(buildDeck(ctx.numPlayers))
  const perches = buildPerches(zoneCount)
  const zones = Array.from({ length: zoneCount }, (_, i) => ({
    id: i,
    fish: deck.pop() ?? null,
  }))

  const players: Record<string, PlayerState> = {}
  ctx.playOrder.forEach((pid) => {
    players[pid] = {
      hand: [...ACTION_DECK],
      score: 0,
      fishCount: 0,
      scored: [],
      perch: '',
    }
  })

  return {
    zones,
    perches,
    deck,
    deckCount: deck.length,
    players,
    discard: [],
    currentPhase: 'placement',
    firstPlayer: random.Shuffle([...ctx.playOrder])[0],
    round: 1,
    step: 0,
    selections: {},
    lastReveals: {},
    sightlinePeek: {},
    peeked: {},
    locked: {},
    hovered: [],
    splashes: [],
    outcomeLog: [],
    winner: null,
    humanSeats: setupData?.humanSeats ?? [],
  }
}

const placementPhase: PhaseConfig<GameState> = {
  onBegin: ({ G }: FnContext<GameState>) => {
    // Re-entered each round (cleanup → placement), so keep `G.currentPhase` in
    // sync for the move guards, bot enumeration, and the Board UI.
    G.currentPhase = 'placement'
  },
  turn: {
    order: {
      playOrder: ({ G, ctx }) => rotateOrder(ctx.playOrder, G.firstPlayer),
      first: () => 0,
      next: ({ ctx }) => (ctx.playOrderPos + 1 < ctx.playOrder.length ? ctx.playOrderPos + 1 : undefined),
    },
    maxMoves: 2,
  },
  moves: { placePawn, peekSightline },
  next: 'step1',
}

function stepPhase(step: number, phase: GamePhase, hover: string, nextStep: string): PhaseConfig<GameState> {
  return {
    turn: {
      activePlayers: { all: 'select' },
      onBegin: ({ G, ctx, events }: FnContext<GameState>) => {
        G.currentPhase = phase
        G.step = step
        if (Object.keys(G.selections).length > 0) G.lastReveals = G.selections
        G.selections = {}
        G.locked = {}
        G.splashes = []
        for (const pid of ctx.playOrder) {
          if (G.players[pid].hand.length === 0) {
            G.selections[pid] = null
            G.locked[pid] = true
          }
        }
        if (ctx.playOrder.every((pid) => G.locked[pid])) events.endPhase()
      },
    },
    moves: { selectCard, skipTurn },
    onEnd: ({ G, ctx, random }: FnContext<GameState>) => {
      if (!Object.values(G.selections).some((sel) => sel?.card === 'Hover')) {
        resolveStep(G, ctx, random)
      }
    },
    // Skip the Hover-move phase entirely when nobody played Hover this step.
    next: ({ G }: FnContext<GameState>) =>
      Object.values(G.selections).some((sel) => sel?.card === 'Hover') ? hover : nextStep,
  }
}

function hoverPhase(step: number, phase: GamePhase, next: string): PhaseConfig<GameState> {
  return {
    onBegin: ({ G }: FnContext<GameState>) => {
      G.hovered = []
    },
    turn: {
      order: {
        playOrder: ({ G, ctx }) => rotateOrder(ctx.playOrder, G.firstPlayer),
        first: ({ G, ctx }) => {
          const order = rotateOrder(ctx.playOrder, G.firstPlayer)
          return order.findIndex((pid) => G.selections[pid]?.card === 'Hover' && !G.hovered.includes(pid))
        },
        next: ({ G, ctx }) => {
          const order = rotateOrder(ctx.playOrder, G.firstPlayer)
          const start = (ctx.playOrderPos + 1) % order.length
          for (let i = 0; i < order.length; i++) {
            const idx = (start + i) % order.length
            if (G.selections[order[idx]]?.card === 'Hover' && !G.hovered.includes(order[idx])) return idx
          }
          return undefined
        },
      },
      onBegin: ({ G, ctx, events }: FnContext<GameState>) => {
        G.currentPhase = phase
        G.step = step
        // No free adjacent perch → auto-stay so the player isn't stuck on Stay.
        const pid = ctx.currentPlayer
        const player = G.players[pid]
        if (!player || G.selections[pid]?.card !== 'Hover' || G.hovered.includes(pid)) return
        const occupied = Object.values(G.players).map((p) => p.perch).filter(Boolean)
        if (openHoverPerches(G.perches, player.perch, occupied).length === 0) {
          G.hovered.push(pid)
          events.endTurn()
        }
      },
    },
    moves: { hoverMove },
    onEnd: ({ G, ctx, random }: FnContext<GameState>) => {
      resolveStep(G, ctx, random)
    },
    next,
  }
}

export const Game: GameConfig<GameState> = {
  name: 'kingfisher',
  minPlayers: 2,
  maxPlayers: 5,
  setup,

  endIf: ({ G }: FnContext<GameState>) => G.winner !== null,

  playerView: filterPlayerView,
  ai: {
    enumerate: enumerateLegalMoves,
  },

  phases: {
    placement: {
      ...placementPhase,
      start: true,
    },
    step1: {
      ...stepPhase(0, 'step1', 'hover1', 'step2'),
    },
    hover1: {
      ...hoverPhase(0, 'hover1', 'step2'),
    },
    step2: {
      ...stepPhase(1, 'step2', 'hover2', 'step3'),
    },
    hover2: {
      ...hoverPhase(1, 'hover2', 'step3'),
    },
    step3: {
      ...stepPhase(2, 'step3', 'hover3', 'cleanup'),
    },
    hover3: {
      ...hoverPhase(2, 'hover3', 'cleanup'),
    },
    cleanup: {
      // Pause so step-3 chips / outcomes stay on the river until a player taps
      // Next round. Drift + hand reset run in onEnd after continueRound ends
      // the phase — both step3 and hover3 route here as the single round boundary.
      onBegin: ({ G }: FnContext<GameState>) => {
        G.currentPhase = 'cleanup'
      },
      turn: {
        activePlayers: { all: 'continue' },
        onBegin: ({ G, events }: FnContext<GameState>) => {
          // Vs-bots: only the human seat may advance, otherwise Local bots fire
          // continueRound ~100ms later and skip the review.
          if (G.humanSeats.length === 0) return
          const value: Record<string, 'continue'> = {}
          for (const id of G.humanSeats) value[id] = 'continue'
          events.setActivePlayers({ value })
        },
      },
      moves: { continueRound },
      onEnd: ({ G, ctx }: FnContext<GameState>) => {
        endOfRoundCleanup(G, ctx)
      },
      next: 'placement',
    },
  },
}
