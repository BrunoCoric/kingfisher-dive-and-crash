import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import { SPECIES_POWERS } from '../game/powers'
import { spriteScaleStyle } from '../lib/presentation'
import { loadProfile } from '../profile/store'
import { isBirdUnlocked, STARTER_FLAVOR, UNLOCK_META } from '../profile/unlocks'
import type { UnlockId } from '../profile/types'
import { CARD_TYPES, FISH_TYPES, LOCKED_BIRDS } from '../profile/types'
import styles from './NestPanel.module.css'

const FLOCK: KingfisherID[] = ['common', ...LOCKED_BIRDS]

export function NestPanel({ onClose }: { onClose: () => void }) {
  const profile = loadProfile()
  const { stats, matches } = profile

  return (
    <div className={styles.backdrop} role="dialog" aria-labelledby="nest-title">
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Your nest</p>
            <h2 id="nest-title" className={styles.title}>
              Field notes
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close nest">
            Close
          </button>
        </header>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Flock</h3>
          <ul className={styles.flock}>
            {FLOCK.map((id) => {
              const bird = KINGFISHERS[id]
              const power = SPECIES_POWERS[id]
              const unlocked = isBirdUnlocked(profile, id)
              const mission =
                id === 'common' ? STARTER_FLAVOR : UNLOCK_META[id as UnlockId].flavor
              return (
                <li
                  key={id}
                  className={unlocked ? styles.birdOn : styles.birdOff}
                  style={{ ['--bird-accent' as string]: bird.accent }}
                >
                  <img
                    className={unlocked ? styles.sprite : styles.silhouette}
                    src={bird.sprite}
                    alt=""
                    style={spriteScaleStyle(bird.spriteScale)}
                  />
                  <div className={styles.birdCopy}>
                    <strong>{bird.displayName}</strong>
                    {unlocked ? (
                      <span>
                        {power.name} — {power.blurb}
                      </span>
                    ) : (
                      <span>Unlock: {mission}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Lifetime</h3>
          <div className={styles.statGrid}>
            <div>
              <strong>{stats.matchesPlayed}</strong>
              <span>matches</span>
            </div>
            <div>
              <strong>{stats.wins}</strong>
              <span>wins</span>
            </div>
            <div>
              <strong>{stats.losses}</strong>
              <span>losses</span>
            </div>
            <div>
              <strong>{stats.steals}</strong>
              <span>steals</span>
            </div>
            <div>
              <strong>{stats.crashes}</strong>
              <span>crashes</span>
            </div>
            <div>
              <strong>{stats.blocked}</strong>
              <span>blocked</span>
            </div>
          </div>
          <p className={styles.subRow}>
            Fish kept:{' '}
            {FISH_TYPES.map((t) => `${t} ${stats.fishCaught[t]}`).join(' · ')}
          </p>
          <p className={styles.subRow}>
            Cards:{' '}
            {CARD_TYPES.map((c) => `${c} ${stats.cardsPlayed[c]}`).join(' · ')}
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent matches</h3>
          {matches.length === 0 ? (
            <p className={styles.empty}>Finish a vs-bots match to fill your nest.</p>
          ) : (
            <ul className={styles.matches}>
              {matches.slice(0, 8).map((m, i) => (
                <li key={`${m.at}-${i}`}>
                  <span className={styles.place}>#{m.place}</span>
                  <span>
                    {m.score} pts · {m.players}p
                  </span>
                  <span className={styles.when}>{m.at.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
