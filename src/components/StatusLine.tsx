import type { ReactNode } from 'react'
import type { GameState } from '../game/types'
import { STEPS_PER_ROUND } from '../game/cards'
import { spriteScaleStyle } from '../lib/presentation'
import { outcomeStory } from '../lib/stepFeedback'
import styles from './StatusLine.module.css'

export interface StatusActor {
  shortName: string
  sprite: string
  accent: string
  spriteScale?: number
}

interface StatusLineProps {
  G: GameState
  isActive: boolean
  isSighting?: boolean
  showStory?: boolean
  hint?: string
  actions?: ReactNode
  /** Sequential turn actor (placement) — shown when waiting. */
  actor?: StatusActor | null
}

export function StatusLine({
  G,
  isActive,
  isSighting = false,
  showStory = true,
  hint,
  actions,
  actor = null,
}: StatusLineProps) {
  const story = showStory ? outcomeStory(G) : ''
  const phase = hint ?? phaseText(G, isActive, isSighting, actor)
  const last = G.outcomeLog.at(-1)
  const callout = last && !hint ? calloutFor(last.kind) : null
  const showActor = Boolean(actor && !isActive && !hint && G.currentPhase === 'placement')

  return (
    <div
      className={`${styles.line} ${isActive ? styles.active : styles.idle}`}
      aria-live="polite"
    >
      <div className={styles.copy}>
        {showActor && actor && (
          <span
            className={styles.actor}
            style={{ ['--actor-accent' as string]: actor.accent }}
            aria-hidden
          >
            <img
              src={actor.sprite}
              alt=""
              style={spriteScaleStyle(actor.spriteScale)}
            />
          </span>
        )}
        {isActive && !hint && !callout && <span className={styles.you}>Your turn</span>}
        {callout && <span className={`${styles.callout} ${styles[callout.kind]}`}>{callout.label}</span>}
        <span className={styles.phase}>{phase}</span>
        {story && !hint && <span className={styles.story}>{story}</span>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}

function phaseText(
  G: GameState,
  isActive: boolean,
  isSighting: boolean,
  actor: StatusActor | null,
): string {
  const step = G.step + 1
  if (G.currentPhase === 'placement') {
    if (isActive) {
      return isSighting ? 'Peek a reachable zone' : 'Choose a perch'
    }
    return actor ? `${actor.shortName} is placing` : 'Waiting for perch placement'
  }
  if (G.currentPhase.startsWith('hover')) {
    return 'Hover — resolving Scout / Relocate'
  }
  if (G.currentPhase === 'cleanup') {
    return isActive ? 'Round over — tap Next round' : 'Round over — waiting'
  }
  if (isActive) return `Step ${step}/${STEPS_PER_ROUND} — choose an action`
  return `Step ${step}/${STEPS_PER_ROUND} — waiting for flock`
}

function calloutFor(kind: string): { label: string; kind: string } | null {
  switch (kind) {
    case 'catch':
      return { label: 'CATCH!', kind: 'catch' }
    case 'crash':
      return { label: 'CRASH!', kind: 'crash' }
    case 'steal':
      return { label: 'STEAL!', kind: 'steal' }
    case 'blocked':
      return { label: 'BLOCKED', kind: 'blocked' }
    case 'pike':
      return { label: 'PIKE!', kind: 'pike' }
    default:
      return null
  }
}
