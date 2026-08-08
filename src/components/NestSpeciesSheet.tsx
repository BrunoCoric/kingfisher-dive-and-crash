import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import { SPECIES_POWERS } from '../game/powers'
import { fieldNoteFor } from '../content/fieldNotes'
import { spriteScaleStyle } from '../lib/presentation'
import { STARTER_FLAVOR, UNLOCK_META } from '../profile/unlocks'
import type { UnlockId } from '../profile/types'
import styles from './NestSpeciesSheet.module.css'

export function NestSpeciesSheet({
  id,
  unlocked,
  onBack,
}: {
  id: KingfisherID
  unlocked: boolean
  /** Narrow layouts: return to the flock grid. */
  onBack?: () => void
}) {
  const bird = KINGFISHERS[id]
  const note = fieldNoteFor(id)
  const power = SPECIES_POWERS[id]
  const mission = id === 'common' ? STARTER_FLAVOR : UNLOCK_META[id as UnlockId].flavor

  return (
    <article
      className={styles.sheet}
      style={{ ['--bird-accent' as string]: bird.accent }}
      aria-labelledby={`species-${id}-title`}
    >
      {onBack && (
        <button type="button" className={styles.mobileBack} onClick={onBack}>
          ← Flock
        </button>
      )}

      <header className={styles.hero}>
        <img
          className={unlocked ? styles.portrait : styles.silhouette}
          src={bird.sprite}
          alt=""
          style={spriteScaleStyle(bird.spriteScale)}
        />
        <div className={styles.identity}>
          <p className={styles.latin}>{note.scientificName}</p>
          <h3 id={`species-${id}-title`} className={styles.name}>
            {bird.displayName}
          </h3>
          <p className={unlocked ? styles.badgeOn : styles.badgeOff}>
            {unlocked ? 'In your flock' : 'Locked — still readable'}
          </p>
        </div>
      </header>

      <dl className={styles.meta}>
        <div>
          <dt>Range</dt>
          <dd>{note.region}</dd>
        </div>
        <div>
          <dt>Habitat</dt>
          <dd>{note.habitat}</dd>
        </div>
      </dl>

      <section className={styles.block}>
        <h4 className={styles.blockTitle}>Field notes</h4>
        <ul className={styles.trivia}>
          {note.trivia.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h4 className={styles.blockTitle}>On the river</h4>
        <p className={styles.power}>
          <strong>{power.name}</strong> — {power.blurb}
        </p>
        <p className={styles.mission}>
          {unlocked ? 'Unlocked.' : `Unlock: ${mission}`}
        </p>
      </section>
    </article>
  )
}
