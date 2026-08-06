import { useState } from 'react'
import type { CardType } from '../game/types'
import { ACTION_LABEL, CARD_ACCENT } from '../lib/presentation'
import { ActionCard } from './ActionCard'
import { ActionIcon } from './ActionIcon'
import styles from './Hand.module.css'

interface HandProps {
  hand: CardType[]
  locked: boolean
  canAct: boolean
  selectedCard: CardType | null
  onSelect: (card: CardType) => void
}

export function Hand({ hand, locked, canAct, selectedCard, onSelect }: HandProps) {
  const [open, setOpen] = useState(true)
  const badge = selectedCard ?? hand[0] ?? null
  const cls = [styles.holder]
  if (!open) cls.push(styles.minimized)
  if (locked) cls.push(styles.locked)

  return (
    <div className={cls.join(' ')} aria-label={locked ? 'Locked in' : 'Your hand'}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-label={open ? 'Minimize hand' : 'Show hand'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide' : badge ? ACTION_LABEL[badge] : 'Hand'}
        {!open && badge && (
          <span
            className={styles.toggleIcon}
            style={{ ['--card-accent' as string]: CARD_ACCENT[badge] }}
          >
            <ActionIcon card={badge} className={styles.miniIcon} />
          </span>
        )}
        {!open && <span className={styles.count}>{hand.length}</span>}
      </button>

      {open && (
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
      )}
    </div>
  )
}
