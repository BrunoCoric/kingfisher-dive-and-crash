import { useState } from 'react'
import type { KingfisherID } from '../game/kingfishers'
import { loadProfile } from '../profile/store'
import { CARD_TYPES, FISH_TYPES } from '../profile/types'
import { NestFlock } from './NestFlock'
import surface from './menuSurface.module.css'
import styles from './Nest.module.css'

type Tab = 'flock' | 'lifetime' | 'matches'
type Filter = 'all' | 'unlocked' | 'locked'

export function Nest({ onBack }: { onBack: () => void }) {
  const profile = loadProfile()
  const { stats, matches } = profile
  const [tab, setTab] = useState<Tab>('flock')
  const [selected, setSelected] = useState<KingfisherID | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  return (
    <main className={surface.shell}>
      <button type="button" className={surface.back} onClick={onBack}>
        ← Back
      </button>

      <p className={surface.kicker}>Your nest</p>
      <h1 className={surface.title}>Field notes</h1>
      <p className={surface.lede}>Browse the flock — unlocks gate play, not reading.</p>

      <div className={styles.panel}>
        <div className={styles.tabs} role="tablist" aria-label="Nest sections">
          {(
            [
              ['flock', 'Flock'],
              ['lifetime', 'Lifetime'],
              ['matches', 'Matches'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? styles.tabOn : styles.tab}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'flock' && (
          <div className={styles.flockTools}>
            <div className={styles.filters} role="group" aria-label="Flock filter">
              {(
                [
                  ['all', 'All'],
                  ['unlocked', 'Unlocked'],
                  ['locked', 'Locked'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={filter === id ? styles.chipOn : styles.chip}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className={styles.search}>
              <span className={styles.srOnly}>Search species</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search species…"
                autoComplete="off"
              />
            </label>
            <NestFlock
              profile={profile}
              selected={selected}
              onSelect={setSelected}
              query={query}
              filter={filter}
            />
          </div>
        )}

        {tab === 'lifetime' && (
          <section className={styles.section} aria-label="Lifetime stats">
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
        )}

        {tab === 'matches' && (
          <section className={styles.section} aria-label="Recent matches">
            {matches.length === 0 ? (
              <p className={styles.empty}>Finish a vs-bots match to fill your nest.</p>
            ) : (
              <ul className={styles.matches}>
                {matches.slice(0, 12).map((m, i) => (
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
        )}
      </div>
    </main>
  )
}
