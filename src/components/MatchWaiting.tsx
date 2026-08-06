import { useState } from 'react'
import { LobbyClient } from 'boardgame.io/client'
import type { LobbyAPI } from 'boardgame.io'
import { playSfx } from '../lib/sfx'
import { gameServerUrl, GAME_NAME } from '../lib/gameServer'
import surface from './menuSurface.module.css'
import styles from './MatchWaiting.module.css'

/** Waiting room until every lobby seat has a name; tap Check seats to proceed. */
export function MatchWaiting({
  matchID,
  playerID,
  playerName,
  numPlayers,
  onFull,
  onBack,
}: {
  matchID: string
  playerID: string
  playerName: string
  numPlayers: number
  onFull: () => void
  onBack: () => void
}) {
  const [match, setMatch] = useState<LobbyAPI.Match | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [polling, setPolling] = useState(false)

  const check = async () => {
    setPolling(true)
    setError(null)
    try {
      const lobby = new LobbyClient({ server: gameServerUrl() })
      const m = await lobby.getMatch(GAME_NAME, matchID)
      setMatch(m)
      if (m.players.every((p) => p.name !== undefined)) onFull()
    } catch {
      setError('Could not reach server')
    } finally {
      setPolling(false)
    }
  }

  const copyCode = async () => {
    playSfx('card_select')
    try {
      await navigator.clipboard.writeText(matchID)
      setCopied(true)
    } catch {
      setCopied(false)
    }
    void check()
  }

  const seats =
    match?.players ??
    Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: undefined as string | undefined,
    }))

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
        Leave
      </button>

      <p className={surface.kicker}>Waiting room</p>
      <h1 className={surface.title}>Gathering</h1>
      <p className={surface.lede}>
        You are seat {Number(playerID) + 1} ({playerName}). Share the match code, then check seats
        until the bank is full.
      </p>

      <div className={surface.panel}>
        <div className={styles.codeBox}>
          <code>{matchID}</code>
          <button type="button" className={styles.copy} onClick={() => void copyCode()}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <ul className={styles.seats} aria-label="Seats">
          {seats.map((p) => {
            const id = String(p.id)
            const name = p.name
            return (
              <li key={id} className={name ? styles.filled : styles.open}>
                <strong>Seat {Number(id) + 1}</strong>
                <span>{name?.startsWith('Bot ') ? `${name}` : name ?? 'Open'}</span>
              </li>
            )
          })}
        </ul>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="button"
          className={surface.primary}
          disabled={polling}
          onClick={() => {
            playSfx('card_select')
            void check()
          }}
        >
          {polling ? 'Checking…' : 'Check seats'}
        </button>
      </div>
    </main>
  )
}
