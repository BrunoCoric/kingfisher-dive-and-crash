import type { CardType } from '../game/types'
import { ActionCard } from './ActionCard'
import styles from './Hand.module.css'

interface HandProps {
  hand: CardType[]
  locked: boolean
  canAct: boolean
  selectedCard: CardType | null
  /** Controlled by StatusLine dock toggle. */
  open: boolean
  onSelect: (card: CardType) => void
}

/** Bottom-left fan of held action cards (show/hide lives on StatusLine). */
export function Hand({ hand, locked, canAct, selectedCard, open, onSelect }: HandProps) {
  if (!open) return null

  return (
    <div
      className={`${styles.holder}${locked ? ` ${styles.locked}` : ''}`}
      aria-label={locked ? 'Locked in' : 'Your hand'}
    >
      <div className={styles.fan}>
        {hand.length === 0 && <span className={styles.empty}>Empty</span>}
        {hand.map((card, i) => {
          const tilt = (i - (hand.length - 1) / 2) * 7
          return (
            <ActionCard
              key={card}
              card={card}
              tilt={tilt}
              selected={selectedCard === card}
              disabled={locked || !canAct}
              onClick={() => {
                if (!canAct || locked) return
                onSelect(card)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
