import { useState } from 'react'
import { LobbyClient } from 'boardgame.io/client'
import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import { SPECIES_ORDER, SPECIES_POWERS, buildSpeciesBySeat } from '../game/powers'
import { kingfisherById, speciesShortById } from '../lib/presentation'
import { playSfx } from '../lib/sfx'
import { loadProfile } from '../profile/store'
import { isBirdUnlocked, UNLOCK_META } from '../profile/unlocks'
import type { UnlockId } from '../profile/types'
import { gameServerUrl, GAME_NAME } from '../lib/gameServer'
import type { OnlineBotSeat } from '../lib/onlineBots'
import { ensureOnlineBots } from '../lib/onlineBots'
import type { StartConfig } from '../startConfig'
import surface from './menuSurface.module.css'
import styles from './CreateGame.module.css'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 5
const DEFAULT_EXTRAS = 3
const HUMAN_SEAT = '0'

type SeatKind = 'bot' | 'open'

export function CreateOnline({
  onStart,
  onBack,
}: {
  onStart: (config: StartConfig) => void
  onBack: () => void
}) {
  const profile = loadProfile()
  const [extras, setExtras] = useState<SeatKind[]>(() =>
    Array.from({ length: DEFAULT_EXTRAS }, () => 'bot' as SeatKind),
  )
  const [humanSpecies, setHumanSpecies] = useState<KingfisherID>('common')
  const [speciesPowers, setSpeciesPowers] = useState(true)
  const [playerName, setPlayerName] = useState('Host')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playerCount = 1 + extras.length
  const seats = Array.from({ length: playerCount }, (_, i) => String(i))
  const speciesBySeat = buildSpeciesBySeat(seats, humanSpecies, HUMAN_SEAT)
  const you = kingfisherById(humanSpecies)
  const yourPower = SPECIES_POWERS[humanSpecies]
  const botSeats = extras
    .map((kind, i) => (kind === 'bot' ? String(i + 1) : null))
    .filter((id): id is string => id !== null)
  const openSeats = extras
    .map((kind, i) => (kind === 'open' ? String(i + 1) : null))
    .filter((id): id is string => id !== null)
  const humanSeats = [HUMAN_SEAT, ...openSeats]

  const create = async () => {
    if (busy || !isBirdUnlocked(profile, humanSpecies)) return
    setBusy(true)
    setError(null)
    playSfx('card_select')
    try {
      const lobby = new LobbyClient({ server: gameServerUrl() })
      const { matchID } = await lobby.createMatch(GAME_NAME, {
        numPlayers: playerCount,
        setupData: {
          online: true,
          humanSeats,
          speciesPowers,
          humanSpecies,
        },
      })
      const host = await lobby.joinMatch(GAME_NAME, matchID, {
        playerID: HUMAN_SEAT,
        playerName: playerName.trim() || 'Host',
      })
      const bots: OnlineBotSeat[] = []
      for (const seat of botSeats) {
        const joined = await lobby.joinMatch(GAME_NAME, matchID, {
          playerID: seat,
          playerName: `Bot ${Number(seat) + 1}`,
        })
        bots.push({ playerID: joined.playerID, credentials: joined.playerCredentials })
      }
      // Start bots immediately so they Ready in gather while open seats fill.
      ensureOnlineBots(matchID, playerCount, bots)
      onStart({
        kind: 'online',
        matchID,
        playerID: host.playerID,
        credentials: host.playerCredentials,
        numPlayers: playerCount,
        playerName: playerName.trim() || 'Host',
        tableFull: openSeats.length === 0,
        bots,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not create match'
      setError(
        msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? 'Server unreachable — run npm run server'
          : msg,
      )
      setBusy(false)
    }
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
        Back
      </button>

      <p className={surface.kicker}>Online · humans &amp; bots</p>
      <h1 className={surface.title}>Create table</h1>
      <p className={surface.lede}>
        Pick your bird, fill seats with bots or leave them open for friends.
      </p>

      <div className={surface.panel}>
        <label className={styles.field}>
          <span>Your name</span>
          <input
            className={styles.nameInput}
            value={playerName}
            maxLength={24}
            disabled={busy}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </label>

        <div className={styles.portrait} style={{ ['--seat-accent' as string]: you.accent }}>
          <img src={you.sprite} alt="" />
          <div>
            <span className={styles.portraitLabel}>You play as</span>
            <strong>{speciesShortById(humanSpecies)}</strong>
            {speciesPowers && (
              <p className={styles.powerHint}>
                <em>{yourPower.name}</em> — {yourPower.blurb}
              </p>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <span>Your bird</span>
          <div className={styles.seatRow}>
            {SPECIES_ORDER.map((id) => {
              const k = KINGFISHERS[id]
              const unlocked = isBirdUnlocked(profile, id)
              const active = humanSpecies === id
              const hint =
                id === 'common' ? 'Always available' : UNLOCK_META[id as UnlockId].flavor
              return (
                <button
                  key={id}
                  type="button"
                  className={
                    !unlocked ? styles.seatLocked : active ? styles.seatActive : styles.seat
                  }
                  style={{ ['--seat-accent' as string]: k.accent }}
                  disabled={!unlocked || busy}
                  title={unlocked ? k.displayName : `Locked — ${hint}`}
                  aria-label={unlocked ? k.displayName : `Locked: ${hint}`}
                  aria-pressed={active}
                  onClick={() => {
                    if (!unlocked) return
                    playSfx('card_select')
                    setHumanSpecies(id)
                  }}
                >
                  <img className={unlocked ? undefined : styles.lockedImg} src={k.sprite} alt="" />
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.field}>
          <span>Players ({playerCount})</span>
          <ul className={styles.slots}>
            <li className={styles.slot} style={{ ['--seat-accent' as string]: you.accent }}>
              <img src={you.sprite} alt="" />
              <div>
                <strong>You</strong>
                <span>
                  {speciesShortById(humanSpecies)}
                  {speciesPowers ? ` · ${yourPower.name}` : ''}
                </span>
              </div>
            </li>
            {extras.map((kind, i) => {
              const seat = String(i + 1)
              const birdId = speciesBySeat[seat]
              const k = kingfisherById(birdId)
              const power = SPECIES_POWERS[birdId]
              return (
                <li key={seat} className={styles.slot} style={{ ['--seat-accent' as string]: k.accent }}>
                  <img src={k.sprite} alt="" />
                  <div>
                    <strong>{kind === 'bot' ? 'Bot' : 'Open'}</strong>
                    <span>
                      {kind === 'bot'
                        ? `${speciesShortById(birdId)}${speciesPowers ? ` · ${power.name}` : ''}`
                        : 'Waiting for a player'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.seatToggle}
                    disabled={busy}
                    onClick={() => {
                      playSfx('card_select')
                      setExtras((prev) =>
                        prev.map((k, idx) =>
                          idx === i ? (k === 'bot' ? 'open' : 'bot') : k,
                        ),
                      )
                    }}
                  >
                    {kind === 'bot' ? 'Make open' : 'Make bot'}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className={styles.slotActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={playerCount <= MIN_PLAYERS || busy}
              onClick={() => {
                playSfx('card_select')
                setExtras((prev) => prev.slice(0, -1))
              }}
            >
              Remove
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={playerCount >= MAX_PLAYERS || busy}
              onClick={() => {
                playSfx('card_select')
                setExtras((prev) => [...prev, 'bot'])
              }}
            >
              Add bot
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={playerCount >= MAX_PLAYERS || busy}
              onClick={() => {
                playSfx('card_select')
                setExtras((prev) => [...prev, 'open'])
              }}
            >
              Add open
            </button>
          </div>
        </div>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={speciesPowers}
            disabled={busy}
            onChange={(e) => {
              playSfx('card_select')
              setSpeciesPowers(e.target.checked)
            }}
          />
          <span>
            <strong>Species powers</strong>
            Soft passives per bird. Same cards & crash rules either way.
          </span>
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="button" className={surface.primary} disabled={busy} onClick={() => void create()}>
          {busy ? 'Opening…' : openSeats.length === 0 ? 'Play' : 'Open table'}
        </button>
      </div>
    </main>
  )
}
