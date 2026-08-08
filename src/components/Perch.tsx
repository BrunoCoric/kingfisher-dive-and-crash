import type { CalloutKind, Perch as PerchData } from '../game/types'
import { BranchSvg } from './scene/BranchSvg'
import { ReedSvg } from './scene/ReedSvg'
import styles from './Perch.module.css'

interface PerchProps {
  perch: PerchData
  occupant?: {
    id: string
    color: string
    isFirst: boolean
    sprite: string
    facing: 'left' | 'right'
    spriteScale?: number
    reaction?: CalloutKind
    feedbackKey?: string
  }
  /** Legal landing / relocate perch (placement or Hover). */
  movable?: boolean
  /** Out of reach / occupied while perch targeting is active — dim like illegal zones. */
  dimmed?: boolean
  /** Soft highlight while mouse is over this perch (reach preview). */
  previewing?: boolean
  onClick?: () => void
  onHoverChange?: (hovering: boolean) => void
}

const REACTION_CLASS: Partial<Record<CalloutKind, string>> = {
  catch: styles.reactCatch,
  crash: styles.reactCrash,
  steal: styles.reactSteal,
  blocked: styles.reactBlocked,
  pike: styles.reactPike,
}

export function Perch({
  perch,
  occupant,
  movable,
  dimmed,
  previewing,
  onClick,
  onHoverChange,
}: PerchProps) {
  const cls = [styles.perch, perch.bank === 'left' ? styles.left : styles.right, styles[perch.level]]
  if (movable) cls.push(styles.movable)
  if (dimmed) cls.push(styles.dimmed)
  if (occupant) cls.push(styles.occupied)
  if (previewing) cls.push(styles.previewing)

  const flip =
    occupant !== undefined &&
    ((perch.bank === 'left' && occupant.facing === 'left') ||
      (perch.bank === 'right' && occupant.facing === 'right'))

  const reaction = occupant?.reaction
  const reactCls = reaction ? REACTION_CLASS[reaction] : undefined

  return (
    <div
      className={cls.join(' ')}
      data-perch={perch.id}
      data-movable={movable === true ? 'true' : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Perch ${perch.id} (${perch.level})`}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) onClick()
      }}
    >
      <span className={styles.art} aria-hidden>
        {perch.level === 'high' ? (
          <BranchSvg bank={perch.bank} className={styles.branchSvg} />
        ) : (
          <ReedSvg className={styles.reedSvg} />
        )}
      </span>

      {occupant && (
        <span
          key={occupant.feedbackKey ? `${occupant.id}-${occupant.feedbackKey}` : occupant.id}
          className={`${styles.pawn} ${reactCls ?? ''}`}
        >
          <span className={styles.pawnShadow} aria-hidden />
          <span className={styles.bobber}>
            <img
              className={flip ? styles.spriteFlip : styles.sprite}
              src={occupant.sprite}
              alt={`Player ${occupant.id} kingfisher`}
              draggable={false}
              style={
                occupant.spriteScale && occupant.spriteScale !== 1
                  ? { ['--sprite-scale' as string]: String(occupant.spriteScale) }
                  : undefined
              }
            />
          </span>
          {occupant.isFirst && (
            <span className={styles.firstStar} title="First player">
              ✦
            </span>
          )}
          {reaction === 'catch' && <span className={styles.cueCatch} aria-hidden>+</span>}
          {reaction === 'crash' && <span className={styles.cueCrash} aria-hidden>×</span>}
          {reaction === 'steal' && <span className={styles.cueSteal} aria-hidden>STEAL</span>}
          {reaction === 'blocked' && <span className={styles.cueBlocked} aria-hidden />}
          {reaction === 'pike' && <span className={styles.cuePike} aria-hidden>!</span>}
        </span>
      )}

      {movable && <span className={styles.sunHalo} aria-hidden />}
    </div>
  )
}
