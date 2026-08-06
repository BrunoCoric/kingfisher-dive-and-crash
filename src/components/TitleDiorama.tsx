import { kingfisher } from '../lib/presentation'
import styles from './TitleDiorama.module.css'

const FLOCK = [1, 2, 0, 3, 4]

/** Compact title flock — brand first, birds as the visual anchor. */
export function TitleDiorama() {
  return (
    <div className={styles.hero}>
      <p className={styles.brand}>Kingfisher</p>
      <p className={styles.tag}>dive &amp; crash</p>

      <div className={styles.flock} aria-hidden>
        <div className={styles.glow} />
        {FLOCK.map((i, n) => {
          const k = kingfisher(i)
          const hero = n === 2
          return (
            <img
              key={k.id}
              className={hero ? styles.heroBird : styles.bird}
              src={k.sprite}
              alt=""
              style={{ ['--delay' as string]: `${n * 0.12}s` }}
            />
          )
        })}
        <div className={styles.ground} />
      </div>
    </div>
  )
}
