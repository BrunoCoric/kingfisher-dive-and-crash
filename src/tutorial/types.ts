import type { CardType } from '../game/types'

/** What the human is allowed to tap while a lesson is active. */
export interface TutorialGate {
  card?: CardType
  perchId?: string
  zoneId?: number
  /** Status-line primary action. */
  action?: 'stay' | 'continue' | 'skipPeek' | 'skipTurn'
}

export interface TutorialLesson {
  id: string
  title: string
  body: string
  gate: TutorialGate | null
  /** When set, show Got it before unlocking the next gate. */
  reviewKey?: string
  done?: boolean
}

export interface ScriptedMove {
  move: string
  args: unknown[]
}
