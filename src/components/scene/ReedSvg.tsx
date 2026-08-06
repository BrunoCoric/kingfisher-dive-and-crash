import { useId } from 'react'

interface ReedSvgProps {
  className?: string
}

/** Low-perch reed clump on a sand mound. */
export function ReedSvg({ className }: ReedSvgProps) {
  const uid = useId().replace(/:/g, '')
  const sandId = `sandMound-${uid}`
  const stemId = `reedStem-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 64 56"
      width="100%"
      height="100%"
      aria-hidden
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id={sandId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#efd9a8" />
          <stop offset="100%" stopColor="var(--bank-cliff, #c4a46a)" />
        </linearGradient>
        <linearGradient id={stemId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--reed-amber, #c98f3e)" />
          <stop offset="35%" stopColor="#7c9a4e" />
          <stop offset="100%" stopColor="var(--forest-deep, #2e4b2a)" />
        </linearGradient>
      </defs>

      <ellipse cx="32" cy="50" rx="26" ry="8" fill={`url(#${sandId})`} />
      <ellipse cx="32" cy="48" rx="18" ry="4.5" fill="rgba(239,217,168,0.7)" />

      <g strokeLinecap="round">
        <path d="M18 48 C16 34, 14 22, 15 10" stroke={`url(#${stemId})`} strokeWidth="2.2" fill="none" />
        <path d="M26 48 C25 32, 24 18, 26 6" stroke={`url(#${stemId})`} strokeWidth="2.6" fill="none" />
        <path d="M34 48 C35 34, 36 20, 34 8" stroke={`url(#${stemId})`} strokeWidth="2.4" fill="none" />
        <path d="M42 48 C44 36, 46 24, 48 12" stroke={`url(#${stemId})`} strokeWidth="2.1" fill="none" />
        <path
          d="M22 48 C21 38, 20 28, 19 18"
          stroke={`url(#${stemId})`}
          strokeWidth="1.6"
          fill="none"
          opacity="0.75"
        />
      </g>

      <ellipse cx="15" cy="9" rx="3.2" ry="5.5" fill="var(--reed-amber, #c98f3e)" transform="rotate(-8 15 9)" />
      <ellipse cx="26" cy="5" rx="3.6" ry="6.2" fill="#b07a32" transform="rotate(4 26 5)" />
      <ellipse cx="34" cy="7" rx="3.1" ry="5.4" fill="var(--reed-amber, #c98f3e)" transform="rotate(-3 34 7)" />
      <ellipse cx="48" cy="11" rx="2.8" ry="4.8" fill="#c98f3e" transform="rotate(10 48 11)" />
    </svg>
  )
}
