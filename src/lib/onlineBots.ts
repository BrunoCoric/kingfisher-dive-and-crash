import { Client } from 'boardgame.io/client'
import { SocketIO } from 'boardgame.io/multiplayer'
import { Game } from '../game/Game'
import { KingfisherBot } from '../game/bot'
import { enumerateLegalMoves } from '../game/enumerate'
import type { GameState } from '../game/types'
import { gameServerUrl } from './gameServer'

export interface OnlineBotSeat {
  playerID: string
  credentials: string
}

type BotClient = ReturnType<typeof Client<GameState>>

const sessions = new Map<string, () => void>()

/** One bot move at a time per match — avoids Socket.IO stateID races. */
const matchQueues = new Map<string, Promise<void>>()

function enqueue(matchID: string, task: () => Promise<void>): void {
  const prev = matchQueues.get(matchID) ?? Promise.resolve()
  const next = prev.then(task, task).catch((err) => {
    console.warn(`online bot queue ${matchID}:`, err)
  })
  matchQueues.set(matchID, next)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function canAct(state: NonNullable<ReturnType<BotClient['getState']>>, playerID: string): boolean {
  if (state.ctx.gameover !== undefined) return false
  if (!state.isActive) return false
  if (state.ctx.activePlayers) return playerID in state.ctx.activePlayers
  return state.ctx.currentPlayer === playerID
}

/** Headless SocketIO clients that drive KingfisherBot for claimed bot seats (host only). */
export function ensureOnlineBots(
  matchID: string,
  numPlayers: number,
  seats: OnlineBotSeat[],
): void {
  if (seats.length === 0 || sessions.has(matchID)) return

  const stops: Array<() => void> = []
  const server = gameServerUrl()

  for (const seat of seats) {
    const bot = new KingfisherBot({ enumerate: enumerateLegalMoves })
    const client: BotClient = Client({
      game: Game,
      numPlayers,
      playerID: seat.playerID,
      matchID,
      credentials: seat.credentials,
      multiplayer: SocketIO({ server }),
      debug: false,
    })

    let scheduled = false
    const tryPlay = () => {
      if (scheduled) return
      scheduled = true
      enqueue(matchID, async () => {
        scheduled = false
        const latest = client.getState()
        if (!latest || !canAct(latest, seat.playerID)) return

        // Gather: Ready only — never emit endStage fallbacks.
        if (latest.G.currentPhase === 'gather') {
          if (latest.G.ready[seat.playerID] !== true) {
            client.moves.setReady()
            await delay(80)
          }
          return
        }

        // Already locked a card this step — wait for phase advance.
        if (
          latest.G.currentPhase.startsWith('step') &&
          latest.G.selections[seat.playerID] !== undefined
        ) {
          return
        }

        try {
          const { action } = await bot.play(latest, seat.playerID)
          const type = action?.payload?.type
          if (!type || typeof client.moves[type] !== 'function') return
          const args = action.payload.args ?? []
          // Re-check after async AI — another seat may have advanced stateID.
          const fresh = client.getState()
          if (!fresh || !canAct(fresh, seat.playerID)) return
          if (fresh.G.currentPhase !== latest.G.currentPhase) return
          client.moves[type](...args)
          await delay(80)
        } catch (err) {
          console.warn(`online bot ${seat.playerID}:`, err)
        }
      })
    }

    const unsubscribe = client.subscribe((state) => {
      if (!state || !canAct(state, seat.playerID)) return
      tryPlay()
    })

    client.start()
    stops.push(() => {
      unsubscribe()
      client.stop()
    })
  }

  sessions.set(matchID, () => {
    for (const stop of stops) stop()
    sessions.delete(matchID)
    matchQueues.delete(matchID)
  })
}

export function stopOnlineBots(matchID: string): void {
  sessions.get(matchID)?.()
}
