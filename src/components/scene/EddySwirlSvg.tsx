interface EddySwirlSvgProps {
  className?: string
}

/** Visible vortex mark for Eddy zones — spiral strokes, not a soft CSS wash. */
export function EddySwirlSvg({ className }: EddySwirlSvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <path
        d="M32 10c12 0 22 8 22 18 0 8-6 14-14 14-6 0-10-4-10-9 0-4 3-7 7-7 2.5 0 4.5 1.6 4.5 4"
        fill="none"
        stroke="rgba(255,252,245,0.85)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M32 16c8.5 0 15.5 5.5 15.5 12.5 0 5.5-4 9.5-9.5 9.5-4 0-7-2.8-7-6.2 0-2.6 1.9-4.5 4.4-4.5"
        fill="none"
        stroke="rgba(30,80,65,0.55)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="34" cy="32" r="2.2" fill="rgba(255,252,245,0.75)" />
      <circle cx="34" cy="32" r="1.1" fill="rgba(30,80,65,0.55)" />
    </svg>
  )
}
