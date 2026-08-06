import type { GameState } from '../game/types'
import { seatKingfisher } from '../lib/presentation'
import styles from './RosterButton.module.css'

interface RosterButtonProps {
  G: GameState
  playOrder: string[]
  myID: string
  placing: boolean
  onOpen: () => void
}

/** Compact flock chip — opens the full score / fish roster. */
export function RosterButton({ G, playOrder, myID, placing, onOpen }: RosterButtonProps) {
  const readyCount = playOrder.filter((pid) =>
    placing ? G.players[pid].perch !== '' : G.locked[pid] === true,
  ).length
  const first = seatKingfisher(G, G.firstPlayer)
  const shown = playOrder.slice(0, 4)

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={onOpen}
      aria-label={`Open scores. Fish deck ${G.deckCount} left. ${readyCount} of ${playOrder.length} ready. First player marked.`}
    >
      <span className={styles.deck} title="Fish cards left in the deck" aria-hidden>
        <span className={styles.deckStack} />
        <span className={styles.deckCount}>{G.deckCount}</span>
      </span>
      <span className={styles.flock} aria-hidden>
        {shown.map((pid, i) => {
          const k = seatKingfisher(G, pid)
          return (
            <span
              key={pid}
              className={`${styles.face} ${pid === myID ? styles.mine : ''}`}
              style={{
                ['--face-accent' as string]: k.accent,
                zIndex: shown.length - i,
              }}
            >
              <img src={k.sprite} alt="" />
            </span>
          )
        })}
      </span>
      <span className={styles.copy}>
        <span className={styles.label}>Scores</span>
        <span className={styles.sub}>
          <span className={styles.firstMark} style={{ ['--face-accent' as string]: first.accent }}>
            1st
          </span>
          {readyCount}/{playOrder.length}
        </span>
      </span>
    </button>
  )
}
