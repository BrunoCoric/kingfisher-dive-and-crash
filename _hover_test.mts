import { CreateGameReducer, InitializeGame } from 'boardgame.io/dist/cjs/internal.js'
import { Game } from './src/game/Game'
import { isHoverPeekTarget } from './src/game/hoverPeek'
import { openHoverPerches } from './src/game/reach'

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
while (steps < 4 && !state.ctx.gameover && state.ctx.phase !== 'cleanup' && iter++ < 80) {
  if (state.ctx.phase.startsWith('step')) {
    const anyone = order.find(
      (q) => state.G.selections[q] === undefined && state.G.players[q].hand.length > 0,
    )
    if (!anyone) {
      steps++
      continue
    }
    const i = order.indexOf(anyone)
    const hand: string[] = state.G.players[anyone].hand
    if ((steps + i) % 2 === 0 && hand.includes('Hover')) {
      const peek = state.G.zones.find((z: { id: number }) => isHoverPeekTarget(state.G, anyone, z.id))
      mm(anyone, 'selectCard', peek ? ['Hover', { peek: peek.id }] : ['Hover', {}])
    } else {
      const card = hand.find((c) => c !== 'Hover') ?? hand[0]
      const perch = state.G.perches.find((p: { id: string }) => p.id === state.G.players[anyone].perch)
      const target = state.G.zones.find((z: { id: number; fish: unknown }) => z.fish && Math.abs(z.id - perch.zone) <= 1)?.id
      if (card === 'Hover') {
        const peek = state.G.zones.find((z: { id: number }) => isHoverPeekTarget(state.G, anyone, z.id))
        mm(anyone, 'selectCard', peek ? ['Hover', { peek: peek.id }] : ['Hover', {}])
      } else if (target !== undefined) {
        mm(anyone, 'selectCard', [card, { target }])
      } else {
        mm(anyone, 'skipTurn', [])
      }
    }
  } else if (state.ctx.phase.startsWith('hover')) {
    const pid = state.ctx.currentPlayer
    // Auto-stay may already have resolved this seat.
    if (state.G.selections[pid]?.card === 'Hover' && !state.G.hovered.includes(pid)) {
      const open = openHoverPerches(
        state.G.perches,
        state.G.players[pid].perch,
        Object.values(state.G.players).map((p: { perch: string }) => p.perch).filter(Boolean),
      )
      mm(pid, 'hoverMove', open.length ? [open[0].id] : [])
    }
  }
  if (phaseLog[phaseLog.length - 1] !== state.ctx.phase) phaseLog.push(state.ctx.phase)
}

console.log('phase transitions:', JSON.stringify(phaseLog))
console.log('moved any perch?', beforeHover !== perchOf())
console.log('phase now:', state.ctx.phase, 'gameover:', state.ctx.gameover !== undefined)
