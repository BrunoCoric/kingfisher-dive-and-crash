export type StartConfig =
  | { kind: 'tutorial' }
  | {
      kind: 'bots'
      numPlayers: number
      humanSeat: string
      botSeats: string[]
      /** Soft per-species passives; default on in Create game. */
      speciesPowers: boolean
    }
