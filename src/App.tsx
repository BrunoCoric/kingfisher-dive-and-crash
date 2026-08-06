import { useMemo, useState } from 'react'
import { Client } from 'boardgame.io/react'
import { Local } from 'boardgame.io/multiplayer'
import { Game, setup } from './game/Game'
import { KingfisherBot } from './game/bot'
import { TutorialBot } from './tutorial/TutorialBot'
import { Board } from './Board'
import { TutorialBoard } from './TutorialBoard'
import { TutorialIntro } from './components/TutorialIntro'
import { TUTORIAL_INTRO } from './tutorial/intro'
import { StartScreen, type StartConfig } from './StartScreen'
import { startAmbience } from './lib/sfx'
import './styles/global.css'
import './styles/tokens.css'

type BotsMode = {
  kind: 'bots'
  numPlayers: number
  humanSeat: string
  botSeats: string[]
  speciesPowers: boolean
}
type Mode = { kind: 'pick' } | { kind: 'tutorial' } | BotsMode

function BotsGame({ mode, onMenu }: { mode: BotsMode; onMenu: () => void }) {
  const [matchID] = useState(() => crypto.randomUUID())
  const bots = useMemo(() => {
    const map: Record<string, typeof KingfisherBot> = {}
    for (const seat of mode.botSeats) map[seat] = KingfisherBot
    return map
  }, [mode])
  const BotsClient = useMemo(
    () =>
      Client({
        game: {
          ...Game,
          setup: (context) =>
            setup(context, {
              humanSeats: [mode.humanSeat],
              speciesPowers: mode.speciesPowers,
            }),
        },
        board: Board,
        numPlayers: mode.numPlayers,
        debug: false,
        multiplayer: Local({ bots }),
      }),
    [mode],
  )
  return (
    <main className="app-shell">
      <button type="button" className="menu-chip" onClick={onMenu} aria-label="Back to menu">
        Menu
      </button>
      <div className="seat">
        <BotsClient key={matchID} matchID={matchID} playerID={mode.humanSeat} onMenu={onMenu} />
      </div>
    </main>
  )
}

function TutorialGame({ onMenu }: { onMenu: () => void }) {
  const [introIndex, setIntroIndex] = useState(0)
  const [practice, setPractice] = useState(false)
  const [matchID] = useState(() => crypto.randomUUID())
  const TutorialClient = useMemo(
    () =>
      Client({
        game: {
          ...Game,
          setup: (context) => setup(context, { humanSeats: ['0'], tutorial: true }),
        },
        board: TutorialBoard,
        numPlayers: 3,
        debug: false,
        multiplayer: Local({
          bots: {
            '1': TutorialBot,
            '2': TutorialBot,
          },
        }),
      }),
    [],
  )

  if (!practice) {
    return (
      <main className="app-shell">
        <button type="button" className="menu-chip" onClick={onMenu} aria-label="Back to menu">
          Menu
        </button>
        <TutorialIntro
          index={introIndex}
          onBack={() => setIntroIndex((i) => Math.max(0, i - 1))}
          onSkip={() => setPractice(true)}
          onNext={() => {
            if (introIndex >= TUTORIAL_INTRO.length - 1) setPractice(true)
            else setIntroIndex((i) => i + 1)
          }}
        />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <button type="button" className="menu-chip" onClick={onMenu} aria-label="Back to menu">
        Menu
      </button>
      <div className="seat">
        <TutorialClient key={matchID} matchID={matchID} playerID="0" onMenu={onMenu} />
      </div>
    </main>
  )
}

function App() {
  const [mode, setMode] = useState<Mode>({ kind: 'pick' })
  const backToMenu = () => {
    startAmbience()
    setMode({ kind: 'pick' })
  }

  if (mode.kind === 'pick') {
    return <StartScreen onStart={(config: StartConfig) => setMode(config)} />
  }
  if (mode.kind === 'tutorial') {
    return <TutorialGame onMenu={backToMenu} />
  }
  return <BotsGame mode={mode} onMenu={backToMenu} />
}

export default App
