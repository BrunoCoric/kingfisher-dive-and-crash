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
  // One place per round; birds start off the board (placement onBegin clears perches).
  if (G.locked[playerID]) return
  const occupied = Object.values(G.players).some((candidate) => candidate.perch === perchId)
  if (occupied) return

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
    const peek = selection.peek
    const moveTo = selection.moveTo
    if (peek !== undefined && moveTo !== undefined) return
    const occupied = Object.values(G.players).map((p) => p.perch).filter(Boolean)
    const open = openHoverPerches(G.perches, player.perch, occupied)
    const canScout = hasHoverPeekTarget(G, pid)
    const canRelocate = open.length > 0
    if (peek !== undefined) {
      if (!isHoverPeekTarget(G, pid, peek)) return
    } else if (moveTo !== undefined) {
      if (!open.some((p) => p.id === moveTo)) return
    } else if (canScout || canRelocate) {
      // Scout XOR Relocate: must pick a zone or a free adjacent perch when either exists.
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

/**
 * Apply a declared Hover Relocate (or stay). Scout / empty Hover auto-resolve in
 * hoverPhase.onBegin; this move remains for bots / race safety.
 */
export function hoverMove(
  { G, playerID, events }: FnContext<GameState> & { playerID: PlayerID },
  moveTo?: string,
): void {
  const player = G.players[playerID]
  const sel = G.selections[playerID]
  if (!player || !sel || sel.card !== 'Hover') return
  if (G.hovered.includes(playerID)) return

  const target = moveTo ?? sel.moveTo
  if (target !== undefined) {
    const occupied = Object.values(G.players).map((p) => p.perch).filter(Boolean)
    if (openHoverPerches(G.perches, player.perch, occupied).some((p) => p.id === target)) {
      player.perch = target
    }
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
