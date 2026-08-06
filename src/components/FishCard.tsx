import type { FishCard as Fish } from '../game/types'
import { FISH_LABEL } from '../lib/presentation'
import { FishIcon } from './FishIcon'
import styles from './FishCard.module.css'

export function FishCard({ fish }: { fish: Fish }) {
  const cls = [
    styles.card,
    fish.type === 'Trout' ? styles.trout : '',
    fish.type === 'Trash' ? styles.trash : '',
    fish.type === 'Pike' ? styles.pike : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls} title={FISH_LABEL[fish.type]}>
      <FishIcon type={fish.type} className={styles.glyph} />
      <span className={styles.points}>{fish.points}</span>
      {fish.type === 'Trout' && <span className={styles.shimmer} aria-hidden />}
      {fish.type === 'Pike' && <span className={styles.hazardMark} aria-hidden>!</span>}
    </div>
  )
}
