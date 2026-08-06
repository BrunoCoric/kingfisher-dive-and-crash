/**
 * Headless walkthrough of the scripted tutorial (human + TutorialBots).
 * Run: npx tsx _tutorial_smoke.mts
 */
import { CreateGameReducer, InitializeGame } from 'boardgame.io/dist/cjs/internal.js'
import { Game, setup } from './src/game/Game'
import { TutorialBot } from './src/tutorial/TutorialBot'
import { humanGate } from './src/tutorial/script'
import type { GameState } from './src/game/types'
import type { Bot } from 'boardgame.io/ai'

const game = {
  ...Game,
  setup: (context: Parameters<typeof setup>[0]) =>
    setup(context, { humanSeats: ['0'], tutorial: true }),
}

function makeMove(state: any, playerID: string, type: string, args: unknown[] = []) {
  const reducer = CreateGameReducer({ game, numPlayers: 3 })
  const next = reducer(state, { type: 'MAKE_MOVE', payload: { playerID, type, args } })
  if (next === state) {
    throw new Error(
      `rejected ${type}${JSON.stringify(args)} by ${playerID} in ${state.G.currentPhase} ` +
        `r${state.G.round} hand=${JSON.stringify(state.G.players[playerID]?.hand)}`,
    )
  }
  return next
}

async function playBot(state: any, bots: Record<string, Bot>, playerID: string) {
  const reducer = CreateGameReducer({ game, numPlayers: 3 })
  const { action } = await bots[playerID].play(state, playerID)
  if (!action?.payload) throw new Error(`no action from ${playerID}`)
  const next = reducer(state, action)
  if (next === state) throw new Error(`rejected ${action.payload.type} by ${playerID}`)
  return next
}

function humanAct(state: any): any {
  const G = state.G as GameState
  const gate = humanGate(G, '0')
  if (!gate) throw new Error(`no human gate in ${G.currentPhase} r${G.round}s${G.step}`)
  if (gate.perchId && G.currentPhase === 'placement' && G.locked['0'] !== true) {
    return makeMove(state, '0', 'placePawn', [gate.perchId])
  }
  if (gate.zoneId !== undefined && G.currentPhase === 'placement') {
    return makeMove(state, '0', 'peekSightline', [gate.zoneId])
  }
  if (gate.card && G.currentPhase.startsWith('step')) {
    const sel =
      gate.card === 'Hover'
        ? gate.perchId
          ? { moveTo: gate.perchId }
          : { peek: gate.zoneId }
        : { target: gate.zoneId }
    return makeMove(state, '0', 'selectCard', [gate.card, sel])
  }
  if (gate.action === 'continue') return makeMove(state, '0', 'continueRound', [])
  throw new Error(`unhandled gate ${JSON.stringify(gate)}`)
}

function activeSeat(state: any): string | null {
  if (state.ctx.activePlayers && Object.keys(state.ctx.activePlayers).length) {
    for (const id of ['0', '1', '2']) {
      if (id in state.ctx.activePlayers) return id
    }
  }
  return state.ctx.currentPlayer ?? null
}

async function main() {
  let state: any = InitializeGame({ game, numPlayers: 3 })
  const bots: Record<string, Bot> = {
    '1': new TutorialBot({ enumerate: Game.ai!.enumerate, seed: 'tut-1' }),
    '2': new TutorialBot({ enumerate: Game.ai!.enumerate, seed: 'tut-2' }),
  }
  let iter = 0
  while (iter++ < 500) {
    const G = state.G as GameState
    if (G.round >= 5 || (G.round === 5 && G.currentPhase === 'placement')) {
      console.log('_ok tutorial finished → round', G.round)
      return
    }
    if (G.currentPhase === 'cleanup' && G.round === 4) {
      const seat = activeSeat(state)
      if (seat === '0') {
        state = humanAct(state)
        console.log('_ok tutorial finished → round', state.G.round)
        return
      }
    }

    let seat = activeSeat(state)
    if (!seat) throw new Error('no active seat')

    // Empty-hand auto-lock: human may still appear active but has no gate.
    if (
      seat === '0' &&
      (G.selections['0'] !== undefined || humanGate(G, '0') === null) &&
      G.currentPhase.startsWith('step')
    ) {
      const botsActive = ['1', '2'].find(
        (id) => state.ctx.activePlayers && id in state.ctx.activePlayers && G.selections[id] === undefined,
      )
      if (botsActive) seat = botsActive
      else if (G.selections['0'] !== undefined) {
        // Human locked with nothing left — force stage end via skip if needed
        throw new Error(`human locked but no bot to play in ${G.currentPhase} r${G.round}`)
      }
    }

    if (seat === '0') {
      const before = `${G.round}|${G.currentPhase}|${G.step}`
      state = humanAct(state)
      console.log(`human ${before} → ${state.G.round}|${state.G.currentPhase}|${state.G.step}`, humanGate(G, '0'))
    } else {
      state = await playBot(state, bots, seat)
      console.log(`bot${seat} ${G.currentPhase} r${G.round}`)
    }
  }
  throw new Error(`stuck after ${iter} iters at r${state.G.round} ${state.G.currentPhase}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
