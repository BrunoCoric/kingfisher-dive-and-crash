/**
 * Deep probe: dive success rate, crash sources, and whether smart still
 * mirror-dives the same zones.
 */
import { CreateGameReducer, InitializeGame } from 'boardgame.io/dist/cjs/internal.js'
import { Game } from './src/game/Game'
import { KingfisherBot, LegacyKingfisherBot } from './src/game/bot'
import type { GameState } from './src/game/types'
import type { Bot } from 'boardgame.io/ai'

const GAMES = 20
const DEPTH = 3000

async function run(kind: 'smart' | 'legacy', np: number) {
  let dives = 0
  let diveCatch = 0
  let diveCrash = 0
  let splashCrash = 0
  let dropCrash = 0
  let otherCrash = 0
  let catches = 0
  let scores: number[] = []

  for (let g = 0; g < GAMES; g++) {
    const reducer = CreateGameReducer({ game: Game, numPlayers: np })
    let state: any = InitializeGame({ game: Game, numPlayers: np })
    const bots: Record<string, Bot> = {}
    for (let i = 0; i < np; i++) {
      const opts = { enumerate: Game.ai!.enumerate, seed: `${kind}-${np}-${g}-${i}` }
      bots[String(i)] = kind === 'smart' ? new KingfisherBot(opts) : new LegacyKingfisherBot(opts)
    }
    let iter = 0
    while (!state.ctx.gameover && iter < DEPTH) {
      let botPlayer: string | null = null
      if (state.ctx.activePlayers && Object.keys(state.ctx.activePlayers).length) {
        for (const id of Object.keys(bots)) {
          if (id in state.ctx.activePlayers) {
            botPlayer = id
            break
          }
        }
      } else if (state.ctx.currentPlayer in bots) botPlayer = state.ctx.currentPlayer
      if (!botPlayer) throw new Error('no bot')

      const before = state.G as GameState
      const beforeLen = before.outcomeLog.length
      const { action } = await bots[botPlayer].play(state, botPlayer)
      if (action?.payload?.type === 'selectCard' && action.payload.args?.[0] === 'Dive') dives++

      const next = reducer(state, action)
      if (next !== state) {
        const outcomes = (next.G as GameState).outcomeLog.slice(beforeLen)
        // Attribute crashes by what was played on that zone this step.
        const reveals = (next.G as GameState).lastReveals
        // lastReveals updates on next step begin; during same step use selections.
        const sels = Object.keys((next.G as GameState).selections).length
          ? (next.G as GameState).selections
          : reveals
        for (const o of outcomes) {
          if (o.kind === 'catch') {
            catches++
            diveCatch++
          } else if (o.kind === 'steal') {
            /* steal replaces catch */
          } else if (o.kind === 'crash') {
            const actorsCard = o.actor ? sels[o.actor]?.card : undefined
            if (actorsCard === 'Dive') diveCrash++
            else if (actorsCard === 'Splash') splashCrash++
            else if (actorsCard === 'Drop') dropCrash++
            else otherCrash++
          }
        }
      }
      state = next
      iter++
    }
    scores.push(Math.max(...Object.values((state.G as GameState).players).map((p) => p.score)))
  }

  const avgWin = scores.reduce((a, b) => a + b, 0) / scores.length
  console.log(
    `${kind} ${np}p: dives=${dives} diveCatch=${diveCatch} diveCrash=${diveCrash} splashCrash=${splashCrash} dropCrash=${dropCrash} otherCrash=${otherCrash} catches=${catches} avgWin=${avgWin.toFixed(1)} diveSuccess=${dives ? ((diveCatch / dives) * 100).toFixed(0) : 0}%`,
  )
}

async function main() {
  for (const np of [2, 4]) {
    await run('smart', np)
    await run('legacy', np)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
