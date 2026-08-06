import { useId } from 'react'
import { WATER_RECIPES } from './waterRecipes'

interface WaterPuddleSvgProps {
  zoneId: number
  className?: string
}

/** Organic watercolor puddle — unique silhouette + pigment blooms per zone. */
export function WaterPuddleSvg({ zoneId, className }: WaterPuddleSvgProps) {
  const uid = useId().replace(/:/g, '')
  const recipe = WATER_RECIPES[zoneId % WATER_RECIPES.length]
  const gradId = `puddle-${uid}`
  const clipId = `clip-${uid}`
  const haloId = `halo-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 100 80"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={recipe.light} />
          <stop offset="48%" stopColor={recipe.mid} />
          <stop offset="100%" stopColor={recipe.deep} />
        </linearGradient>
        <radialGradient id={haloId} cx="50%" cy="50%" r="55%">
          <stop offset="70%" stopColor="rgba(250,243,227,0)" />
          <stop offset="100%" stopColor="rgba(250,243,227,0.55)" />
        </radialGradient>
        <clipPath id={clipId}>
          <path d={recipe.path} />
        </clipPath>
      </defs>

      {/* soft deckled paper-edge halo + ground shadow */}
      <path
        d={recipe.path}
        fill="rgba(250,243,227,0.5)"
        transform="translate(50 41) scale(1.045) translate(-50 -41)"
      />
      <ellipse cx="50" cy="73" rx="34" ry="4.5" fill="rgba(45,95,120,0.16)" />

      <path d={recipe.path} fill={`url(#${gradId})`} />
      <path
        d={recipe.path}
        fill="none"
        stroke="rgba(255,252,245,0.4)"
        strokeWidth="1.6"
      />
      <path
        d={recipe.path}
        fill="none"
        stroke="rgba(45,95,120,0.22)"
        strokeWidth="0.9"
      />

      <g clipPath={`url(#${clipId})`}>
        {recipe.blooms.map((b, i) => (
          <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.fill} />
        ))}
        {recipe.speckles.map((s, i) => (
          <circle key={`s${i}`} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} />
        ))}
        <path d={recipe.path} fill={`url(#${haloId})`} />
      </g>
    </svg>
  )
}
