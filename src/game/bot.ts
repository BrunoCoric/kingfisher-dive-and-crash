import { Bot } from 'boardgame.io/ai'
import type { Ctx, PlayerID, State } from 'boardgame.io'
import type { AiEnumerate } from 'boardgame.io'
import { filterPlayerView } from './playerView'
import type { GameState } from './types'
import { initMemory, syncMemory } from './ai/memory'
import { syncBelief } from './ai/belief'
import { DEFAULT_WEIGHTS, scoreMove, riskFactor } from './ai/scoring'
import type { BeliefContext } from './ai/scoring'
import { temperatureFor, pickAction, type BotAction } from './ai/select'
import { LegacyKingfisherBot } from './ai/legacy'

export { LegacyKingfisherBot }

type EnumerateFn = (G: GameState, ctx: Ctx, playerID: PlayerID) => AiEnumerate

/**
 * Smart `KingfisherBot`. It orchestrates four private, instance-held modules —
 * opponent-hand belief tracking, fish-drift memory, belief-based scoring, and
 * softmax/temperature sampling over the legal move set. All reasoning runs on
 * the same filtered `playerView` a client sees, so hidden information never
 * leaks to the bot.
 */
export class KingfisherBot extends Bot {
  private difficulty: number
  private memory = initMemory(0)

  constructor(opts: { enumerate: EnumerateFn; seed?: string | number; difficulty?: number }) {
    super(opts)
    this.difficulty = opts.difficulty ?? 1
  }

  async play(state: State<GameState>, playerID: PlayerID): Promise<{ action: BotAction }> {
    if (this.memory.zoneCount !== state.G.zones.length) {
      this.memory = initMemory(state.G.zones.length)
    }
    const view = filterPlayerView({ G: state.G, ctx: state.ctx, playerID })
    syncMemory(this.memory, view)
    syncBelief(this.memory, view, playerID)

    const context: BeliefContext = { memory: this.memory, weights: DEFAULT_WEIGHTS }
    const factor = riskFactor(view, playerID)

    const candidates = this.enumerate(view, state.ctx, playerID).filter(
      (a): a is BotAction => a != null && a.payload != null,
    )
    if (candidates.length === 0) {
      throw new Error(`KingfisherBot: no legal actions for ${playerID} in ${view.currentPhase}`)
    }
    const scores = candidates.map((a) => scoreMove(view, playerID, a.payload.type, a.payload.args ?? [], context, factor))

    const temperature = temperatureFor(this.difficulty)
    const action = pickAction(candidates, scores, () => this.random(), temperature)
    return { action }
  }
}