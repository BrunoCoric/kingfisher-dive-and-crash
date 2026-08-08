import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { ZoneKind } from '../game/types'
import { ZONE_KIND_BLURB, ZONE_KIND_LABEL, ZONE_KIND_SHORT } from '../game/zones'
import { playSfx } from '../lib/sfx'
import styles from './ZoneKindBadge.module.css'

type SpecialKind = Exclude<ZoneKind, 'open'>

function KindGlyph({ kind }: { kind: SpecialKind }) {
  if (kind === 'clear') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden className={styles.glyph}>
        <circle cx="8" cy="8" r="3.2" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
          <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3" />
        </g>
      </svg>
    )
  }
  if (kind === 'eddy') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden className={styles.glyph}>
        <path
          d="M8 2.2c3.2 0 5.8 2.2 5.8 5 0 2.2-1.6 3.8-3.6 3.8-1.5 0-2.6-1-2.6-2.3 0-1 .7-1.7 1.7-1.7.7 0 1.2.4 1.2 1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
        />
        <circle cx="9.2" cy="8.2" r="1.05" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={styles.glyph}>
      <path
        d="M2.2 5.2h11.6M3.4 8h9.2M4.6 10.8h6.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M11.2 3.6l2.2 1.6-2.2 1.6M11.2 9.2l2.2 1.6-2.2 1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface ZoneKindBadgeProps {
  kind: SpecialKind
}

/** River chip: tap for a short tip on what this special zone does. */
export function ZoneKindBadge({ kind }: ZoneKindBadgeProps) {
  const [open, setOpen] = useState(false)
  const title = ZONE_KIND_LABEL[kind]
  const short = ZONE_KIND_SHORT[kind]
  const blurb = ZONE_KIND_BLURB[kind]

  return (
    <>
      <button
        type="button"
        className={`${styles.chip} ${styles[`chip_${kind}`]}`}
        aria-label={`${title}. Show effect.`}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation()
          playSfx('card_select')
          setOpen(true)
        }}
      >
        <KindGlyph kind={kind} />
        <span className={styles.name}>{short}</span>
      </button>

      {open &&
        createPortal(
          <div
            className={styles.backdrop}
            role="presentation"
            onClick={(event) => {
              event.stopPropagation()
              setOpen(false)
            }}
          >
            <div
              className={`${styles.tip} ${styles[`tip_${kind}`]}`}
              role="dialog"
              aria-labelledby={`zone-kind-${kind}-title`}
              aria-describedby={`zone-kind-${kind}-body`}
              onClick={(event) => event.stopPropagation()}
            >
              <span className={styles.tipMark} aria-hidden>
                <KindGlyph kind={kind} />
              </span>
              <h2 id={`zone-kind-${kind}-title`} className={styles.tipTitle}>
                {title}
              </h2>
              <p id={`zone-kind-${kind}-body`} className={styles.tipBody}>
                {blurb}
              </p>
              <button
                type="button"
                className={styles.gotIt}
                onClick={() => {
                  playSfx('card_select')
                  setOpen(false)
                }}
              >
                Got it
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
