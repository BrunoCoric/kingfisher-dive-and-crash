import { useState } from 'react'
import { kingfisher } from './lib/presentation'
import { playSfx, startAmbience } from './lib/sfx'
import { NestPanel } from './components/NestPanel'
import { GameLobby } from './components/GameLobby'
import { CreateGame } from './components/CreateGame'
import { TitleDiorama } from './components/TitleDiorama'
import type { StartConfig } from './startConfig'
import styles from './StartScreen.module.css'

export type { StartConfig }

type View = 'menu' | 'lobby' | 'create'

function cueMenu() {
  playSfx('card_select')
  startAmbience()
}

export function StartScreen({ onStart }: { onStart: (config: StartConfig) => void }) {
  const [view, setView] = useState<View>('menu')
  const [nestOpen, setNestOpen] = useState(false)

  if (view === 'lobby') {
    return (
      <GameLobby
        onCreate={() => setView('create')}
        onBack={() => setView('menu')}
      />
    )
  }

  if (view === 'create') {
    return (
      <CreateGame
        onStart={onStart}
        onBack={() => setView('lobby')}
      />
    )
  }

  return (
    <main className={styles.shell}>
      <div className={styles.stage}>
        <TitleDiorama />
      </div>

      <nav className={styles.menu} aria-label="Main menu">
        <button
          type="button"
          className={styles.plaque}
          onClick={() => {
            cueMenu()
            setView('lobby')
          }}
        >
          <img className={styles.icon} src={kingfisher(0).sprite} alt="" />
          <span className={styles.copy}>
            <span className={styles.label}>Play</span>
            <span className={styles.hint}>Host a river match</span>
          </span>
        </button>
        <button
          type="button"
          className={styles.plaque}
          onClick={() => {
            cueMenu()
            setNestOpen(true)
          }}
        >
          <span className={styles.nestIcon} aria-hidden>
            ✦
          </span>
          <span className={styles.copy}>
            <span className={styles.label}>Nest</span>
            <span className={styles.hint}>Field notes &amp; unlocks</span>
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

      {nestOpen && <NestPanel onClose={() => setNestOpen(false)} />}
    </main>
  )
}
