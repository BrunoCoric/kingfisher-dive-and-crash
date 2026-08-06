import type { Ctx } from 'boardgame.io'
import type { GameState } from '../game/types'
import { humanGate, humanGateKey } from './script'
import type { TutorialGate, TutorialLesson } from './types'

function outcomeKinds(G: GameState): Set<string> {
  return new Set(G.outcomeLog.map((o) => o.kind))
}

function stepReviewKey(G: GameState): string {
  return `step:${G.round}-${G.step}-${G.outcomeLog.map((o) => `${o.kind}@${o.zone}`).join('|')}`
}

function cleanupReviewKey(G: GameState): string {
  return `cleanup:${G.round}`
}

/**
 * Pure lesson picker. `dismissedReview` is the last review key acknowledged
 * with Got it — reviews block the action gate until dismissed.
 */
export function lessonFor(
  G: GameState,
  _ctx: Ctx,
  playerID: string,
  dismissedReview: string | null,
): TutorialLesson {
  if (!G.tutorial) {
    return { id: 'off', title: '', body: '', gate: null }
  }

  if (G.round >= 5) {
    return {
      id: 'done',
      title: 'You are ready',
      body: 'Catch, crash, splash, steal, Drop+Drop, Hover, and Pike — Menu → Play vs Bots.',
      gate: null,
      done: true,
    }
  }

  if (G.currentPhase === 'cleanup') {
    if (G.outcomeLog.length > 0) {
      const sk = stepReviewKey(G)
      if (dismissedReview !== sk) {
        const review = reviewLesson(G, outcomeKinds(G), sk)
        if (review) return review
      }
    }
    const ck = cleanupReviewKey(G)
    if (dismissedReview !== ck) {
      return {
        id: `cleanup-review-${G.round}`,
        title: G.round === 4 ? 'Tutorial complete' : 'End of round',
        body:
          G.round === 4
            ? 'You have seen the full collision set. Tap Got it, then Next round — or Menu to play for real.'
            : 'Fish will drift downstream, hands reset, and First Player passes. Tap Got it, then Next round.',
        gate: null,
        reviewKey: ck,
      }
    }
    const gate = humanGate(G, playerID)
    return {
      id: `cleanup-${G.round}`,
      title: G.round === 4 ? 'Finish' : 'Next round',
      body: 'Tap Next round.',
      gate,
      done: G.round === 4,
    }
  }

  const kinds = outcomeKinds(G)
  if (G.outcomeLog.length > 0) {
    const sk = stepReviewKey(G)
    if (dismissedReview !== sk) {
      const review = reviewLesson(G, kinds, sk)
      if (review) return review
    }
  }

  const key = humanGateKey(G, playerID)
  const gate = humanGate(G, playerID)
  if (!key || !gate) {
    return {
      id: 'wait',
      title: 'Watch the river',
      body: 'The other kingfishers are taking their scripted turns.',
      gate: null,
    }
  }
  return actionLesson(key, gate)
}

function reviewLesson(G: GameState, kinds: Set<string>, rk: string): TutorialLesson | null {
  if (kinds.has('pike')) {
    return {
      id: 'review-pike',
      title: 'Pike!',
      body: 'Catching a Pike discards it and a Minnow from your pile if you have one.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('steal')) {
    return {
      id: 'review-steal',
      title: 'Steal!',
      body: 'Drop ambushed a successful solo Dive. The diver’s Dive card bounced back to their hand.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('blocked')) {
    return {
      id: 'review-splash',
      title: 'Splash block',
      body: 'Splash cancels Dives on that zone. The fish stays; the Dive card is spent. Drops are not splashed.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('crash') && G.round === 3 && G.step === 0) {
    return {
      id: 'review-dive-crash',
      title: 'Dive Crash!',
      body: 'Two Dives collide. Fish stays; each bird spends Dive and discards one extra random hand card.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('crash') && G.round === 3) {
    return {
      id: 'review-drop-crash',
      title: 'Drop + Drop Crash!',
      body: 'Two or more Drops crash — no steal, fish stays, each Dropper loses an extra random hand card.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('crash')) {
    return {
      id: 'review-dive-crash',
      title: 'Dive Crash!',
      body: 'Same-action Crash: fish stays; played card spent plus one random extra hand discard.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('catch')) {
    return {
      id: 'review-catch',
      title: 'Catch!',
      body: 'A solo Dive on a zone with fish scores it. Card effects last only for this step.',
      gate: null,
      reviewKey: rk,
    }
  }
  return {
    id: 'review-generic',
    title: 'Step resolved',
    body: 'Read the badges on the river — then continue when ready.',
    gate: null,
    reviewKey: rk,
  }
}

function actionLesson(key: string, gate: TutorialGate): TutorialLesson {
  const copy: Record<string, { title: string; body: string }> = {
    '1|placement|place': {
      title: 'Claim a perch',
      body: 'Tap the highlighted low perch. Low branches see fewer zones but grant a secret peek.',
    },
    '1|placement|peek': {
      title: 'Sightline peek',
      body: 'Tap the highlighted face-down fish to peek. Only you see it.',
    },
    '1|step1': {
      title: 'Solo Dive',
      body: 'Tap Dive, then the highlighted zone to catch that fish alone.',
    },
    '1|step2': {
      title: 'Drop without a Dive',
      body: 'Tap Drop on the highlighted zone. With no successful Dive there, Drop does nothing.',
    },
    '1|step3': {
      title: 'Hover Relocate',
      body: 'Tap Hover, then the highlighted adjacent perch. Scout (peek) or Relocate — not both.',
    },
    '2|placement|place': {
      title: 'High perch',
      body: 'Tap the highlighted high perch. High branches reach farther and skip the sightline peek.',
    },
    '2|step1': {
      title: 'Splash',
      body: 'Tap Splash on the highlighted zone. A rival is about to Dive there — block them.',
    },
    '2|step2': {
      title: 'Drop steal',
      body: 'Tap Drop on the highlighted zone. Steal the fish from a successful solo Dive.',
    },
    '2|step3': {
      title: 'Hover Scout',
      body: 'Tap Hover and peek the highlighted face-down zone. You stay on your perch.',
    },
    '3|placement|place': {
      title: 'Hold the high perch',
      body: 'Tap the highlighted perch so you can reach zones 1–3 for the crash lessons.',
    },
    '3|step1': {
      title: 'Dive Crash',
      body: 'Tap Dive on the highlighted zone. Another bird will Dive the same water — Crash!',
    },
    '3|step2': {
      title: 'Scout the contested fish',
      body: 'Tap Hover and peek the crash zone — the fish is still there. Rivals Drop+Drop elsewhere.',
    },
    '3|step3': {
      title: 'Spend the leftover',
      body: 'Tap Drop on the highlighted zone. After a Crash you lost an extra card — tempo matters.',
    },
    '4|placement|place': {
      title: 'Line up on Pike',
      body: 'Tap the highlighted perch. A Pike has drifted into the downstream zone.',
    },
    '4|step1': {
      title: 'Pike hazard',
      body: 'Tap Dive on the highlighted zone. Catching a Pike discards a Minnow if you have one.',
    },
    '4|step2': {
      title: 'Almost done',
      body: 'Tap Hover and Scout an unseen zone to burn the middle step.',
    },
    '4|step3': {
      title: 'Last Splash',
      body: 'Tap Splash on the highlighted zone to finish the round.',
    },
  }
  const text = copy[key] ?? { title: 'Follow the highlight', body: 'Tap only what the coach highlights.' }
  return { id: key, title: text.title, body: text.body, gate }
}
