import type { CardType } from '../game/types'
import { ACTION_LABEL, CARD_ACCENT } from '../lib/presentation'
import { ActionIcon } from './ActionIcon'
import styles from './ActionCard.module.css'

interface ActionCardProps {
  card: CardType
  selected?: boolean
  disabled?: boolean
  tilt?: number
  onClick?: () => void
}

/** Small parchment action card for the held-hand fan. */
export function ActionCard({ card, selected, disabled, tilt = 0, onClick }: ActionCardProps) {
  const cls = [styles.card]
  if (selected) cls.push(styles.selected)
  if (disabled) cls.push(styles.disabled)
  return (
    <button
      className={cls.join(' ')}
      data-card={card}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected ?? false}
      style={{
        ['--card-accent' as string]: CARD_ACCENT[card],
        ['--tilt' as string]: `${tilt}deg`,
      }}
    >
      <span className={styles.medallion}>
        <ActionIcon card={card} className={styles.icon} />
      </span>
      <span className={styles.label}>{ACTION_LABEL[card]}</span>
    </button>
  )
}
