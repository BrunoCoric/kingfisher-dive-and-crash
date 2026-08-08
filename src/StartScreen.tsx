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
            ✦
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

    </main>
  )
}
