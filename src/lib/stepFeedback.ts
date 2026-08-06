import type { CalloutKind, CardType, GameState, OutcomeCallout, StepSelection } from '../game/types'
import { speciesShort } from './presentation'

export interface ZoneAction {
  playerId: string
  card: CardType
}

/** Prefer harsher reactions when a player has multiple outcomes in one step. */
const REACTION_PRIORITY: CalloutKind[] = ['crash', 'blocked', 'steal', 'catch', 'pike']

const OUTCOME_LABEL: Record<CalloutKind, string> = {
  catch: 'CATCH',
  crash: 'CRASH',
  steal: 'STEAL',
  blocked: 'BLOCKED',
  pike: 'PIKE',
}

/** Zone id a selection acted on (Dive/Drop/Splash target, or Hover peek). */
export function selectionZone(sel: StepSelection): number | undefined {
  if (sel.card === 'Hover') return sel.peek
  return sel.target
}

/** Per-zone list of who played which card into that zone. */
export function zoneActions(G: GameState): Record<number, ZoneAction[]> {
  const out: Record<number, ZoneAction[]> = {}
  for (const [pid, sel] of Object.entries(G.lastReveals)) {
    if (!sel) continue
    const zone = selectionZone(sel)
    if (zone === undefined) continue
    ;(out[zone] ??= []).push({ playerId: pid, card: sel.card })
  }
  return out
}

/** Per-zone outcome callouts from the last resolved step. */
export function zoneOutcomes(G: GameState): Record<number, OutcomeCallout[]> {
  const out: Record<number, OutcomeCallout[]> = {}
  for (const c of G.outcomeLog) {
    if (c.zone < 0) continue
    ;(out[c.zone] ??= []).push(c)
  }
  return out
}

/** Primary pawn reaction per actor for the last resolved step. */
export function playerReactions(G: GameState): Record<string, CalloutKind> {
  const byActor: Record<string, CalloutKind[]> = {}
  for (const c of G.outcomeLog) {
    if (c.actor === undefined) continue
    ;(byActor[c.actor] ??= []).push(c.kind)
  }
  const out: Record<string, CalloutKind> = {}
  for (const [pid, kinds] of Object.entries(byActor)) {
    out[pid] = REACTION_PRIORITY.find((k) => kinds.includes(k)) ?? kinds[0]
  }
  return out
}

/** Short target label for a revealed selection, e.g. "→ Z3". */
export function selectionDetail(sel: StepSelection): string {
  if (sel.card === 'Hover') {
    return [
      sel.peek !== undefined ? `peek Z${sel.peek + 1}` : null,
      sel.moveTo ? `→ ${sel.moveTo}` : null,
    ]
      .filter(Boolean)
      .join(' · ')
  }
  return sel.target !== undefined ? `→ Z${sel.target + 1}` : ''
}

/** One readable sentence summarizing the last step's outcomes. */
export function outcomeStory(G: GameState): string {
  if (G.outcomeLog.length === 0) return ''
  return G.outcomeLog
    .map((c) => {
      const who = c.actor !== undefined ? speciesShort(Number(c.actor)) : '?'
      const where = c.zone >= 0 ? ` Z${c.zone + 1}` : ''
      const pts = c.points !== undefined ? ` +${c.points}` : ''
      return `${who} ${OUTCOME_LABEL[c.kind]}${pts}${where}`
    })
    .join(' · ')
}

export function outcomeLabel(kind: CalloutKind): string {
  return OUTCOME_LABEL[kind]
}

/** Primary outcome callout for a zone (badge / tile flash). */
export function primaryZoneCallout(callouts: OutcomeCallout[]): OutcomeCallout | null {
  if (callouts.length === 0) return null
  const kind = REACTION_PRIORITY.find((k) => callouts.some((c) => c.kind === k)) ?? callouts[0].kind
  return callouts.find((c) => c.kind === kind) ?? callouts[0]
}

/** Primary outcome kind for a zone. */
export function primaryZoneOutcome(callouts: OutcomeCallout[]): CalloutKind | null {
  return primaryZoneCallout(callouts)?.kind ?? null
}
