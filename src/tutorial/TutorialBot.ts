import { Bot } from 'boardgame.io/ai'
import type { Ctx, PlayerID, State } from 'boardgame.io'
import type { AiEnumerate } from 'boardgame.io'
import { filterPlayerView } from '../game/playerView'
import type { GameState } from '../game/types'
import type { BotAction } from '../game/ai/select'
import { scriptedBotMove } from './script'

type EnumerateFn = (G: GameState, ctx: Ctx, playerID: PlayerID) => AiEnumerate

function argsMatch(a: unknown[] | undefined, b: unknown[]): boolean {
  const left = a ?? []
  if (left.length !== b.length) {
    if (left.length === 0 && b.length === 1 && b[0] === undefined) return true
    if (b.length === 0 && left.length === 1 && left[0] === undefined) return true
    return false
  }
  return left.every((v, i) => JSON.stringify(v) === JSON.stringify(b[i]))
}

function isPassAction(a: BotAction): boolean {
  const t = a.payload.type
  return t === 'endStage' || t === 'endTurn' || t === 'skipTurn'
}

/** Plays the fixed tutorial script for seats 1 and 2. */
export class TutorialBot extends Bot {
  constructor(opts: { enumerate: EnumerateFn; seed?: string | number }) {
    super(opts)
  }

  async play(state: State<GameState>, playerID: PlayerID): Promise<{ action: BotAction }> {
    const view = filterPlayerView({ G: state.G, ctx: state.ctx, playerID })
    const candidates = this.enumerate(view, state.ctx, playerID).filter(
      (a): a is BotAction => a != null && a.payload != null,
    )
    if (candidates.length === 0) {
      throw new Error(`TutorialBot: no legal actions for ${playerID} in ${view.currentPhase}`)
    }

    // Already locked / empty hand — Local may still poll this seat; pass the stage.
    const onlyPass = candidates.every(isPassAction)
    if (onlyPass || view.selections[playerID] !== undefined) {
      const pass = candidates.find(isPassAction) ?? candidates[0]
      return { action: pass }
    }

    const scripted = scriptedBotMove(view, playerID)
    if (!scripted) {
      const pass = candidates.find(isPassAction)
      if (pass) return { action: pass }
      throw new Error(`TutorialBot: no script for ${playerID} in ${view.currentPhase} r${view.round}`)
    }
    const match = candidates.find(
      (a) => a.payload.type === scripted.move && argsMatch(a.payload.args, scripted.args),
    )
    if (!match) {
      const available = candidates.map((a) => `${a.payload.type}:${JSON.stringify(a.payload.args)}`)
      throw new Error(
        `TutorialBot: scripted ${scripted.move}${JSON.stringify(scripted.args)} not legal for ${playerID} ` +
          `in ${view.currentPhase} r${view.round}s${view.step}. Legal: ${available.join(' | ')}`,
      )
    }
    return { action: match }
  }
}
