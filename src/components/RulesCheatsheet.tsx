import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { CardType } from '../game/types'
import { SPECIES_POWERS } from '../game/powers'
import { KINGFISHERS } from '../game/kingfishers'
import { CARD_ACCENT } from '../lib/presentation'
import { ActionIcon } from './ActionIcon'
import styles from './RulesCheatsheet.module.css'

const PRIORITY: CardType[] = ['Hover', 'Splash', 'Dive', 'Drop']

interface Row {
  title: string
  body: string
  tone?: 'crash' | 'hazard' | 'steal' | 'ok'
}

const ROWS: Row[] = [
  {
    title: 'Same Splash / Dive / Drop',
    body: 'Crash. Hover never crashes.',
    tone: 'crash',
  },
  {
    title: 'Splash on a zone',
    body: 'Blocks Dives only (fish flees; Dive spent).',
    tone: 'hazard',
  },
  {
    title: 'Solo Dive',
    body: 'Catch. Empty zones are illegal.',
    tone: 'ok',
  },
  {
    title: 'Solo Drop',
    body: 'Steal only if that Dive succeeded. Splash-blocked Dive → nothing.',
    tone: 'steal',
  },
  {
    title: 'Two+ Drops',
    body: 'Crash (whether or not a Dive succeeded).',
    tone: 'crash',
  },
]

interface RulesCheatsheetProps {
  speciesPowers?: boolean
  /** `dock` = compact chip for StatusLine; default floats over the river. */
  variant?: 'float' | 'dock'
}

export function RulesCheatsheet({
  speciesPowers = false,
  variant = 'float',
}: RulesCheatsheetProps) {
  const [open, setOpen] = useState(false)
  const dock = variant === 'dock'

  return (
    <div className={dock ? styles.dock : styles.holder}>
      <button
        type="button"
        className={dock ? styles.toggleDock : styles.toggle}
        aria-expanded={open}
        aria-controls="rules-cheatsheet"
        aria-label="Rules"
        onClick={() => setOpen(true)}
      >
        <span className={dock ? styles.qDock : styles.q} aria-hidden>
          ?
        </span>
        <span className={dock ? styles.dockLabel : undefined}>Rules</span>
      </button>

      {open &&
        createPortal(
          <div className={styles.backdrop} role="presentation" onClick={() => setOpen(false)}>
            <div
              id="rules-cheatsheet"
              className={styles.sheet}
              role="dialog"
              aria-label="Action interactions"
              onClick={(e) => e.stopPropagation()}
            >
              <header className={styles.head}>
                <h2 className={styles.title}>How cards collide</h2>
                <button
                  type="button"
                  className={styles.close}
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  Close
                </button>
              </header>

              <div className={`${styles.row} ${styles.tone_crash} ${styles.crashDef}`}>
                <strong className={styles.rowTitle}>Crash</strong>
                <span className={styles.rowBody}>
                  Played card spent + one random extra hand discard. Fish stays.
                </span>
              </div>

              <p className={styles.priorityLabel}>Resolve order</p>
              <ol className={styles.priority}>
                {PRIORITY.map((card, i) => (
                  <li
                    key={card}
                    className={styles.pill}
                    style={{ ['--pill-accent' as string]: CARD_ACCENT[card] }}
                  >
                    <span className={styles.pillIcon}>
                      <ActionIcon card={card} className={styles.icon} />
                    </span>
                    <span>
                      {i + 1}. {card}
                    </span>
                  </li>
                ))}
              </ol>

              <ul className={styles.list}>
                {ROWS.map((row) => (
                  <li
                    key={row.title}
                    className={`${styles.row} ${row.tone ? styles[`tone_${row.tone}`] : ''}`}
                  >
                    <strong className={styles.rowTitle}>{row.title}</strong>
                    <span className={styles.rowBody}>{row.body}</span>
                  </li>
                ))}
              </ul>

              {speciesPowers && (
                <>
                  <p className={styles.priorityLabel}>Species powers</p>
                  <ul className={styles.list}>
                    {Object.values(KINGFISHERS).map((bird) => {
                      const power = SPECIES_POWERS[bird.id]
                      return (
                        <li key={bird.id} className={styles.row}>
                          <strong className={styles.rowTitle}>
                            {bird.displayName.split(' ')[0]} · {power.name}
                          </strong>
                          <span className={styles.rowBody}>{power.blurb}</span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}

              <p className={styles.foot}>Effects last only for the Step they are played.</p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
