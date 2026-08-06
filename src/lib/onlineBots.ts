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

function botIsActive(state: { ctx: { gameover?: unknown; activePlayers: Record<string, string> | null; currentPlayer: string } }, playerID: string): boolean {
  if (state.ctx.gameover !== undefined) return false
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

  for (const seat of seats) {
    const bot = new KingfisherBot({ enumerate: enumerateLegalMoves })
    const client: BotClient = Client({
      game: Game,
      numPlayers,
      playerID: seat.playerID,
      matchID,
      credentials: seat.credentials,
      multiplayer: SocketIO({ server: gameServerUrl() }),
      debug: false,
    })

    let busy = false
    const unsubscribe = client.subscribe((state) => {
      if (!state || busy || !botIsActive(state, seat.playerID)) return
      busy = true
      window.setTimeout(() => {
        void (async () => {
          try {
            const latest = client.getState()
            if (!latest || !botIsActive(latest, seat.playerID)) return
            const { action } = await bot.play(latest, seat.playerID)
            if (action) client.store.dispatch(action)
          } catch (err) {
            console.warn(`online bot ${seat.playerID}:`, err)
          } finally {
            busy = false
          }
        })()
      }, 180)
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
  })
}

export function stopOnlineBots(matchID: string): void {
  sessions.get(matchID)?.()
}
