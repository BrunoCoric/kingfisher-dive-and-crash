import { useState } from 'react'
import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import {
  SPECIES_ORDER,
  SPECIES_POWERS,
  fillBotSpecies,
  speciesBySeatFromBots,
} from '../game/powers'
import { kingfisherById, speciesShortById, spriteScaleStyle } from '../lib/presentation'
import { playSfx } from '../lib/sfx'
import { loadProfile } from '../profile/store'
import { isBirdUnlocked, UNLOCK_META } from '../profile/unlocks'
import type { UnlockId } from '../profile/types'
import type { StartConfig } from '../startConfig'
import { clampDeckSize, deckTotalFor, riverZonesFor } from '../game/fish'
import { clampSpecialZones, MIN_SPECIAL_ZONES } from '../game/zones'
import { CreateBotRoster } from './CreateBotRoster'
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
  const [botSpecies, setBotSpecies] = useState<KingfisherID[]>(() =>
    fillBotSpecies(DEFAULT_PLAYERS - 1, 'common'),
  )
  const [editingBot, setEditingBot] = useState<string | null>('1')
  const [speciesPowers, setSpeciesPowers] = useState(true)
  const [specialZones, setSpecialZones] = useState(MIN_SPECIAL_ZONES)

  const seats = Array.from({ length: playerCount }, (_, i) => String(i))
  const speciesBySeat = speciesBySeatFromBots(seats, humanSpecies, botSpecies, HUMAN_SEAT)
  const you = kingfisherById(humanSpecies)
  const yourPower = SPECIES_POWERS[humanSpecies]

  const applyPlayerCount = (n: number) => {
    setPlayerCount(n)
    const zones = riverZonesFor(n)
    setZoneCount(zones)
    setDeckSize(deckTotalFor(n))
    setSpecialZones((s) => clampSpecialZones(s, zones))
    setBotSpecies((prev) => fillBotSpecies(n - 1, humanSpecies, prev))
    setEditingBot((seat) => {
      if (!seat) return seat
      return Number(seat) < n ? seat : n > 1 ? '1' : null
    })
  }

  const applyZoneCount = (n: number) => {
    setZoneCount(n)
    setDeckSize((d) => clampDeckSize(d, n))
    setSpecialZones((s) => clampSpecialZones(s, n))
  }

  const pickHuman = (id: KingfisherID) => {
    if (!isBirdUnlocked(profile, id)) return
    playSfx('card_select')
    setHumanSpecies(id)
    setBotSpecies((prev) => fillBotSpecies(playerCount - 1, id, prev))
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
      specialZones,
      humanSpecies,
      speciesBySeat,
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
        ← Back
      </button>

      <p className={surface.kicker}>Local · vs bots</p>
      <h1 className={surface.title}>Create game</h1>
      <p className={surface.lede}>Pick your bird, assign bot birds, then dive in.</p>

      <div className={surface.panel}>
        <div className={styles.portrait} style={{ ['--seat-accent' as string]: you.accent }}>
          <img src={you.sprite} alt="" style={spriteScaleStyle(you.spriteScale)} />
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
                  onClick={() => pickHuman(id)}
                  aria-pressed={active}
                >
                  <img
                    className={unlocked ? undefined : styles.lockedImg}
                    src={k.sprite}
                    alt=""
                    style={spriteScaleStyle(k.spriteScale)}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.field}>
          <span>Players ({playerCount})</span>
          <CreateBotRoster
            humanSpecies={humanSpecies}
            botSpecies={botSpecies}
            editingSeat={editingBot}
            speciesPowers={speciesPowers}
            onEditSeat={setEditingBot}
            onSetBotSpecies={(index, id) => {
              setBotSpecies((prev) => {
                const next = [...prev]
                next[index] = id
                return next
              })
            }}
          />
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
          specialZones={specialZones}
          onZoneCount={applyZoneCount}
          onDeckSize={(n) => setDeckSize(clampDeckSize(n, zoneCount))}
          onSpecialZones={(n) => setSpecialZones(clampSpecialZones(n, zoneCount))}
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
