import { useState } from 'react'
import { kingfisher, speciesShort } from '../lib/presentation'
import { playSfx } from '../lib/sfx'
import type { StartConfig } from '../startConfig'
import surface from './menuSurface.module.css'
import styles from './CreateGame.module.css'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 5
const DEFAULT_PLAYERS = 4

export function CreateGame({
  onStart,
  onBack,
}: {
  onStart: (config: StartConfig) => void
  onBack: () => void
}) {
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYERS)
  const [birdPref, setBirdPref] = useState(0)
  const bird = Math.min(birdPref, playerCount - 1)
  const botCount = playerCount - 1
  const you = kingfisher(bird)

  const start = () => {
    playSfx('card_select')
    const seats = Array.from({ length: playerCount }, (_, i) => String(i))
    const humanSeat = String(bird)
    onStart({
      kind: 'bots',
      numPlayers: playerCount,
      humanSeat,
      botSeats: seats.filter((id) => id !== humanSeat),
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
            <strong>{speciesShort(bird)}</strong>
          </div>
        </div>

        <div className={styles.field}>
          <span>Your bird</span>
          <div className={styles.seatRow}>
            {Array.from({ length: playerCount }, (_, i) => i).map((i) => {
              const k = kingfisher(i)
              return (
                <button
                  key={i}
                  type="button"
                  className={bird === i ? styles.seatActive : styles.seat}
                  style={{ ['--seat-accent' as string]: k.accent }}
                  onClick={() => {
                    playSfx('card_select')
                    setBirdPref(i)
                  }}
                  aria-pressed={bird === i}
                  aria-label={speciesShort(i)}
                >
                  <img src={k.sprite} alt="" />
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
                <span>{speciesShort(bird)}</span>
              </div>
            </li>
            {Array.from({ length: botCount }, (_, i) => {
              const seat = i < bird ? i : i + 1
              const k = kingfisher(seat)
              return (
                <li key={seat} className={styles.slot} style={{ ['--seat-accent' as string]: k.accent }}>
                  <img src={k.sprite} alt="" />
                  <div>
                    <strong>Bot</strong>
                    <span>{speciesShort(seat)}</span>
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
                setPlayerCount((n) => Math.max(MIN_PLAYERS, n - 1))
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
                setPlayerCount((n) => Math.min(MAX_PLAYERS, n + 1))
              }}
            >
              Add bot
            </button>
          </div>
        </div>

        <button type="button" className={surface.primary} onClick={start}>
          Play
        </button>
      </div>
    </main>
  )
}
