import type { Ctx, PlayerID } from 'boardgame.io'
import type { AiEnumerate } from 'boardgame.io'
import { reachableZones, openHoverPerches } from './reach'
import { hasHoverPeekTarget, isHoverPeekTarget } from './hoverPeek'
import type { GameState } from './types'

/**
 * Legal moves for one player from the current state. Operates on whatever G it
 * is given (full or player-filtered): on a player view, face-down fish are the
 * truthy `'hidden'` sentinel, so existence checks still behave like the master.
 */
export function enumerateLegalMoves(G: GameState, ctx: Ctx, playerID: PlayerID): AiEnumerate {
  if (playerID === null) return []
  const player = G.players[playerID]
  if (!player) return []
  const candidates: AiEnumerate = []

  if (G.currentPhase === 'placement') {
    const occupied = new Set(Object.values(G.players).map((p) => p.perch).filter(Boolean))
    const placedThisRound = G.locked[playerID] === true
    if (!placedThisRound) {
      // Birds start off the board each round — any free perch is legal.
      for (const perch of G.perches) {
        if (!occupied.has(perch.id)) {
          candidates.push({ move: 'placePawn', args: [perch.id] })
        }
      }
    } else {
      const perch = G.perches.find((p) => p.id === player.perch)
      if (perch && perch.level === 'low' && G.sightlinePeek[playerID] === undefined) {
        for (const zone of reachableZones(perch.zone, perch.level, G.zones.length)) {
          candidates.push({ move: 'peekSightline', args: [zone] })
        }
      }
    }
    return fallback(ctx, candidates)
  }

  if (G.currentPhase.startsWith('step')) {
    // Already locked in (card or skipTurn null) — nothing left to do this step.
    if (G.selections[playerID] !== undefined) return fallback(ctx, candidates)

    const perch = G.perches.find((p) => p.id === player.perch)
    if (!perch) {
      candidates.push({ move: 'skipTurn', args: [] })
      return candidates
    }
    const reach = reachableZones(perch.zone, perch.level, G.zones.length)

    for (const card of player.hand) {
      if (card === 'Hover') {
        if (!hasHoverPeekTarget(G, playerID)) {
          candidates.push({ move: 'selectCard', args: ['Hover', {}] })
        } else {
          for (const zone of G.zones) {
            if (isHoverPeekTarget(G, playerID, zone.id)) {
              candidates.push({ move: 'selectCard', args: ['Hover', { peek: zone.id }] })
            }
          }
        }
        continue
      }
      for (const target of reach) {
        if (card === 'Dive' && !G.zones[target]?.fish) continue
        candidates.push({ move: 'selectCard', args: [card, { target }] })
      }
    }
    // No legal card (empty hand, or Dive-only into emptied zones): must skipTurn
    // so a selection is recorded. Bare endStage leaves the phase stuck with
    // activePlayers drained and a missing seat in G.selections.
    if (candidates.length === 0) candidates.push({ move: 'skipTurn', args: [] })
    return candidates
  }

  if (G.currentPhase.startsWith('hover')) {
    const sel = G.selections[playerID]
    if (sel?.card === 'Hover' && !G.hovered.includes(playerID)) {
      const occupied = Object.values(G.players).map((p) => p.perch).filter(Boolean)
      const open = openHoverPerches(G.perches, player.perch, occupied)
      // Engine auto-stays when open is empty; keep stay for bots / race safety.
      candidates.push({ move: 'hoverMove', args: [] })
      for (const perch of open) {
        candidates.push({ move: 'hoverMove', args: [perch.id] })
      }
    }
    return fallback(ctx, candidates)
  }

  if (G.currentPhase === 'cleanup') {
    candidates.push({ move: 'continueRound', args: [] })
    return candidates
  }

  return []
}

/**
 * Whether a player has at least one legal card to play in the current step.
 * With the standard 4-card deck, a player is left with no legal play only when
 * their remaining hand is a Dive with every reachable zone already emptied
 * (Dive also has a guard against empty zones). Everything else either has a
 * reachable target or is Hover, which always has a legal (stay) action.
 */
export function hasLegalStepMove(G: GameState, playerID: PlayerID): boolean {
  if (G.selections[playerID] != null) return false
  const player = G.players[playerID]
  if (!player) return false
  const perch = G.perches.find((p) => p.id === player.perch)
  if (!perch) return false
  const reach = reachableZones(perch.zone, perch.level, G.zones.length)
  return player.hand.some((card) => {
    if (card === 'Hover') return true
    return reach.some((target) => !(card === 'Dive' && !G.zones[target]?.fish))
  })
}

/**
 * Players with no legal move still need a way to advance, or bot-driven
 * simultaneous phases stall on them. Ending the stage (or turn) is the honest
 * pass.
 */
function fallback(ctx: Ctx, candidates: AiEnumerate): AiEnumerate {
  if (candidates.length > 0) return candidates
  return [{ event: ctx.activePlayers ? 'endStage' : 'endTurn', args: [] }]
}
