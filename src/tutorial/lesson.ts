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
 * Pure lesson picker. `dismissedReviews` is every review key acknowledged
 * with Got it — reviews block the action gate until dismissed. A set is
 * required because cleanup can still show the last step’s outcome review.
 */
export function lessonFor(
  G: GameState,
  _ctx: Ctx,
  playerID: string,
  dismissedReviews: ReadonlySet<string>,
): TutorialLesson {
  if (!G.tutorial) {
    return { id: 'off', title: '', body: '', gate: null }
  }

  if (G.round >= 3) {
    return {
      id: 'done',
      title: 'You are ready',
      body: 'Dive catches alone, Splash blocks Dive, Drop steals a catch, same card twice crashes. Leave → Play vs Bots.',
      gate: null,
      done: true,
    }
  }

  if (G.currentPhase === 'cleanup') {
    if (G.outcomeLog.length > 0) {
      const sk = stepReviewKey(G)
      if (!dismissedReviews.has(sk)) {
        const review = reviewLesson(outcomeKinds(G), sk)
        if (review) return review
      }
    }
    const ck = cleanupReviewKey(G)
    if (!dismissedReviews.has(ck)) {
      return {
        id: `cleanup-review-${G.round}`,
        title: G.round === 2 ? 'Tutorial complete' : 'End of round',
        body:
          G.round === 2
            ? 'You have the core loop. Tap Got it, then Next round — or Leave to play for real.'
            : 'Fish drift downstream, hands reset, First Player passes. Tap Got it, then Next round for the fight lessons.',
        gate: null,
        reviewKey: ck,
      }
    }
    const gate = humanGate(G, playerID)
    return {
      id: `cleanup-${G.round}`,
      title: G.round === 2 ? 'Finish' : 'Next round',
      body: 'Tap Next round.',
      gate,
      done: G.round === 2,
    }
  }

  const kinds = outcomeKinds(G)
  if (G.outcomeLog.length > 0) {
    const sk = stepReviewKey(G)
    if (!dismissedReviews.has(sk)) {
      const review = reviewLesson(kinds, sk)
      if (review) return review
    }
  }

  const key = humanGateKey(G, playerID)
  const gate = humanGate(G, playerID)
  if (!key || !gate) {
    return {
      id: 'wait',
      title: 'Watch the river',
      body: 'Rivals lock their cards — then everything reveals together.',
      gate: null,
    }
  }
  return actionLesson(key, gate)
}

function reviewLesson(kinds: Set<string>, rk: string): TutorialLesson | null {
  if (kinds.has('steal')) {
    return {
      id: 'review-steal',
      title: 'Stolen!',
      body: 'Your Drop beat their solo Dive. They get their Dive card back; you keep the fish.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('blocked')) {
    return {
      id: 'review-splash',
      title: 'Blocked!',
      body: 'Splash cancelled their Dive. The fish stayed put. Drops are not blocked by Splash.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('crash')) {
    return {
      id: 'review-dive-crash',
      title: 'Crash!',
      body: 'Two Dives on the same zone collide. Nobody gets the fish; each bird spends Dive plus one extra hand card.',
      gate: null,
      reviewKey: rk,
    }
  }
  if (kinds.has('catch')) {
    return {
      id: 'review-catch',
      title: 'Caught!',
      body: 'Solo Dive on a zone with fish scores it. Card effects last only for this step.',
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
      body: 'Sit on the lit low perch. Low branches reach fewer zones, but you get a secret peek at the start of the round.',
    },
    '1|placement|peek': {
      title: 'Sightline peek',
      body: 'Tap the lit face-down fish. Only you see it — use that intel when you Dive.',
    },
    '1|step1': {
      title: 'Solo Dive',
      body: 'You are alone on this fish. Play Dive on the lit zone — if nobody else Dives or Splashes it, you keep it.',
    },
    '1|step2': {
      title: 'Hover Scout',
      body: 'Play Hover and peek the lit face-down zone. Scout anywhere, or Relocate — never both on one play.',
    },
    '1|step3': {
      title: 'Burn a Splash',
      body: 'Play Splash on the lit zone to finish the round. You hold one card unused each round unless crashes eat tempo.',
    },
    '2|placement|place': {
      title: 'High perch',
      body: 'Sit on the lit high perch. Wider reach, no sightline peek — better for fighting over fish.',
    },
    '2|step1': {
      title: 'Splash a Dive',
      body: 'A rival is Diving the lit zone. Play Splash there first in resolve order — their Dive fails and the fish stays.',
    },
    '2|step2': {
      title: 'Drop steal',
      body: 'A rival will Dive alone on the lit zone. Play Drop there — after a successful Dive, Drop takes the fish.',
    },
    '2|step3': {
      title: 'Dive Crash',
      body: 'Play Dive on the lit zone. Another bird Dives the same water — Crash. Fish stays; both lose tempo.',
    },
  }
  const text = copy[key] ?? { title: 'Follow the highlight', body: 'Tap only what the coach highlights.' }
  return { id: key, title: text.title, body: text.body, gate }
}
