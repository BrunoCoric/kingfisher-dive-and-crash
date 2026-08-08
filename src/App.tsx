import { useMemo, useState } from 'react'
import { Client } from 'boardgame.io/react'
import { Local, SocketIO } from 'boardgame.io/multiplayer'
import { Game, setup } from './game/Game'
import { KingfisherBot } from './game/bot'
import { TutorialBot } from './tutorial/TutorialBot'
import { Board } from './Board'
import { TutorialBoard } from './TutorialBoard'
import { TutorialIntro } from './components/TutorialIntro'
import { TUTORIAL_INTRO } from './tutorial/intro'
import { StartScreen, type StartConfig } from './StartScreen'
import { MatchWaiting } from './components/MatchWaiting'
import { LeaveChip } from './components/LeaveChip'
import { startAmbience } from './lib/sfx'
import { gameServerUrl } from './lib/gameServer'
import { clearMatchSession, saveMatchSession, loadMatchSession } from './lib/matchSession'
import { ensureOnlineBots, stopOnlineBots, type OnlineBotSeat } from './lib/onlineBots'
import type { KingfisherID } from './game/kingfishers'
import './styles/global.css'
import './styles/tokens.css'

type BotsMode = {
  kind: 'bots'
  numPlayers: number
  humanSeat: string
  botSeats: string[]
  speciesPowers: boolean
  specialZones: number
  humanSpecies: KingfisherID
  speciesBySeat: Record<string, KingfisherID>
  zoneCount: number
  deckSize: number
}

type OnlineMode = {
  kind: 'online'
  matchID: string
  playerID: string
  credentials: string
  numPlayers: number
  playerName: string
  tableFull: boolean
  bots: OnlineBotSeat[]
}

type Mode = { kind: 'pick' } | { kind: 'tutorial' } | BotsMode | OnlineMode

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
              specialZones: mode.specialZones,
              humanSpecies: mode.humanSpecies,
              speciesBySeat: mode.speciesBySeat,
              zoneCount: mode.zoneCount,
              deckSize: mode.deckSize,
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
      <LeaveChip onLeave={onMenu} />
      <div className="seat">
        <BotsClient key={matchID} matchID={matchID} playerID={mode.humanSeat} onMenu={onMenu} />
      </div>
    </main>
  )
}

function OnlineGame({ mode, onMenu }: { mode: OnlineMode; onMenu: () => void }) {
  const [seated, setSeated] = useState(mode.tableFull)

  const OnlineClient = useMemo(
    () =>
      Client({
        game: Game,
        board: Board,
        numPlayers: mode.numPlayers,
        debug: false,
        multiplayer: SocketIO({ server: gameServerUrl() }),
      }),
    [mode.numPlayers],
  )

  const enterRiver = () => {
    ensureOnlineBots(mode.matchID, mode.numPlayers, mode.bots)
    setSeated(true)
  }

  const leave = () => {
    stopOnlineBots(mode.matchID)
    onMenu()
  }

  if (!seated) {
    return (
      <MatchWaiting
        matchID={mode.matchID}
        playerID={mode.playerID}
        playerName={mode.playerName}
        numPlayers={mode.numPlayers}
        onFull={enterRiver}
        onBack={leave}
      />
    )
  }

  return (
    <main className="app-shell">
      <LeaveChip onLeave={leave} />
      <div className="seat">
        <OnlineClient
          matchID={mode.matchID}
          playerID={mode.playerID}
          credentials={mode.credentials}
          onMenu={leave}
        />
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
      <TutorialIntro
        index={introIndex}
        onMenu={onMenu}
        onBack={() => setIntroIndex((i) => Math.max(0, i - 1))}
        onSkip={() => setPractice(true)}
        onNext={() => {
          if (introIndex >= TUTORIAL_INTRO.length - 1) setPractice(true)
          else setIntroIndex((i) => i + 1)
        }}
      />
    )
  }

  return (
    <main className="app-shell">
      <LeaveChip onLeave={onMenu} />
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
    const session = loadMatchSession()
    if (session) stopOnlineBots(session.matchID)
    clearMatchSession()
    setMode({ kind: 'pick' })
  }

  if (mode.kind === 'pick') {
    return (
      <StartScreen
        onStart={(config: StartConfig) => {
          if (config.kind === 'online') {
            saveMatchSession({
              matchID: config.matchID,
              playerID: config.playerID,
              credentials: config.credentials,
              numPlayers: config.numPlayers,
              playerName: config.playerName,
            })
          }
          setMode(config)
        }}
      />
    )
  }
  if (mode.kind === 'tutorial') {
    return <TutorialGame onMenu={backToMenu} />
  }
  if (mode.kind === 'online') {
    return <OnlineGame mode={mode} onMenu={backToMenu} />
  }
  return <BotsGame mode={mode} onMenu={backToMenu} />
}

export default App
