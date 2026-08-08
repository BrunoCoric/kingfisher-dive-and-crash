import { useState } from 'react'
import type { CalloutKind, OutcomeCallout, Perch as PerchType, RiverZone } from '../game/types'
import type { KingfisherID } from '../game/kingfishers'
import { reachableZones } from '../game/reach'
import type { ZoneAction } from '../lib/stepFeedback'
import { Perch } from './Perch'
import { ZoneTile } from './ZoneTile'
import { BankFoliageSvg } from './scene/BankFoliageSvg'
import { MossTuftSvg } from './scene/MossTuftSvg'
import { RiverChannelSvg } from './scene/RiverChannelSvg'
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
  /** Optional reach override for perch hover preview (species powers). */
  previewReach?: (perchId: string) => number[]
  speciesBySeat: Record<string, KingfisherID>
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
  previewReach,
  speciesBySeat,
  onDriftEnd,
  onZoneClick,
  onPerchClick,
}: RiverBoardProps) {
  const [hoverPerchId, setHoverPerchId] = useState<string | null>(null)
  const zoneCount = zones.length
  const lastZone = zoneCount - 1

  // Don't fight Splash/Dive/peek or perch placement — only preview when the river is idle.
  const zoneTargeting = Object.values(targetStates).some((state) => state != null)
  const perchTargeting = movablePerches.length > 0
  const targeting = zoneTargeting || perchTargeting
  const hoverPerch = !targeting && hoverPerchId
    ? perches.find((p) => p.id === hoverPerchId)
    : undefined
  const influence = hoverPerch
    ? new Set(
        previewReach
          ? previewReach(hoverPerch.id)
          : reachableZones(hoverPerch.zone, hoverPerch.level, zoneCount),
      )
    : null

  const renderPerch = (perch: PerchType | undefined) => {
    if (!perch) return <span className={styles.spacer} />
    const movable = movablePerches.includes(perch.id)
    return (
      <Perch
        perch={perch}
        occupant={occupants[perch.id]}
        movable={movable}
        dimmed={perchTargeting && !movable}
        previewing={hoverPerch?.id === perch.id}
        onClick={() => onPerchClick(perch.id)}
        onHoverChange={(hovering) => setHoverPerchId(hovering ? perch.id : null)}
      />
    )
  }

  return (
    <div className={styles.frame}>
      <div className={`${styles.board} ${drifting ? styles.boardDrifting : ''}`}>
        <span className={styles.channel} aria-hidden>
          <RiverChannelSvg />
        </span>
        <span className={`${styles.bankWash} ${styles.bankWashL}`} aria-hidden />
        <span className={`${styles.bankWash} ${styles.bankWashR}`} aria-hidden />
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

        <span className={`${styles.moss} ${styles.mossL1}`} aria-hidden>
          <MossTuftSvg />
        </span>
        <span className={`${styles.moss} ${styles.mossL2}`} aria-hidden>
          <MossTuftSvg />
        </span>
        <span className={`${styles.moss} ${styles.mossL3}`} aria-hidden>
          <MossTuftSvg />
        </span>
        <span className={`${styles.moss} ${styles.mossR1}`} aria-hidden>
          <MossTuftSvg flip />
        </span>
        <span className={`${styles.moss} ${styles.mossR2}`} aria-hidden>
          <MossTuftSvg flip />
        </span>
        <span className={`${styles.moss} ${styles.mossR3}`} aria-hidden>
          <MossTuftSvg flip />
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
          const zoneInfluence = influence
            ? influence.has(zone.id) ? 'in' : 'out'
            : null

          return (
            <div className={styles.row} key={zone.id} style={rowStyle} data-depth={index}>
              {renderPerch(left)}
              <ZoneTile
                zone={zone}
                splashed={splashes.includes(zone.id)}
                targetState={targetStates[zone.id] ?? undefined}
                influence={zoneInfluence}
                actions={zoneActions[zone.id]}
                outcomes={zoneOutcomes[zone.id]}
                drifting={drifting}
                driftOff={drifting && zone.id === lastZone}
                speciesBySeat={speciesBySeat}
                onClick={() => onZoneClick(zone.id)}
              />
              {renderPerch(right)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
