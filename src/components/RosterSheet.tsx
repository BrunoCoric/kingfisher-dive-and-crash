import { useState } from 'react'
import type { CalloutKind, FishCard, GameState, StepSelection } from '../game/types'
import { selectionDetail } from '../lib/stepFeedback'
import { FISH_LABEL, kingfisher, speciesShort } from '../lib/presentation'
import { ActionIcon } from './ActionIcon'
import { FishIcon } from './FishIcon'
import styles from './RosterSheet.module.css'

interface RosterSheetProps {
  G: GameState
  playOrder: string[]
  myID: string
  placing: boolean
  showReveals: boolean
  reactions: Record<string, CalloutKind>
  onClose: () => void
}

export function RosterSheet({
  G,
  playOrder,
  myID,
  placing,
  showReveals,
  reactions,
  onClose,
}: RosterSheetProps) {
  const [openFish, setOpenFish] = useState<string | null>(myID || null)
  const best = Math.max(...playOrder.map((pid) => G.players[pid].score))

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-label="Players and scores"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 className={styles.title}>The flock</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            Close
          </button>
        </header>

        <ul className={styles.list}>
          {playOrder.map((pid) => {
            const p = G.players[pid]
            const k = kingfisher(Number(pid))
            const mine = pid === myID
            const first = pid === G.firstPlayer
            const leading = p.score > 0 && p.score === best
            const ready = placing ? p.perch !== '' : G.locked[pid] ?? false
            const reveal = showReveals ? G.lastReveals[pid] : undefined
            const expanded = openFish === pid
            const rowCls = [styles.row]
            if (mine) rowCls.push(styles.mine)
            if (leading) rowCls.push(styles.leading)

            return (
              <li key={pid} className={rowCls.join(' ')} style={{ ['--row-accent' as string]: k.accent }}>
                <button
                  type="button"
                  className={styles.rowBtn}
                  aria-expanded={expanded}
                  onClick={() => setOpenFish(expanded ? null : pid)}
                >
                  <span className={styles.avRing}>
                    <img className={styles.avatar} src={k.sprite} alt="" />
                    {first && <span className={styles.first} title="First player this round">1st</span>}
                  </span>
                  <span className={styles.meta}>
                    <span className={styles.name}>
                      {mine ? 'You' : speciesShort(Number(pid))}
                      {ready && !reveal && <span className={styles.readyDot} aria-label="Ready" />}
                    </span>
                    <span className={styles.sub}>
                      {p.fishCount} fish · tap for pile
                    </span>
                  </span>
                  <span className={styles.score}>{p.score}</span>
                </button>

                {reveal && (
                  <RevealLine reveal={reveal} outcome={reactions[pid]} />
                )}

                {expanded && (
                  <div className={styles.pile}>
                    {p.scored.length === 0 ? (
                      <span className={styles.empty}>No fish yet</span>
                    ) : (
                      p.scored.map((fish) => <FishChip key={fish.id} fish={fish} />)
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function RevealLine({
  reveal,
  outcome,
}: {
  reveal: StepSelection
  outcome?: CalloutKind
}) {
  const detail = selectionDetail(reveal)
  return (
    <div className={styles.reveal}>
      <span className={styles.revealIcon}>
        <ActionIcon card={reveal.card} className={styles.icon} />
      </span>
      <span>
        {reveal.card}
        {detail ? ` ${detail}` : ''}
        {outcome ? ` · ${outcome}` : ''}
      </span>
    </div>
  )
}

function FishChip({ fish }: { fish: FishCard }) {
  return (
    <span className={`${styles.fish} ${styles[`fish_${fish.type}`] ?? ''}`} title={FISH_LABEL[fish.type]}>
      <FishIcon type={fish.type} className={styles.fishIcon} />
      <span className={styles.fishPts}>{fish.points}</span>
    </span>
  )
}
