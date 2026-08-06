import type { KingfisherID } from './game/kingfishers'
import type { OnlineBotSeat } from './lib/onlineBots'

export type StartConfig =
  | { kind: 'tutorial' }
  | {
      kind: 'bots'
      numPlayers: number
      humanSeat: string
      botSeats: string[]
      /** Soft per-species passives; default on in Create game. */
      speciesPowers: boolean
      /** Bird the human plays as (must be Nest-unlocked). */
      humanSpecies: KingfisherID
    }
  | {
      kind: 'online'
      matchID: string
      playerID: string
      credentials: string
      numPlayers: number
      playerName: string
      /** True when every lobby seat already has a name (skip waiting room). */
      tableFull: boolean
      /** Bot seats claimed by the host — host client drives their AI. */
      bots: OnlineBotSeat[]
    }
