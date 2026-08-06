import { useState } from 'react'
import type { CardType } from '../game/types'
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

export function RulesCheatsheet() {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.holder}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="rules-cheatsheet"
        onClick={() => setOpen(true)}
      >
        <span className={styles.q} aria-hidden>
          ?
        </span>
        Rules
      </button>

      {open && (
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

            <p className={styles.foot}>Effects last only for the Step they are played.</p>
          </div>
        </div>
      )}
    </div>
  )
}
