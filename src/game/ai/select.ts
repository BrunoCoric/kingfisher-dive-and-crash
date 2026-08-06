import type { ActionShape } from 'boardgame.io'

export type BotAction = ActionShape.MakeMove | ActionShape.GameEvent

/**
 * Softmax over a tight near-best band. Default difficulty plays nearly greedy:
 * private peeks + per-bot hash personality already diversify targets (like the
 * legacy argmax bot). Wide temperature was the main crash source — bots with
 * the same info randomly re-converged on one tile.
 */
export function temperatureFor(difficulty: number): number {
  // difficulty 0 → 0.22 exploratory; difficulty 1 → 0.04 near-greedy.
  return Math.max(0.02, 0.22 - 0.18 * difficulty)
}

function sortKey(action: BotAction): string {
  return `${action.payload.type}|${JSON.stringify(action.payload.args)}`
}

export function pickAction(
  actions: BotAction[],
  scores: number[],
  random: () => number,
  temperature: number,
): BotAction {
  if (actions.length === 0) throw new Error('pickAction: no candidates')
  const scored = actions.map((action, i) => ({ action, score: scores[i] ?? -Infinity, key: sortKey(action) }))
  // Prefer higher score; stable key breaks remaining ties so bots don't need RNG to diverge.
  scored.sort((a, b) => b.score - a.score || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))

  let best = -Infinity
  for (const s of scored) if (Number.isFinite(s.score) && s.score > best) best = s.score
  if (best === -Infinity) best = 0

  const band = Math.max(0.08, temperature)
  const near = scored.filter((s) => Number.isFinite(s.score) && s.score >= best - band)
  const pool = near.length > 0 ? near : scored

  if (temperature <= 0.03 || pool.length === 1) return pool[0].action

  const exps = pool.map((s) => {
    const v = Number.isFinite(s.score) ? Math.exp((s.score - best) / temperature) : 0
    return v
  })
  let sum = 0
  for (const e of exps) sum += e
  if (sum <= 0) return pool[0].action

  let r = random() * sum
  for (let i = 0; i < pool.length; i++) {
    r -= exps[i]
    if (r <= 0) return pool[i].action
  }
  return pool[pool.length - 1].action
}