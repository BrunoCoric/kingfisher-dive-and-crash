import { FishIcon } from './FishIcon'
import styles from './FishCardBack.module.css'

export function FishCardBack() {
  return (
    <div className={styles.card} title="Face-down fish" aria-hidden>
      <FishIcon type="Minnow" className={styles.watermark} />
      <span className={styles.question}>?</span>
    </div>
  )
}
