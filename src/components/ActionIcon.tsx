import type { CardType } from '../game/types'

interface ActionIconProps {
  card: CardType
  className?: string
}

/** Stroke glyphs for the four action cards. Rendered in currentColor. */
export function ActionIcon({ card, className }: ActionIconProps) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (card) {
    case 'Dive':
      return (
        <svg {...common}>
          <path d="M12 3v9" />
          <path d="M8 8.5 12 12l4-3.5" />
          <path d="M3 18.5c1.5-1.6 3-1.6 4.5 0s3 1.6 4.5 0 3-1.6 4.5 0 3 1.6 4.5 0" />
        </svg>
      )
    case 'Drop':
      return (
        <svg {...common}>
          <path d="M5 4.5 17.5 17" />
          <path d="M13.6 16.4 18 18l-.9-4.4" />
          <path d="M19 4.5 6.5 17" />
          <path d="M10.4 16.4 6 18l.9-4.4" />
        </svg>
      )
    case 'Splash':
      return (
        <svg {...common}>
          <path d="M12 4c2.1 3 3.6 5.1 3.6 7.1a3.6 3.6 0 1 1-7.2 0C8.4 9.1 9.9 7 12 4z" />
          <path d="M4 8.5 5.6 10" />
          <path d="M20 8.5 18.4 10" />
          <path d="M4.5 15.5h2.2" />
          <path d="M17.3 15.5h2.2" />
        </svg>
      )
    case 'Hover':
      return (
        <svg {...common}>
          <path d="M2.5 12.5C5 8.7 8.3 6.8 12 6.8s7 1.9 9.5 5.7c-2.5 3.8-5.8 5.7-9.5 5.7s-7-1.9-9.5-5.7z" />
          <circle cx="12" cy="12.5" r="2.6" fill="currentColor" stroke="none" />
          <path d="M6.5 5.5c1.6-1.4 3.4-2 5.5-2" />
        </svg>
      )
  }
}
