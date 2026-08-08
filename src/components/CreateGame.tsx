import { useState } from 'react'
import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import { SPECIES_ORDER, SPECIES_POWERS, buildSpeciesBySeat } from '../game/powers'
import { kingfisherById, speciesShortById } from '../lib/presentation'
import { playSfx } from '../lib/sfx'
import { loadProfile } from '../profile/store'
import { isBirdUnlocked, UNLOCK_META } from '../profile/unlocks'
import type { UnlockId } from '../profile/types'
import type { StartConfig } from '../startConfig'
import { clampDeckSize, deckTotalFor, riverZonesFor } from '../game/fish'
import { RiverOptions } from './RiverOptions'
import surface from './menuSurface.module.css'
import styles from './CreateGame.module.css'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 5
const DEFAULT_PLAYERS = 4
const HUMAN_SEAT = '0'

export function CreateGame({
  onStart,
  onBack,
}: {
  onStart: (config: StartConfig) => void
  onBack: () => void
}) {
  const profile = loadProfile()
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYERS)
  const [zoneCount, setZoneCount] = useState(() => riverZonesFor(DEFAULT_PLAYERS))
  const [deckSize, setDeckSize] = useState(() => deckTotalFor(DEFAULT_PLAYERS))
  const [humanSpecies, setHumanSpecies] = useState<KingfisherID>('common')
  const [speciesPowers, setSpeciesPowers] = useState(true)

  const seats = Array.from({ length: playerCount }, (_, i) => String(i))
  const speciesBySeat = buildSpeciesBySeat(seats, humanSpecies, HUMAN_SEAT)
  const you = kingfisherById(humanSpecies)
  const yourPower = SPECIES_POWERS[humanSpecies]

  const applyPlayerCount = (n: number) => {
    setPlayerCount(n)
    setZoneCount(riverZonesFor(n))
    setDeckSize(deckTotalFor(n))
  }

  const applyZoneCount = (n: number) => {
    setZoneCount(n)
    setDeckSize((d) => clampDeckSize(d, n))
  }

  const start = () => {
    if (!isBirdUnlocked(profile, humanSpecies)) return
    playSfx('card_select')
    onStart({
      kind: 'bots',
      numPlayers: playerCount,
      humanSeat: HUMAN_SEAT,
      botSeats: seats.filter((id) => id !== HUMAN_SEAT),
      speciesPowers,
      humanSpecies,
      zoneCount,
      deckSize,
    })
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

      <p className={surface.kicker}>Local · vs bots</p>
      <h1 className={surface.title}>Create game</h1>
      <p className={surface.lede}>Pick your bird, fill the bank with bots, then dive in.</p>

      <div className={surface.panel}>
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
                id === 'common'
                  ? 'Always available'
                  : UNLOCK_META[id as UnlockId].flavor
              return (
                <button
                  key={id}
                  type="button"
                  className={
                    !unlocked
                      ? styles.seatLocked
                      : active
                        ? styles.seatActive
                        : styles.seat
                  }
                  style={{ ['--seat-accent' as string]: k.accent }}
                  disabled={!unlocked}
                  title={unlocked ? k.displayName : `Locked — ${hint}`}
                  aria-label={unlocked ? k.displayName : `Locked: ${hint}`}
                  onClick={() => {
                    if (!unlocked) return
                    playSfx('card_select')
                    setHumanSpecies(id)
                  }}
                  aria-pressed={active}
                >
                  <img
                    className={unlocked ? undefined : styles.lockedImg}
                    src={k.sprite}
                    alt=""
                  />
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
            {seats
              .filter((id) => id !== HUMAN_SEAT)
              .map((seat) => {
                const birdId = speciesBySeat[seat]
                const k = kingfisherById(birdId)
                const power = SPECIES_POWERS[birdId]
                return (
                  <li key={seat} className={styles.slot} style={{ ['--seat-accent' as string]: k.accent }}>
                    <img src={k.sprite} alt="" />
                    <div>
                      <strong>Bot</strong>
                      <span>
                        {speciesShortById(birdId)}
                        {speciesPowers ? ` · ${power.name}` : ''}
                      </span>
                    </div>
                  </li>
                )
              })}
          </ul>
          <div className={styles.slotActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={playerCount <= MIN_PLAYERS}
              onClick={() => {
                playSfx('card_select')
                applyPlayerCount(Math.max(MIN_PLAYERS, playerCount - 1))
              }}
            >
              Remove bot
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={playerCount >= MAX_PLAYERS}
              onClick={() => {
                playSfx('card_select')
                applyPlayerCount(Math.min(MAX_PLAYERS, playerCount + 1))
              }}
            >
              Add bot
            </button>
          </div>
        </div>

        <RiverOptions
          playerCount={playerCount}
          zoneCount={zoneCount}
          deckSize={deckSize}
          onZoneCount={applyZoneCount}
          onDeckSize={(n) => setDeckSize(clampDeckSize(n, zoneCount))}
        />

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={speciesPowers}
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

        <button type="button" className={surface.primary} onClick={start}>
          Play
        </button>
      </div>
    </main>
  )
}
