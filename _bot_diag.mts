import { CreateGameReducer, InitializeGame } from 'boardgame.io/dist/cjs/internal.js'
import { Game } from './src/game/Game'
import { KingfisherBot } from './src/game/bot'
import type { GameState } from './src/game/types'

interface Stats {
  cards: Record<string, number>
  catches: number
  crashes: number
  steals: number
  blocks: number
  pikes: number
  hovers: number
  hoverStays: number
  hoverMoves: number
  repositioned: number
  totalMoves: number
  scores: number[]
}

function newStats(): Stats {
  return {
    cards: { Dive: 0, Drop: 0, Splash: 0, Hover: 0 },
    catches: 0,
    crashes: 0,
    steals: 0,
    blocks: 0,
    pikes: 0,
    hovers: 0,
    hoverStays: 0,
    hoverMoves: 0,
    repositioned: 0,
    totalMoves: 0,
    scores: [],
  }
}

const DEPTH = 3000

async function simulate(numPlayers: number, label: string, stats: Stats): Promise<void> {
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
    if (botPlayer === null) throw new Error(`[${label}] no bot has a turn at phase ${state.ctx.phase}`)

    const { action } = await bots[botPlayer].play(state, botPlayer)
    if (!action?.payload) throw new Error(`[${label}] bot returned no action`)

    const before = state.G as GameState
    const prevPerch = before.players[botPlayer]?.perch
    const next = reducer(state, action)
    if (next === state) {
      rejects++
      if (rejects > 3) throw new Error(`[${label}] rejected action ${action.payload.type} at ${state.ctx.phase}`)
    } else {
      rejects = 0
      stats.totalMoves++
      if (action.payload.type === 'selectCard') {
        const card = action.payload.args?.[0] as string
        stats.cards[card] = (stats.cards[card] ?? 0) + 1
      }
      if (action.payload.type === 'placePawn') {
        const perch = action.payload.args?.[0] as string
        if (prevPerch && perch !== prevPerch) stats.repositioned++
      }
      if (action.payload.type === 'hoverMove') {
        if (action.payload.args?.[0] === undefined) stats.hoverStays++
        else stats.hoverMoves++
      }
      if (next.G instanceof Object && before) {
        const g = next.G as GameState
        const outcome = g.outcomeLog
        const beforeLen = (before as GameState).outcomeLog.length
        for (let i = beforeLen; i < outcome.length; i++) {
          const o = outcome[i]
          if (o.kind === 'catch') stats.catches++
          else if (o.kind === 'crash') stats.crashes++
          else if (o.kind === 'steal') stats.steals++
          else if (o.kind === 'blocked') stats.blocks++
          else if (o.kind === 'pike') stats.pikes++
        }
      }
    }
    state = next
    iter++
  }

  const g = state.G as GameState
  const scores = Object.values(g.players).map((p) => p.score)
  stats.scores.push(Math.max(...scores))
}

async function main() {
  const counts = [2, 3, 4, 5]
  let total: Stats = newStats()
  for (const numPlayers of counts) {
    const s = newStats()
    for (let run = 0; run < 8; run++) {
      await simulate(numPlayers, `${numPlayers}p-r${run}`, s)
    }
    const n = 8
    console.log(`\n=== ${numPlayers}p (${n} games) ===`)
    console.log(`  card usage: Dive=${s.cards.Dive} Drop=${s.cards.Drop} Splash=${s.cards.Splash} Hover=${s.cards.Hover}`)
    console.log(`  hover: plays=${s.hovers} stays=${s.hoverStays} moves=${s.hoverMoves} (${(s.hoverMoves / Math.max(1, s.hoverMoves + s.hoverStays)) * 100}% moved)`)
    console.log(`  repositioned pawns=${s.repositioned}`)
    console.log(`  outcome: catches=${s.catches} crashes=${s.crashes} steals=${s.steals} blocks=${s.blocks} pikes=${s.pikes}`)
    const avgWin = s.scores.reduce((a, b) => a + b, 0) / Math.max(1, s.scores.length)
    console.log(`  avg winner score=${avgWin.toFixed(1)}`)
    for (const k in s.cards) total.cards[k] = (total.cards[k] ?? 0) + s.cards[k]
  }
  console.log(`\nTOTAL card usage: ${JSON.stringify(total.cards)}`)
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err)
  process.exit(1)
})
