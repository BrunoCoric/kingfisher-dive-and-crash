import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import { SPECIES_ORDER, SPECIES_POWERS } from '../game/powers'
import type { GameState } from '../game/types'
import { kingfisherById, speciesShortById, spriteScaleStyle } from '../lib/presentation'
import { playSfx } from '../lib/sfx'
import { loadProfile } from '../profile/store'
import { isBirdUnlocked, UNLOCK_META } from '../profile/unlocks'
import type { UnlockId } from '../profile/types'
import surface from './menuSurface.module.css'
import styles from './GatherPanel.module.css'

export function GatherPanel({
  G,
  playOrder,
  myID,
  isActive,
  onSetSpecies,
  onReady,
}: {
  G: GameState
  playOrder: string[]
  myID: string
  isActive: boolean
  onSetSpecies: (id: KingfisherID) => void
  onReady: () => void
}) {
  const profile = loadProfile()
  const mine = (G.speciesBySeat[myID] ?? 'common') as KingfisherID
  const amReady = G.ready[myID] === true
  const you = kingfisherById(mine)
  const power = SPECIES_POWERS[mine]
  const canReady = isActive && !amReady

  return (
    <div className={styles.wrap}>
      <p className={surface.kicker}>Gathering flock</p>
      <h2 className={styles.title}>Pick your bird</h2>
      <p className={styles.lede}>
        {amReady ? 'Waiting for the rest of the bank…' : 'Choose a kingfisher, then Ready up.'}
      </p>

      <div className={styles.portrait} style={{ ['--seat-accent' as string]: you.accent }}>
        <img src={you.sprite} alt="" style={spriteScaleStyle(you.spriteScale)} />
        <div>
          <span className={styles.portraitLabel}>You play as</span>
          <strong>{speciesShortById(mine)}</strong>
          {G.speciesPowers && (
            <p className={styles.powerHint}>
              <em>{power.name}</em> — {power.blurb}
            </p>
          )}
        </div>
      </div>

      {!amReady && (
        <div className={styles.seatRow}>
          {SPECIES_ORDER.map((id) => {
            const k = KINGFISHERS[id]
            const unlocked = isBirdUnlocked(profile, id)
            const active = mine === id
            const hint =
              id === 'common' ? 'Always available' : UNLOCK_META[id as UnlockId].flavor
            return (
              <button
                key={id}
                type="button"
                className={!unlocked ? styles.seatLocked : active ? styles.seatActive : styles.seat}
                style={{ ['--seat-accent' as string]: k.accent }}
                disabled={!unlocked || !canReady}
                title={unlocked ? k.displayName : `Locked — ${hint}`}
                aria-label={unlocked ? k.displayName : `Locked: ${hint}`}
                aria-pressed={active}
                onClick={() => {
                  if (!unlocked || !canReady) return
                  playSfx('card_select')
                  onSetSpecies(id)
                }}
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
      )}

      <ul className={styles.roster} aria-label="Seats">
        {playOrder.map((pid) => {
          const birdId = G.speciesBySeat[pid] ?? 'common'
          const k = kingfisherById(birdId)
          const ready = G.ready[pid] === true
          return (
            <li
              key={pid}
              className={styles.slot}
              style={{ ['--seat-accent' as string]: k.accent }}
            >
              <img src={k.sprite} alt="" style={spriteScaleStyle(k.spriteScale)} />
              <div>
                <strong>{pid === myID ? 'You' : `Seat ${Number(pid) + 1}`}</strong>
                <span>
                  {speciesShortById(birdId)}
                  {ready ? ' · Ready' : ' · Choosing…'}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      {canReady && (
        <button
          type="button"
          className={surface.primary}
          onClick={() => {
            playSfx('card_lock')
            onReady()
          }}
        >
          Ready
        </button>
      )}
    </div>
  )
}
