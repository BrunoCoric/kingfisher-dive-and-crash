import { useId } from 'react'

interface BranchSvgProps {
  bank: 'left' | 'right'
  className?: string
}

/** Overhanging high-perch limb with leaf clusters. */
export function BranchSvg({ bank, className }: BranchSvgProps) {
  const uid = useId().replace(/:/g, '')
  const woodId = `branchWood-${uid}`
  const flip = bank === 'right'

  return (
    <svg
      className={className}
      viewBox="0 0 72 56"
      width="100%"
      height="100%"
      aria-hidden
      preserveAspectRatio="xMidYMax meet"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <defs>
        <linearGradient id={woodId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--wood, #8a5a33)" />
          <stop offset="100%" stopColor="var(--wood-bark, #5a3818)" />
        </linearGradient>
      </defs>
      <path
        d="M4 38 C22 34, 40 30, 62 28 C66 27.5, 70 29, 70 32 C70 34, 66 35, 62 35.5 C40 38, 22 42, 6 44 Z"
        fill="rgba(43,36,32,0.18)"
      />
      <path
        d={`M2 36 C20 32, 38 28, 58 26 C64 25.5, 68 26.5, 70 29 C68 31.5, 64 32.5, 58 33 C38 36, 20 40, 4 42 C1 41, 0 38, 2 36 Z`}
        fill={`url(#${woodId})`}
      />
      <path
        d="M10 34 C28 30, 44 28, 60 27"
        fill="none"
        stroke="rgba(90,56,24,0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <ellipse cx="48" cy="18" rx="10" ry="7" fill="#5d8f4a" transform="rotate(-28 48 18)" />
      <ellipse cx="54" cy="16" rx="8" ry="5.5" fill="var(--leaf-sun, #6a9a52)" transform="rotate(18 54 16)" />
      <ellipse cx="42" cy="20" rx="7" ry="5" fill="var(--leaf-green, #4c7a3d)" transform="rotate(-8 42 20)" />
      <ellipse cx="28" cy="22" rx="6" ry="4.2" fill="#5d8f4a" transform="rotate(-35 28 22)" />
    </svg>
  )
}
