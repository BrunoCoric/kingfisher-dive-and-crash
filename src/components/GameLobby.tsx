import { useState } from 'react'
import { LobbyClient } from 'boardgame.io/client'
import type { LobbyAPI } from 'boardgame.io'
import { playSfx } from '../lib/sfx'
import { kingfisher } from '../lib/presentation'
import { gameServerUrl, GAME_NAME } from '../lib/gameServer'
import type { StartConfig } from '../startConfig'
import surface from './menuSurface.module.css'
import createStyles from './CreateGame.module.css'
import styles from './GameLobby.module.css'

type MatchListItem = LobbyAPI.Match

function openSeats(match: MatchListItem): string[] {
  return match.players
    .filter((p) => p.name === undefined)
    .map((p) => String(p.id))
}

function filledCount(match: MatchListItem): number {
  return match.players.filter((p) => p.name !== undefined).length
}

export function GameLobby({
  onCreateOnline,
  onCreateBots,
  onStart,
  onBack,
}: {
  onCreateOnline: () => void
  onCreateBots: () => void
  onStart: (config: StartConfig) => void
  onBack: () => void
}) {
  const deco = kingfisher(0)
  const [matches, setMatches] = useState<MatchListItem[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [joining, setJoining] = useState<string | null>(null)
  const [joinMatch, setJoinMatch] = useState<MatchListItem | null>(null)
  const [playerName, setPlayerName] = useState('Player')
  const [seatID, setSeatID] = useState('1')
  const [joinError, setJoinError] = useState<string | null>(null)

  const refresh = async () => {
    playSfx('card_select')
    setListError(null)
    try {
      const lobby = new LobbyClient({ server: gameServerUrl() })
      const { matches: listed } = await lobby.listMatches(GAME_NAME)
      const open = listed.filter((m) => openSeats(m).length > 0)
      setMatches(open)
    } catch {
      setMatches([])
      setListError('Server unreachable — run npm run server')
    }
  }

  const beginJoin = (match: MatchListItem) => {
    playSfx('card_select')
    const open = openSeats(match)
    setJoinMatch(match)
    setSeatID(open[0] ?? '0')
    setJoinError(null)
  }

  const confirmJoin = async () => {
    if (!joinMatch || joining) return
    setJoining(joinMatch.matchID)
    setJoinError(null)
    playSfx('card_select')
    try {
      const lobby = new LobbyClient({ server: gameServerUrl() })
      const { playerID, playerCredentials } = await lobby.joinMatch(GAME_NAME, joinMatch.matchID, {
        playerID: seatID,
        playerName: playerName.trim() || 'Player',
      })
      const latest = await lobby.getMatch(GAME_NAME, joinMatch.matchID)
      const tableFull = latest.players.every((p) => p.name !== undefined)
      onStart({
        kind: 'online',
        matchID: joinMatch.matchID,
        playerID,
        credentials: playerCredentials,
        numPlayers: joinMatch.players.length,
        playerName: playerName.trim() || 'Player',
        tableFull,
        bots: [],
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not join'
      setJoinError(msg)
      setJoining(null)
    }
  }

  if (joinMatch) {
    const open = openSeats(joinMatch)
    return (
      <main className={surface.shell}>
        <button
          type="button"
          className={surface.back}
          onClick={() => {
            playSfx('card_select')
            setJoinMatch(null)
            setJoining(null)
          }}
        >
          ← Back
        </button>
        <p className={surface.kicker}>Join table</p>
        <h1 className={surface.title}>Take a seat</h1>
        <p className={surface.lede}>
          Match <code className={styles.code}>{joinMatch.matchID}</code>
        </p>
        <div className={surface.panel}>
          <label className={createStyles.field}>
            <span>Your name</span>
            <input
              className={createStyles.nameInput}
              value={playerName}
              maxLength={24}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </label>
          <div className={createStyles.field}>
            <span>Seat</span>
            <div className={styles.seatPick}>
              {open.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={seatID === id ? styles.seatActive : styles.seatBtn}
                  onClick={() => {
                    playSfx('card_select')
                    setSeatID(id)
                  }}
                >
                  {Number(id) + 1}
                </button>
              ))}
            </div>
          </div>
          {joinError && <p className={createStyles.error}>{joinError}</p>}
          <button
            type="button"
            className={surface.primary}
            disabled={joining !== null || open.length === 0}
            onClick={() => void confirmJoin()}
          >
            {joining ? 'Joining…' : 'Join'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className={surface.shell}>
      <button
        type="button"
        className={surface.back}
        onClick={() => {
          playSfx('card_select')
          onBack()
        }}
      >
        ← Back
      </button>

      <img className={styles.deco} src={deco.sprite} alt="" aria-hidden />
      <p className={surface.kicker}>River lobby</p>
      <h1 className={surface.title}>Games</h1>
      <p className={surface.lede}>Open an online table, or practice vs bots.</p>

      <div className={surface.panel}>
        <div className={styles.listHead}>
          <span>Open tables</span>
          <button type="button" className={styles.refresh} onClick={() => void refresh()}>
            Refresh
          </button>
        </div>
        <ul className={styles.list} aria-label="Available games">
          {matches === null && (
            <li className={styles.empty}>
              <span className={styles.emptyMark} aria-hidden>
                ~
              </span>
              Tap Refresh to look for tables.
            </li>
          )}
          {matches !== null && matches.length === 0 && (
            <li className={styles.empty}>
              <span className={styles.emptyMark} aria-hidden>
                ~
              </span>
              {listError ?? 'No open tables — host one yourself.'}
            </li>
          )}
          {matches?.map((m) => {
            const filled = filledCount(m)
            const total = m.players.length
            return (
              <li key={m.matchID}>
                <button type="button" className={styles.matchRow} onClick={() => beginJoin(m)}>
                  <strong>
                    {filled}/{total} seated
                  </strong>
                  <span className={styles.matchId}>{m.matchID.slice(0, 8)}…</span>
                </button>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          className={surface.primary}
          onClick={() => {
            playSfx('card_select')
            onCreateOnline()
          }}
        >
          Create online
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => {
            playSfx('card_select')
            onCreateBots()
          }}
        >
          Play vs bots
        </button>
      </div>
    </main>
  )
}
