import type { FnContext, PlayerID } from 'boardgame.io'
import { reachableZones, openHoverPerches } from './reach'
import { hasLegalStepMove } from './enumerate'
import { hasHoverPeekTarget, isHoverPeekTarget } from './hoverPeek'
import type { CardType, GameState, StepSelection } from './types'

export function placePawn(
  { G, playerID, ctx, events }: FnContext<GameState> & { playerID: PlayerID },
  perchId: string,
): void {
  if (G.currentPhase !== 'placement' || playerID !== ctx.currentPlayer) return
  const player = G.players[playerID]
  const perch = G.perches.find((candidate) => candidate.id === perchId)
  if (!player || !perch) return
  // One reposition per round; `locked` is reset by round cleanup.
  if (G.locked[playerID]) return
  // Staying on the current perch is an explicit choice (lets a low-perch player peek).
  const staying = perchId === player.perch
  const occupied = Object.values(G.players).some((candidate) => candidate.perch === perchId)
  if (!staying && occupied) return

  player.perch = perchId
  G.locked[playerID] = true
  // A low perch grants a private sightline peek before the turn ends.
  if (perch.level === 'low') return
  events.endTurn()
}

/** Records the zone a low-perch player peeked at during placement, then ends the turn. */
export function peekSightline(
  { G, playerID, ctx, events }: FnContext<GameState> & { playerID: PlayerID },
  zoneId: number,
): void {
  if (G.currentPhase !== 'placement' || playerID !== ctx.currentPlayer) return
  const player = G.players[playerID]
  const perch = player ? G.perches.find((candidate) => candidate.id === player.perch) : undefined
  if (!player || !perch || !G.locked[playerID] || perch.level !== 'low') return
  if (G.sightlinePeek[playerID] !== undefined) return
  if (!reachableZones(perch.zone, perch.level, G.zones.length).includes(zoneId)) return

  G.sightlinePeek[playerID] = zoneId
  G.peeked[playerID] = [...(G.peeked[playerID] ?? []), zoneId]
  events.endTurn()
}

function removeCardFromHand(hand: CardType[], card: CardType): CardType[] {
  const idx = hand.indexOf(card)
  if (idx === -1) return hand
  return [...hand.slice(0, idx), ...hand.slice(idx + 1)]
}

export function selectCard(
  { G, ctx, playerID, events }: FnContext<GameState> & { playerID: PlayerID },
  card: CardType,
  selection: Omit<StepSelection, 'card'> = {},
): void {
  const pid = playerID
  const player = G.players[pid]
  if (!player) return
  if (G.selections[pid] !== undefined) return
  if (!player.hand.includes(card)) return

  const perch = G.perches.find((p) => p.id === player.perch)
  if (!perch) return
  const reach = reachableZones(perch.zone, perch.level, G.zones.length)

  if (card === 'Dive' || card === 'Drop' || card === 'Splash') {
    if (selection.target === undefined || !reach.includes(selection.target)) return
    if (card === 'Dive' && !G.zones[selection.target]?.fish) return
  }

  if (card === 'Hover') {
    if (selection.peek !== undefined) {
      if (!isHoverPeekTarget(G, pid, selection.peek)) return
    } else if (hasHoverPeekTarget(G, pid)) {
      // Must peek exactly one face-down card when any remain.
      return
    }
  }

  player.hand = removeCardFromHand(player.hand, card)
  G.selections[pid] = { card, ...selection }
  if (card === 'Hover' && selection.peek !== undefined) {
    G.peeked[pid] = [...(G.peeked[pid] ?? []), selection.peek]
  }
  G.locked[pid] = true
  const allSelected = ctx.playOrder.every((playerID) => G.selections[playerID] !== undefined)
  if (allSelected) events.endPhase()
  else events.endStage()
}

/**
 * Pass without playing a card. Only legal when the player can't play any card
 * (e.g. an empty hand, or a lone Dive with every reachable zone already
 * caught). The player is locked in with a `null` selection and the phase
 * advances exactly like any other selection.
 */
export function skipTurn(
  { G, ctx, playerID, events }: FnContext<GameState> & { playerID: PlayerID },
): void {
  const pid = playerID
  const player = G.players[pid]
  if (!player) return
  if (!G.currentPhase.startsWith('step')) return
  if (G.selections[pid] !== undefined) return
  if (hasLegalStepMove(G, pid)) return

  G.selections[pid] = null
  G.locked[pid] = true
  const allSelected = ctx.playOrder.every((id) => G.selections[id] !== undefined)
  if (allSelected) events.endPhase()
  else events.endStage()
}

/** Turn-order Hover resolution: move to an adjacent unoccupied perch, or stay (undefined). */
export function hoverMove(
  { G, playerID, events }: FnContext<GameState> & { playerID: PlayerID },
  moveTo?: string,
): void {
  const player = G.players[playerID]
  const sel = G.selections[playerID]
  if (!player || !sel || sel.card !== 'Hover') return
  if (G.hovered.includes(playerID)) return

  if (moveTo !== undefined) {
    const occupied = Object.values(G.players).map((p) => p.perch).filter(Boolean)
    if (!openHoverPerches(G.perches, player.perch, occupied).some((p) => p.id === moveTo)) return
    player.perch = moveTo
  }
  G.hovered.push(playerID)
  events.endTurn()
}

/**
 * End-of-round review beat: player dismisses the last step's river feedback,
 * then cleanup drifts fish / resets hands and placement begins.
 */
export function continueRound({ G, events }: FnContext<GameState>): void {
  if (G.currentPhase !== 'cleanup') return
  events.endPhase()
}
