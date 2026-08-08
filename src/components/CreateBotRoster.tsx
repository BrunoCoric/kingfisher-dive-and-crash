import { KINGFISHERS, type KingfisherID } from '../game/kingfishers'
import { SPECIES_ORDER, SPECIES_POWERS } from '../game/powers'
import { kingfisherById, speciesShortById, spriteScaleStyle } from '../lib/presentation'
import { playSfx } from '../lib/sfx'
import styles from './CreateGame.module.css'

interface CreateBotRosterProps {
  humanSpecies: KingfisherID
  botSpecies: KingfisherID[]
  editingSeat: string | null
  speciesPowers: boolean
  onEditSeat: (seat: string | null) => void
  onSetBotSpecies: (seatIndex: number, id: KingfisherID) => void
}

/** Player list with per-bot bird pickers (vs-bots Create game). */
export function CreateBotRoster({
  humanSpecies,
  botSpecies,
  editingSeat,
  speciesPowers,
  onEditSeat,
  onSetBotSpecies,
}: CreateBotRosterProps) {
  const you = kingfisherById(humanSpecies)
  const yourPower = SPECIES_POWERS[humanSpecies]

  return (
    <ul className={styles.slots}>
      <li className={styles.slot} style={{ ['--seat-accent' as string]: you.accent }}>
        <img src={you.sprite} alt="" style={spriteScaleStyle(you.spriteScale)} />
        <div>
          <strong>You</strong>
          <span>
            {speciesShortById(humanSpecies)}
            {speciesPowers ? ` · ${yourPower.name}` : ''}
          </span>
        </div>
      </li>
      {botSpecies.map((birdId, i) => {
        const seat = String(i + 1)
        const k = kingfisherById(birdId)
        const power = SPECIES_POWERS[birdId]
        const open = editingSeat === seat
        const blocked = new Set<KingfisherID>([humanSpecies, ...botSpecies.filter((_, j) => j !== i)])
        return (
          <li key={seat} className={styles.botBlock}>
            <button
              type="button"
              className={open ? styles.slotEdit : styles.slotBtn}
              style={{ ['--seat-accent' as string]: k.accent }}
              aria-expanded={open}
              aria-label={`Bot ${i + 1}: ${k.displayName}. ${open ? 'Hide' : 'Change'} bird`}
              onClick={() => {
                playSfx('card_select')
                onEditSeat(open ? null : seat)
              }}
            >
              <img src={k.sprite} alt="" style={spriteScaleStyle(k.spriteScale)} />
              <div>
                <strong>Bot {i + 1}</strong>
                <span>
                  {speciesShortById(birdId)}
                  {speciesPowers ? ` · ${power.name}` : ''}
                  {open ? '' : ' · tap to change'}
                </span>
              </div>
            </button>
            {open && (
              <div className={styles.botPicker} role="group" aria-label={`Bird for bot ${i + 1}`}>
                {SPECIES_ORDER.map((id) => {
                  const bird = KINGFISHERS[id]
                  const active = birdId === id
                  const taken = blocked.has(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={
                        taken && !active
                          ? styles.seatTaken
                          : active
                            ? styles.seatActive
                            : styles.seat
                      }
                      style={{ ['--seat-accent' as string]: bird.accent }}
                      disabled={taken && !active}
                      title={
                        taken && !active
                          ? `${bird.displayName} — already seated`
                          : bird.displayName
                      }
                      aria-label={bird.displayName}
                      aria-pressed={active}
                      onClick={() => {
                        if (taken && !active) return
                        playSfx('card_select')
                        onSetBotSpecies(i, id)
                      }}
                    >
                      <img
                        src={bird.sprite}
                        alt=""
                        style={spriteScaleStyle(bird.spriteScale)}
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
