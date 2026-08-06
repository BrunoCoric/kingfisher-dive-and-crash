import { CreateGameReducer, InitializeGame } from 'boardgame.io/dist/cjs/internal.js'
import { Game } from './src/game/Game'
import { enumerateLegalMoves } from './src/game/enumerate'

const numPlayers = 4
const reducer = CreateGameReducer({ game: Game, numPlayers })
let state: any = InitializeGame({ game: Game, numPlayers })

const mm = (playerID: string, type: string, args: any[] = []) => {
  state = reducer(state, { type: 'MAKE_MOVE', payload: { playerID, type, args } })
}
const ev = (playerID: string, event: string, args: any = undefined) => {
  state = reducer(state, { type: 'GAME_EVENT', payload: { playerID, event, args } })
}

let guard = 0
while (guard++ < 40 && state.ctx.phase === 'placement') {
  const pid = state.ctx.currentPlayer
  const p = state.G.players[pid]
  if (p.perch === '') {
    const free = state.G.perches.find(
      (c: { id: string }) => !Object.values(state.G.players).some((x: { perch: string }) => x.perch === c.id),
    )
    mm(pid, 'placePawn', [free.id])
  } else {
    const perch = state.G.perches.find((x: { id: string }) => x.id === p.perch)
    if (state.G.sightlinePeek[pid] === undefined) mm(pid, 'peekSightline', [perch.zone])
    else ev(pid, 'endTurn')
  }
}

const order = state.ctx.playOrder as string[]
const perchOf = () => JSON.stringify(order.map((q) => state.G.players[q].perch))
const phaseLog: string[] = [state.ctx.phase]
const beforeHover = perchOf()

let steps = 0
let iter = 0
while (steps < 4 && !state.ctx.gameover && state.ctx.phase !== 'cleanup' && iter++ < 120) {
  if (state.ctx.phase.startsWith('step')) {
    const active = state.ctx.activePlayers ? Object.keys(state.ctx.activePlayers) : order
    const anyone = active.find(
      (q: string) => state.G.selections[q] === undefined && state.G.players[q].hand.length > 0,
    )
    if (!anyone) {
      steps++
      continue
    }
    const legal = enumerateLegalMoves(state.G, state.ctx, anyone).filter(
      (a: { move?: string }) => a.move === 'selectCard' || a.move === 'skipTurn',
    )
    const preferHover = legal.find(
      (a: { move?: string; args?: unknown[] }) =>
        a.move === 'selectCard' && a.args?.[0] === 'Hover' && (a.args[1] as { moveTo?: string })?.moveTo,
    )
    const anyHover = legal.find(
      (a: { move?: string; args?: unknown[] }) => a.move === 'selectCard' && a.args?.[0] === 'Hover',
    )
    const pick =
      preferHover ??
      anyHover ??
      legal.find((a: { move?: string; args?: unknown[] }) => a.move === 'selectCard') ??
      legal[0]
    if (!pick?.move) throw new Error(`no legal move for ${anyone}`)
    mm(anyone, pick.move, (pick as { args?: unknown[] }).args ?? [])
  } else if (state.ctx.phase.startsWith('hover')) {
    // Auto-apply in onBegin should clear seats; race fallback only.
    const pid = state.ctx.currentPlayer
    if (state.G.selections[pid]?.card === 'Hover' && !state.G.hovered.includes(pid)) {
      mm(pid, 'hoverMove', [])
    }
  }
  if (phaseLog[phaseLog.length - 1] !== state.ctx.phase) phaseLog.push(state.ctx.phase)
  if (state.ctx.phase.startsWith('step')) {
    const done = order.every((q) => state.G.selections[q] !== undefined)
    if (done) steps++
  }
}

console.log('phase transitions:', JSON.stringify(phaseLog))
console.log('moved any perch?', beforeHover !== perchOf())
console.log('phase now:', state.ctx.phase, 'gameover:', state.ctx.gameover !== undefined)
