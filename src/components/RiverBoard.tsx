import type { CalloutKind, OutcomeCallout, Perch as PerchType, RiverZone } from '../game/types'
import type { ZoneAction } from '../lib/stepFeedback'
import { Perch } from './Perch'
import { ZoneTile } from './ZoneTile'
import { BankFoliageSvg } from './scene/BankFoliageSvg'
import styles from './RiverBoard.module.css'

export interface PerchOccupant {
  id: string
  color: string
  isFirst: boolean
  sprite: string
  facing: 'left' | 'right'
  reaction?: CalloutKind
  /** Changes each resolved step so CSS reaction animations replay. */
  feedbackKey?: string
}

interface RiverBoardProps {
  zones: RiverZone[]
  perches: PerchType[]
  splashes: number[]
  occupants: Record<string, PerchOccupant>
  movablePerches: string[]
  targetStates: Record<number, 'legal' | 'illegal' | 'peek' | null>
  zoneActions?: Record<number, ZoneAction[]>
  zoneOutcomes?: Record<number, OutcomeCallout[]>
  /** Play the end-of-round fish-drift motion before state updates. */
  drifting?: boolean
  onDriftEnd?: () => void
  onZoneClick: (id: number) => void
  onPerchClick: (id: string) => void
}

export function RiverBoard({
  zones,
  perches,
  splashes,
  occupants,
  movablePerches,
  targetStates,
  zoneActions = {},
  zoneOutcomes = {},
  drifting = false,
  onDriftEnd,
  onZoneClick,
  onPerchClick,
}: RiverBoardProps) {
  const zoneCount = zones.length
  const lastZone = zoneCount - 1

  return (
    <div className={styles.frame}>
      <div className={`${styles.board} ${drifting ? styles.boardDrifting : ''}`}>
        <span className={styles.spine} aria-hidden />
        <span className={styles.spineSheen} aria-hidden />
        <span className={styles.grain} aria-hidden />
        {drifting && (
          <span
            className={styles.driftBeat}
            aria-hidden
            onAnimationEnd={onDriftEnd}
          />
        )}
        <span className={styles.flowHint} title="Downstream is down the board" aria-label="Flow: downstream is down">
          <svg viewBox="0 0 24 24" aria-hidden className={styles.flowArrow}>
            <path
              d="M12 4v12.2M7.5 12.5 12 17l4.5-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className={`${styles.foliage} ${styles.foliageTL}`} aria-hidden>
          <BankFoliageSvg corner="tl" />
        </span>
        <span className={`${styles.foliage} ${styles.foliageTR}`} aria-hidden>
          <BankFoliageSvg corner="tr" />
        </span>
        <span className={`${styles.foliage} ${styles.foliageBL}`} aria-hidden>
          <BankFoliageSvg corner="bl" />
        </span>
        <span className={`${styles.foliage} ${styles.foliageBR}`} aria-hidden>
          <BankFoliageSvg corner="br" />
        </span>

        {zones.map((zone, index) => {
          const left = perches.find((p) => p.zone === zone.id && p.bank === 'left')
          const right = perches.find((p) => p.zone === zone.id && p.bank === 'right')
          /* Downstream rows sit slightly larger — fake table depth. */
          const depth = index / Math.max(zoneCount - 1, 1)
          const rowStyle = {
            ['--row-depth' as string]: String(depth),
            transform: `scale(${1 + depth * 0.04})`,
            transformOrigin: 'center bottom',
            marginInline: `${-depth * 0.35}rem`,
          }

          return (
            <div className={styles.row} key={zone.id} style={rowStyle} data-depth={index}>
              {left ? (
                <Perch
                  perch={left}
                  occupant={occupants[left.id]}
                  movable={movablePerches.includes(left.id)}
                  onClick={() => onPerchClick(left.id)}
                />
              ) : (
                <span className={styles.spacer} />
              )}
              <ZoneTile
                zone={zone}
                splashed={splashes.includes(zone.id)}
                targetState={targetStates[zone.id] ?? undefined}
                actions={zoneActions[zone.id]}
                outcomes={zoneOutcomes[zone.id]}
                drifting={drifting}
                driftOff={drifting && zone.id === lastZone}
                onClick={() => onZoneClick(zone.id)}
              />
              {right ? (
                <Perch
                  perch={right}
                  occupant={occupants[right.id]}
                  movable={movablePerches.includes(right.id)}
                  onClick={() => onPerchClick(right.id)}
                />
              ) : (
                <span className={styles.spacer} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
