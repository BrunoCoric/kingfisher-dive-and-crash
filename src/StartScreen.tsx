import { useState } from 'react'
import { kingfisher } from './lib/presentation'
import { playSfx, startAmbience } from './lib/sfx'
import { Nest } from './components/Nest'
import { GameLobby } from './components/GameLobby'
import { CreateGame } from './components/CreateGame'
import { CreateOnline } from './components/CreateOnline'
import { TitleDiorama } from './components/TitleDiorama'
import type { StartConfig } from './startConfig'
import styles from './StartScreen.module.css'

export type { StartConfig }

type View = 'menu' | 'lobby' | 'createBots' | 'createOnline' | 'nest'

function cueMenu() {
  playSfx('card_select')
  startAmbience()
}

function NestGlyph() {
  return (
    <svg className={styles.nestGlyph} viewBox="0 0 32 32" aria-hidden>
      <ellipse cx="16" cy="22.5" rx="11.5" ry="5.2" fill="#8a5a33" opacity="0.35" />
      <path
        d="M6 20c2-5 6.5-8 10-8s8 3 10 8c-2.2 3.8-6 5.8-10 5.8S8.2 23.8 6 20z"
        fill="#a06838"
      />
      <path
        d="M8.5 19.5c1.8-3.2 4.6-5 7.5-5s5.7 1.8 7.5 5"
        fill="none"
        stroke="#6b4423"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9 22c2.2 1.6 4.5 2.3 7 2.3s4.8-.7 7-2.3"
        fill="none"
        stroke="#5a3818"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <ellipse cx="13.2" cy="16.2" rx="3.1" ry="3.8" fill="#f3e2b0" stroke="#c98f3e" strokeWidth="1" />
      <ellipse cx="19.2" cy="16.6" rx="2.9" ry="3.5" fill="#efe2c2" stroke="#c98f3e" strokeWidth="1" />
    </svg>
  )
}

export function StartScreen({ onStart }: { onStart: (config: StartConfig) => void }) {
  const [view, setView] = useState<View>('menu')

  if (view === 'nest') {
    return <Nest onBack={() => setView('menu')} />
  }

  if (view === 'lobby') {
    return (
      <GameLobby
        onCreateOnline={() => setView('createOnline')}
        onCreateBots={() => setView('createBots')}
        onStart={onStart}
        onBack={() => setView('menu')}
      />
    )
  }

  if (view === 'createOnline') {
    return (
      <CreateOnline
        onStart={onStart}
        onBack={() => setView('lobby')}
      />
    )
  }

  if (view === 'createBots') {
    return (
      <CreateGame
        onStart={onStart}
        onBack={() => setView('lobby')}
      />
    )
  }

  return (
    <main className={styles.shell}>
      <div className={styles.ambience} aria-hidden>
        <div className={styles.reedLeft} />
        <div className={styles.reedRight} />
        <div className={styles.ripples} />
      </div>

      <div className={styles.cluster}>
        <div className={styles.stage}>
          <TitleDiorama />
        </div>

        <nav className={styles.menu} aria-label="Main menu">
          <button
            type="button"
            className={`${styles.plaque} ${styles.plaquePrimary}`}
            onClick={() => {
              cueMenu()
              setView('lobby')
            }}
          >
            <img className={styles.icon} src={kingfisher(0).sprite} alt="" />
            <span className={styles.copy}>
              <span className={styles.label}>Play</span>
              <span className={styles.hint}>Online or vs bots</span>
            </span>
          </button>
          <button
            type="button"
            className={styles.plaque}
            onClick={() => {
              playSfx('nest_open')
              startAmbience()
              setView('nest')
            }}
          >
            <span className={styles.nestIcon} aria-hidden>
              <NestGlyph />
            </span>
            <span className={styles.copy}>
              <span className={styles.label}>Nest</span>
              <span className={styles.hint}>Field guide &amp; unlocks</span>
            </span>
          </button>
          <button
            type="button"
            className={styles.plaque}
            onClick={() => {
              cueMenu()
              onStart({ kind: 'tutorial' })
            }}
          >
            <img className={styles.icon} src={kingfisher(2).sprite} alt="" />
            <span className={styles.copy}>
              <span className={styles.label}>Tutorial</span>
              <span className={styles.hint}>Learn the river</span>
            </span>
          </button>
        </nav>
      </div>
    </main>
  )
}
