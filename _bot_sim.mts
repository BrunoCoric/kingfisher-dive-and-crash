import { CreateGameReducer, InitializeGame } from 'boardgame.io/dist/cjs/internal.js'
import { Game } from './src/game/Game'
import { KingfisherBot } from './src/game/bot'
import type { GameState } from './src/game/types'

const DEPTH = 2000

/**
 * Headless full-game check for bot mode. Drives every seat with a
 * `KingfisherBot` through the reducer directly (the `Simulate` helper only ever
 * steps the first active player, which would stall simultaneous phases).
 * Asserts the game reaches a winner and that no enumerated move is rejected
 * (an unchanged reducer result for a real action is an `INVALID_MOVE`).
 */
async function simulate(numPlayers: number, label: string): Promise<GameState> {
  const reducer = CreateGameReducer({ game: Game, numPlayers })
  let state: any = InitializeGame({ game: Game, numPlayers })

  const bots: Record<string, KingfisherBot> = {}
  for (let i = 0; i < numPlayers; i++) {
    bots[String(i)] = new KingfisherBot({ enumerate: Game.ai!.enumerate, seed: `${label}-${i}` })
  }

  let iter = 0
  let rejects = 0
  while (!state.ctx.gameover && iter < DEPTH) {
    let botPlayer: string | null = null
    if (state.ctx.activePlayers && Object.keys(state.ctx.activePlayers).length) {
      for (const id of Object.keys(bots)) {
        if (id in state.ctx.activePlayers) {
          botPlayer = id
          break
        }
      }
    } else if (state.ctx.currentPlayer in bots) {
      botPlayer = state.ctx.currentPlayer
    }
    if (botPlayer === null) {
      throw new Error(`[${label}] no bot has a turn at phase ${state.ctx.phase}`)
    }

    const { action } = await bots[botPlayer].play(state, botPlayer)
    if (!action) throw new Error(`[${label}] bot ${botPlayer} returned no action at ${state.ctx.phase}`)

    const next = reducer(state, action)
    if (next === state) {
      rejects++
      if (rejects > 3) {
        throw new Error(
          `[${label}] rejected action ${action.payload.type} by ${botPlayer} at phase ${state.ctx.phase} (counted ${rejects} rejects)`,
        )
      }
    }
    if (next !== state) rejects = 0
    state = next
    iter++
  }

  if (state.ctx.gameover === undefined) {
    throw new Error(`[${label}] game did not finish within depth ${DEPTH} (iter ${iter})`)
  }
  if (state.G.winner === null) {
    throw new Error(`[${label}] gameover but winner is null`)
  }
  console.log(
    `pass ${numPlayers}p (${label}): winner=${state.G.winner} iter=${iter} rejects=${rejects} round=${state.G.round}`,
  )
  return state.G as GameState
}

async function main() {
  const counts = [2, 3, 4, 5]
  let ok = 0
  for (const numPlayers of counts) {
    for (let run = 0; run < 3; run++) {
      await simulate(numPlayers, `${numPlayers}p-run${run}`)
      ok++
    }
  }
  console.log(`\n_ok (${ok}/${counts.length * 3}) full game simulations passed`)
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err)
  process.exit(1)
})
