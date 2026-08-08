import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import { SPECIES_ORDER } from '../game/powers'
import { spriteScaleStyle } from '../lib/presentation'
import { isBirdUnlocked } from '../profile/unlocks'
import type { Profile } from '../profile/types'
import { NestSpeciesSheet } from './NestSpeciesSheet'
import styles from './NestFlock.module.css'

type Filter = 'all' | 'unlocked' | 'locked'

export function NestFlock({
  profile,
  selected,
  onSelect,
  query,
  filter,
}: {
  profile: Profile
  selected: KingfisherID | null
  onSelect: (id: KingfisherID | null) => void
  query: string
  filter: Filter
}) {
  const q = query.trim().toLowerCase()
  const birds = SPECIES_ORDER.filter((id) => {
    const unlocked = isBirdUnlocked(profile, id)
    if (filter === 'unlocked' && !unlocked) return false
    if (filter === 'locked' && unlocked) return false
    if (!q) return true
    const bird = KINGFISHERS[id]
    return (
      bird.displayName.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q)
    )
  })

  const unlockedCount = SPECIES_ORDER.filter((id) => isBirdUnlocked(profile, id)).length
  const showSheet = selected !== null
  const sheetUnlocked = selected ? isBirdUnlocked(profile, selected) : false

  return (
    <div className={showSheet ? styles.splitOpen : styles.split}>
      <div className={showSheet ? styles.gridPaneHidden : styles.gridPane}>
        <p className={styles.progress}>
          {unlockedCount} / {SPECIES_ORDER.length} in the flock
        </p>
        {birds.length === 0 ? (
          <p className={styles.empty}>No birds match that filter.</p>
        ) : (
          <ul className={styles.grid}>
            {birds.map((id) => {
              const bird = KINGFISHERS[id]
              const unlocked = isBirdUnlocked(profile, id)
              const active = selected === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={
                      active
                        ? styles.tileActive
                        : unlocked
                          ? styles.tileOn
                          : styles.tileOff
                    }
                    style={{ ['--bird-accent' as string]: bird.accent }}
                    onClick={() => onSelect(id)}
                    aria-pressed={active}
                    aria-label={`${bird.displayName}${unlocked ? '' : ' (locked)'}`}
                  >
                    <img
                      className={unlocked ? styles.sprite : styles.silhouette}
                      src={bird.sprite}
                      alt=""
                      style={spriteScaleStyle(bird.spriteScale)}
                    />
                    <span className={styles.tileName}>{bird.displayName}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className={showSheet ? styles.sheetPane : styles.sheetPaneIdle}>
        {showSheet && selected ? (
          <NestSpeciesSheet
            id={selected}
            unlocked={sheetUnlocked}
            onBack={() => onSelect(null)}
          />
        ) : (
          <p className={styles.pickHint}>Tap a bird to open its field notes.</p>
        )}
      </div>
    </div>
  )
}
