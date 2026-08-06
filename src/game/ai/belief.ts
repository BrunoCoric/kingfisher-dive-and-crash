import type { CardType, GameState } from '../types'
import { ACTION_DECK } from '../cards'
import type { BotMemory, OpponentHand } from './types'

/**
 * Opponent hand inference, purely a function of an (already filtered) player
 * view plus the bot's per-instance accumulated belief. The hand space is tiny
 * (4 cards), so an exact distribution over subsets is both cheap and immune to
 * belief-drift from the random discard that follows a crash/block.
 */
export function freshHand(): OpponentHand {
  const dist = new Map<string, number>()
  dist.set(sortedKey([...ACTION_DECK] as CardType[]), 1)
  return { dist }
}

function sortedKey(cards: CardType[]): string {
  return [...cards].sort().join('+')
}

function cardsOf(key: string): CardType[] {
  return key === '' ? [] : (key.split('+') as CardType[])
}

/** P(the opponent still holds `card` this step). */
export function pOfHeld(hand: OpponentHand, card: CardType): number {
  let p = 0
  for (const [key, prob] of hand.dist) if (cardsOf(key).includes(card)) p += prob
  return p
}

/** Expected number of cards left in the opponent's hand. */
export function expectedLeft(hand: OpponentHand): number {
  let sum = 0
  for (const [key, prob] of hand.dist) sum += prob * cardsOf(key).length
  return sum
}

/** The opponent played `card` this step; that card leaves their hand. */
export function playCard(hand: OpponentHand, card: CardType): OpponentHand {
  const dist = new Map<string, number>()
  for (const [key, prob] of hand.dist) {
    const cards = cardsOf(key)
    if (!cards.includes(card)) {
      exactKeyHelper(dist, key, prob)
      continue
    }
    const idx = cards.indexOf(card)
    const rest = [...cards.slice(0, idx), ...cards.slice(idx + 1)]
    exactKeyHelper(dist, sortedKey(rest), prob)
  }
  return { dist }
}

/** A crash/block causes one *random* discard; each held card is equally likely. */
export function randomDiscard(hand: OpponentHand): OpponentHand {
  const dist = new Map<string, number>()
  for (const [key, prob] of hand.dist) {
    const cards = cardsOf(key)
    if (cards.length === 0) {
      exactKeyHelper(dist, key, prob)
      continue
    }
    for (const leave of cards) {
      const rest = cards.filter((c) => c !== leave)
      exactKeyHelper(dist, sortedKey(rest), prob / cards.length)
    }
  }
  return { dist }
}

/** "Dive bounces back" on a stolen diver: the victim regains a Dive. */
export function bounceDive(hand: OpponentHand): OpponentHand {
  const dist = new Map<string, number>()
  for (const [key, prob] of hand.dist) {
    const cards = cardsOf(key)
    if (cards.includes('Dive')) {
      exactKeyHelper(dist, key, prob)
      continue
    }
    exactKeyHelper(dist, sortedKey([...cards, 'Dive']), prob)
  }
  return { dist }
}

function exactKeyHelper(map: Map<string, number>, key: string, value: number): void {
  map.set(key, (map.get(key) ?? 0) + value)
}

/** Reset every opponent hand at the start of a new round (handReset in cleanup). */
export function resetRound(memory: BotMemory, view: GameState): void {
  for (const pid of Object.keys(view.players)) memory.oppHands[pid] = freshHand()
  // Must not share `lastRound` with fish-drift — syncMemory advances that first.
  memory.beliefRound = view.round
  memory.seenKey = ''
}

/**
 * Fold the previous step's reveal snapshot + this step's resolved outcomes into
 * the per-opponent hand beliefs. Runs once per changed snapshot (`seenKey`).
 */
export function syncBelief(memory: BotMemory, view: GameState, playerID: string): void {
  if (memory.beliefRound !== view.round) resetRound(memory, view)
  const key = JSON.stringify(view.lastReveals)
  if (key === memory.seenKey) return
  memory.seenKey = key

  const opps = Object.keys(view.players).filter((pid) => pid !== playerID)
  for (const opp of opps) if (!memory.oppHands[opp]) memory.oppHands[opp] = freshHand()

  for (const opp of opps) {
    const sel = view.lastReveals[opp]
    if (sel && sel.card) memory.oppHands[opp] = playCard(memory.oppHands[opp], sel.card)
  }
  for (const callout of view.outcomeLog) {
    if (!callout.actor) continue
    if (callout.kind === 'crash' || callout.kind === 'blocked') {
      const hand = memory.oppHands[callout.actor]
      if (hand) memory.oppHands[callout.actor] = randomDiscard(hand)
    }
  }
  for (const callout of view.outcomeLog) {
    if (callout.kind !== 'steal' || !callout.actor) continue
    const victim = oppVictimAt(view, callout.zone)
    if (victim && victim !== playerID && memory.oppHands[victim]) {
      memory.oppHands[victim] = bounceDive(memory.oppHands[victim])
    }
  }
}

/** The opponent who solo-dived the stolen zone this round (the bounce victim). */
function oppVictimAt(view: GameState, zone: number): string | undefined {
  for (const [pid, sel] of Object.entries(view.lastReveals)) {
    if (sel && sel.card === 'Dive' && sel.target === zone) return pid
  }
  return undefined
}