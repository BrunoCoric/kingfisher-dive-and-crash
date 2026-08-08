import { useState } from 'react'
import { playSfx } from '../lib/sfx'
import styles from './LeaveChip.module.css'

/** In-match exit chip — asks before abandoning the river. */
export function LeaveChip({ onLeave }: { onLeave: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={styles.chip}
        aria-label="Leave game"
        onClick={() => {
          playSfx('card_select')
          setOpen(true)
        }}
      >
        Leave
      </button>

      {open && (
        <div
          className={styles.backdrop}
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-labelledby="leave-title"
            aria-describedby="leave-body"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="leave-title" className={styles.title}>
              Leave the river?
            </h2>
            <p id="leave-body" className={styles.body}>
              This match ends for you. Progress here is lost.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.stay}
                onClick={() => {
                  playSfx('card_select')
                  setOpen(false)
                }}
              >
                Stay
              </button>
              <button
                type="button"
                className={styles.leave}
                onClick={() => {
                  playSfx('card_select')
                  onLeave()
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
