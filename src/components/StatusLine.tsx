import type { ReactNode } from 'react'
import type { GameState } from '../game/types'
import { STEPS_PER_ROUND } from '../game/cards'
import { outcomeStory } from '../lib/stepFeedback'
import styles from './StatusLine.module.css'

interface StatusLineProps {
  G: GameState
  isActive: boolean
  isSighting?: boolean
  showStory?: boolean
  hint?: string
  actions?: ReactNode
}

export function StatusLine({
  G,
  isActive,
  isSighting = false,
  showStory = true,
  hint,
  actions,
}: StatusLineProps) {
  const story = showStory ? outcomeStory(G) : ''
  const phase = hint ?? phaseText(G, isActive, isSighting)
  const last = G.outcomeLog.at(-1)
  const callout = last && !hint ? calloutFor(last.kind) : null

  return (
    <div className={styles.line} aria-live="polite">
      <div className={styles.copy}>
        {callout && <span className={`${styles.callout} ${styles[callout.kind]}`}>{callout.label}</span>}
        <span className={styles.phase}>{phase}</span>
        {story && !hint && <span className={styles.story}>{story}</span>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}

function phaseText(G: GameState, isActive: boolean, isSighting: boolean): string {
  const step = G.step + 1
  if (G.currentPhase === 'placement') {
    if (isActive) {
      return isSighting ? 'Low perch — peek a reachable zone' : 'Choose a perch'
    }
    return 'Waiting for perch placement'
  }
  if (G.currentPhase.startsWith('hover')) {
    return 'Hover — resolving Scout / Relocate'
  }
  if (G.currentPhase === 'cleanup') {
    return isActive ? 'Round over — tap Next round when ready' : 'Round over — waiting for Next round'
  }
  return `Step ${step}/${STEPS_PER_ROUND} — ${isActive ? 'choose an action' : 'waiting'}`
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
