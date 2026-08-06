import { useState } from 'react'
import { kingfisher, speciesShort } from './lib/presentation'
import { startAmbience } from './lib/sfx'
import styles from './StartScreen.module.css'

export type StartConfig =
  | { kind: 'passplay' }
  | { kind: 'tutorial' }
  | { kind: 'bots'; numPlayers: number; humanSeat: string; botSeats: string[] }

export function StartScreen({ onStart }: { onStart: (config: StartConfig) => void }) {
  const [botCount, setBotCount] = useState(3)
  const [seatPref, setSeatPref] = useState(0)
  const seat = Math.min(seatPref, botCount)

  const begin = (config: StartConfig) => {
    startAmbience()
    onStart(config)
  }

  const startBots = () => {
    const seats = Array.from({ length: 1 + botCount }, (_, i) => String(i))
    begin({
      kind: 'bots',
      numPlayers: seats.length,
      humanSeat: String(seat),
      botSeats: seats.filter((id) => id !== String(seat)),
    })
  }

  return (
    <main className={styles.shell}>
      <h1 className={styles.title}>Kingfisher</h1>
      <p className={styles.subtitle}>dive &amp; crash</p>

      <div className={styles.cards}>
        <button className={styles.modeCard} onClick={() => begin({ kind: 'tutorial' })}>
          <span className={styles.modeName}>Tutorial</span>
          <span className={styles.modeDesc}>
            Guided clicks through catch, crash, splash, steal, Hover, and Pike. Opponents play a fixed script.
          </span>
        </button>

        <button className={styles.modeCard} onClick={() => begin({ kind: 'passplay' })}>
          <span className={styles.modeName}>Pass &amp; Play</span>
          <span className={styles.modeDesc}>
            Four seats on one device. Switch seats as pawns are placed, then after each card locks.
          </span>
        </button>

        <div className={styles.modeCard}>
          <button className={styles.modeButton} onClick={startBots}>
            <span className={styles.modeName}>Play vs Bots</span>
            <span className={styles.modeDesc}>
              You keep one seat; the kingfisher bots fill the rest of the river.
            </span>
          </button>
          <div className={styles.options}>
            <label className={styles.field}>
              <span>Bot opponents</span>
              <select value={botCount} onChange={(e) => setBotCount(Number(e.target.value))}>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} ({n + 1} players)
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.field}>
              <span>Your seat</span>
              <div className={styles.seatRow}>
                {Array.from({ length: 1 + botCount }, (_, i) => i).map((i) => {
                  const k = kingfisher(i)
                  return (
                    <button
                      key={i}
                      className={seat === i ? styles.seatActive : styles.seat}
                      style={{ ['--seat-accent' as string]: k.accent }}
                      onClick={() => setSeatPref(i)}
                      aria-pressed={seat === i}
                    >
                      <img src={k.sprite} alt="" />
                      {speciesShort(i)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
