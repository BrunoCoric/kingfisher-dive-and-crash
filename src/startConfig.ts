export type StartConfig =
  | { kind: 'tutorial' }
  | { kind: 'bots'; numPlayers: number; humanSeat: string; botSeats: string[] }
