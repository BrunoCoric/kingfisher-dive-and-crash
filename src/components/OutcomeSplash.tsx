import { useState, type AnimationEvent } from 'react'
import type { GameState } from '../game/types'
import { seatKingfisher, spriteScaleStyle } from '../lib/presentation'
import { personalOutcomeSplash } from '../lib/personalSplash'
import { playSfx } from '../lib/sfx'
import styles from './OutcomeSplash.module.css'

interface Props {
  G: GameState
  playerID: string
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Local-only joyful bird burst after resolve (VISUALS §6 Step 4b). Remount via key per step. */
export function OutcomeSplash({ G, playerID }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [live, setLive] = useState(false)

  const splash = personalOutcomeSplash(G, playerID)
  if (!splash || dismissed || prefersReducedMotion()) return null

  const bird = seatKingfisher(G, playerID)
  const dismiss = () => setDismissed(true)
  const onRootAnim = (e: AnimationEvent<HTMLButtonElement>, fn: () => void) => {
    if (e.target === e.currentTarget) fn()
  }

  return (
    <button
      type="button"
      className={`${styles.splash} ${styles[splash.valence]}${live ? ` ${styles.live}` : ''}`}
      style={{ ['--splash-accent' as string]: bird.accent }}
      aria-live="polite"
      aria-label={splash.label}
      onClick={dismiss}
      onAnimationStart={(e) =>
        onRootAnim(e, () => {
          setLive(true)
          playSfx(splash.valence === 'good' ? 'splash_good' : 'splash_bad')
        })
      }
      onAnimationEnd={(e) => onRootAnim(e, dismiss)}
    >
      <img
        className={styles.bird}
        src={bird.sprite}
        alt=""
        style={spriteScaleStyle(bird.spriteScale)}
      />
      <span className={styles.label}>{splash.label}</span>
    </button>
  )
}
