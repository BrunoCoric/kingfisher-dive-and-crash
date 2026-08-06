/**
 * A/B harness: all-smart vs all-legacy aggregates, plus mixed head-to-head
 * (even seats smart, odd seats legacy) to measure win rate.
 */
import { CreateGameReducer, InitializeGame } from 'boardgame.io/dist/cjs/internal.js'
import { Game } from './src/game/Game'
import { KingfisherBot, LegacyKingfisherBot } from './src/game/bot'
import type { GameState } from './src/game/types'
import type { Bot } from 'boardgame.io/ai'

const DEPTH = 3000
const GAMES = 12

interface Stats {
  label: string
  games: number
  finished: number
  catches: number
  crashes: number
  steals: number
  blocks: number
  pikes: number
  cards: Record<string, number>
  hoverMoves: number
  hoverStays: number
  repositioned: number
  winnerScores: number[]
  allScores: number[]
  smartWins: number
  legacyWins: number
  ties: number
  zeroCatchGames: number
}

function newStats(label: string): Stats {
  return {
    label,
    games: 0,
    finished: 0,
    catches: 0,
    crashes: 0,
    steals: 0,
    blocks: 0,
    pikes: 0,
    cards: { Dive: 0, Drop: 0, Splash: 0, Hover: 0 },
    hoverMoves: 0,
    hoverStays: 0,
    repositioned: 0,
    winnerScores: [],
    allScores: [],
    smartWins: 0,
    legacyWins: 0,
    ties: 0,
    zeroCatchGames: 0,
  }
}

type BotKind = 'smart' | 'legacy'

function makeBot(kind: BotKind, seed: string): Bot {
  const opts = { enumerate: Game.ai!.enumerate, seed }
  return kind === 'smart' ? new KingfisherBot(opts) : new LegacyKingfisherBot(opts)
}

async function simulate(
  numPlayers: number,
  label: string,
  seatKinds: BotKind[],
  stats: Stats,
): Promise<void> {
  const reducer = CreateGameReducer({ game: Game, numPlayers })
  let state: any = InitializeGame({ game: Game, numPlayers })
  const bots: Record<string, Bot> = {}
  for (let i = 0; i < numPlayers; i++) {
    bots[String(i)] = makeBot(seatKinds[i], `${label}-${i}`)
  }

  let iter = 0
  let rejects = 0
  let catchesBefore = 0
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
    if (botPlayer === null) throw new Error(`[${label}] no bot turn at ${state.ctx.phase}`)

    const { action } = await bots[botPlayer].play(state, botPlayer)
    if (!action) throw new Error(`[${label}] empty action`)

    const before = state.G as GameState
    const prevPerch = before.players[botPlayer]?.perch
    const next = reducer(state, action)
    if (next === state) {
      rejects++
      if (rejects > 3) throw new Error(`[${label}] rejected ${action.payload.type} at ${state.ctx.phase}`)
    } else {
      rejects = 0
      if (action.payload.type === 'selectCard') {
        const card = action.payload.args[0] as string
        stats.cards[card] = (stats.cards[card] ?? 0) + 1
      }
      if (action.payload.type === 'placePawn') {
        const perch = action.payload.args[0] as string
        if (prevPerch && perch !== prevPerch) stats.repositioned++
      }
      if (action.payload.type === 'hoverMove') {
        if (action.payload.args[0] === undefined) stats.hoverStays++
        else stats.hoverMoves++
      }
      const g = next.G as GameState
      const beforeLen = before.outcomeLog.length
      for (let i = beforeLen; i < g.outcomeLog.length; i++) {
        const o = g.outcomeLog[i]
        if (o.kind === 'catch') {
          stats.catches++
          catchesBefore++
        } else if (o.kind === 'crash') stats.crashes++
        else if (o.kind === 'steal') stats.steals++
        else if (o.kind === 'blocked') stats.blocks++
        else if (o.kind === 'pike') stats.pikes++
      }
    }
    state = next
    iter++
  }

  stats.games++
  if (state.ctx.gameover === undefined) return
  stats.finished++
  const g = state.G as GameState
  const scores = Object.entries(g.players).map(([id, p]) => ({ id, score: p.score, kind: seatKinds[Number(id)] }))
  const max = Math.max(...scores.map((s) => s.score))
  stats.winnerScores.push(max)
  stats.allScores.push(...scores.map((s) => s.score))
  if (catchesBefore === 0) stats.zeroCatchGames++

  const winners = scores.filter((s) => s.score === max)
  if (winners.every((w) => w.kind === 'smart')) stats.smartWins++
  else if (winners.every((w) => w.kind === 'legacy')) stats.legacyWins++
  else stats.ties++
}

function avg(xs: number[]): string {
  if (xs.length === 0) return 'n/a'
  return (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2)
}

function report(s: Stats): void {
  const hoverTotal = s.hoverMoves + s.hoverStays
  const cardTotal = Object.values(s.cards).reduce((a, b) => a + b, 0) || 1
  console.log(`\n=== ${s.label} (${s.finished}/${s.games} finished) ===`)
  console.log(
    `  cards: Dive=${s.cards.Dive} (${((s.cards.Dive / cardTotal) * 100).toFixed(0)}%)` +
      ` Drop=${s.cards.Drop} (${((s.cards.Drop / cardTotal) * 100).toFixed(0)}%)` +
      ` Splash=${s.cards.Splash} (${((s.cards.Splash / cardTotal) * 100).toFixed(0)}%)` +
      ` Hover=${s.cards.Hover} (${((s.cards.Hover / cardTotal) * 100).toFixed(0)}%)`,
  )
  console.log(
    `  hover relocate=${s.hoverMoves}/${hoverTotal || 0}` +
      ` (${hoverTotal ? ((s.hoverMoves / hoverTotal) * 100).toFixed(0) : 0}% moved)` +
      `  repositioned=${s.repositioned}`,
  )
  console.log(
    `  outcomes/game: catch=${(s.catches / s.games).toFixed(1)} crash=${(s.crashes / s.games).toFixed(1)}` +
      ` steal=${(s.steals / s.games).toFixed(1)} block=${(s.blocks / s.games).toFixed(1)} pike=${(s.pikes / s.games).toFixed(1)}`,
  )
  console.log(
    `  crash/catch ratio=${s.catches ? (s.crashes / s.catches).toFixed(2) : 'inf'}` +
      `  zero-catch games=${s.zeroCatchGames}`,
  )
  console.log(`  avg winner=${avg(s.winnerScores)}  avg seat=${avg(s.allScores)}`)
  if (s.smartWins + s.legacyWins + s.ties > 0 && (s.smartWins > 0 || s.legacyWins > 0)) {
    console.log(`  head-to-head: smart=${s.smartWins} legacy=${s.legacyWins} ties=${s.ties}`)
  }
}

async function main() {
  for (const np of [2, 3, 4]) {
    const smart = newStats(`${np}p all-smart`)
    const legacy = newStats(`${np}p all-legacy`)
    const mixed = newStats(`${np}p mixed (even=smart odd=legacy)`)

    for (let run = 0; run < GAMES; run++) {
      await simulate(np, `smart-${np}p-r${run}`, Array(np).fill('smart'), smart)
      await simulate(np, `legacy-${np}p-r${run}`, Array(np).fill('legacy'), legacy)
      const kinds: BotKind[] = Array.from({ length: np }, (_, i) => (i % 2 === 0 ? 'smart' : 'legacy'))
      await simulate(np, `mixed-${np}p-r${run}`, kinds, mixed)
    }
    report(smart)
    report(legacy)
    report(mixed)
  }
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err)
  process.exit(1)
})
