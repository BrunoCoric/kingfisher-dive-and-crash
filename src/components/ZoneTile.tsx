import type { CalloutKind, OutcomeCallout, RiverZone } from '../game/types'
import { HIDDEN_FISH } from '../game/types'
import { outcomeLabel, primaryZoneCallout, type ZoneAction } from '../lib/stepFeedback'
import { ACTION_LABEL, playerColor, speciesShort } from '../lib/presentation'
import { ActionIcon } from './ActionIcon'
import { FishCard } from './FishCard'
import { FishCardBack } from './FishCardBack'
import { WaterPuddleSvg } from './scene/WaterPuddleSvg'
import styles from './ZoneTile.module.css'

const BADGE_CLASS: Record<CalloutKind, string> = {
  catch: styles.badge_catch,
  crash: styles.badge_crash,
  steal: styles.badge_steal,
  blocked: styles.badge_blocked,
  pike: styles.badge_pike,
}

interface ZoneTileProps {
  zone: RiverZone
  splashed?: boolean
  targetState?: 'legal' | 'illegal' | 'peek' | null
  actions?: ZoneAction[]
  outcomes?: OutcomeCallout[]
  /** End-of-round: animate this zone's fish one step downstream. */
  drifting?: boolean
  /** Last zone — fish washes off the board instead of landing. */
  driftOff?: boolean
  onClick?: () => void
}

export function ZoneTile({
  zone,
  splashed,
  targetState,
  actions = [],
  outcomes = [],
  drifting,
  driftOff,
  onClick,
}: ZoneTileProps) {
  const primaryCallout = primaryZoneCallout(outcomes)
  const primary = primaryCallout?.kind ?? null
  const hasFish = zone.fish !== null
  const cls = [styles.zone]
  if (splashed) cls.push(styles.splashed)
  if (targetState === 'legal') cls.push(styles.legal)
  if (targetState === 'illegal') cls.push(styles.illegal)
  if (targetState === 'peek') cls.push(styles.peek)
  if (primary === 'crash') cls.push(styles.outcomeCrash)
  if (primary === 'catch') cls.push(styles.outcomeCatch)
  if (primary === 'steal') cls.push(styles.outcomeSteal)

  const fishCls = [styles.fishSlot]
  if (drifting && hasFish) {
    fishCls.push(driftOff ? styles.fishDriftOff : styles.fishDrift)
  }

  const interactive = targetState === 'legal' || targetState === 'peek'

  return (
    <div
      className={cls.join(' ')}
      data-zone={zone.id}
      data-state={targetState ?? undefined}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(event) => {
        if (interactive && onClick && (event.key === 'Enter' || event.key === ' ')) onClick()
      }}
      aria-label={`Zone ${zone.id + 1}`}
    >
      <WaterPuddleSvg zoneId={zone.id} className={styles.wash} />
      <span className={styles.grain} aria-hidden />
      <span className={styles.label}>{zone.id + 1}</span>
      <div className={fishCls.join(' ')}>
        {zone.fish === HIDDEN_FISH ? (
          <FishCardBack />
        ) : zone.fish ? (
          <FishCard fish={zone.fish} />
        ) : (
          <span className={styles.emptyRipple} aria-hidden>
            <span />
            <span />
          </span>
        )}
      </div>
      {primaryCallout && (
        <span className={`${styles.outcomeBadge} ${BADGE_CLASS[primaryCallout.kind]}`}>
          {outcomeLabel(primaryCallout.kind)}
          {primaryCallout.points !== undefined && (
            <span className={styles.outcomePts}>+{primaryCallout.points}</span>
          )}
        </span>
      )}
      {actions.length > 0 && (
        <div className={styles.actionChips}>
          {actions.map((a) => {
            const who = speciesShort(Number(a.playerId))
            const action = ACTION_LABEL[a.card]
            return (
              <span
                key={`${a.playerId}-${a.card}`}
                className={styles.actionChip}
                style={{ ['--chip-accent' as string]: playerColor(Number(a.playerId)) }}
                aria-label={`${who} ${action}`}
              >
                <span className={styles.chipGlyph}>
                  <ActionIcon card={a.card} className={styles.chipIcon} />
                </span>
                <span className={styles.chipCopy}>
                  <span className={styles.chipWho}>{who}</span>
                  <span className={styles.chipName}>{action}</span>
                </span>
              </span>
            )
          })}
        </div>
      )}
      {splashed && (
        <span className={styles.dome} aria-hidden>
          <span className={styles.domeCore} />
        </span>
      )}
      {targetState === 'legal' && (
        <span className={styles.sunHalo} aria-hidden />
      )}
      {targetState === 'legal' && (
        <span className={styles.sunBadge} aria-hidden>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4.2" />
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
            </g>
          </svg>
        </span>
      )}
      {targetState === 'peek' && (
        <span className={styles.eyeBadge} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2.5 12.5C5 8.7 8.3 6.8 12 6.8s7 1.9 9.5 5.7c-2.5 3.8-5.8 5.7-9.5 5.7s-7-1.9-9.5-5.7z" />
            <circle cx="12" cy="12.5" r="2.6" fill="currentColor" stroke="none" />
          </svg>
        </span>
      )}
    </div>
  )
}
