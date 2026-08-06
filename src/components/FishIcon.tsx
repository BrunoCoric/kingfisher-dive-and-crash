import type { FishType } from '../game/types'

interface FishIconProps {
  type: FishType
  className?: string
}

const EYE = <circle cx="7.4" cy="11" r="1.1" fill="var(--parchment)" />

/** Ink-silhouette glyphs for fish cards. Rendered in currentColor. */
export function FishIcon({ type, className }: FishIconProps) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
  }
  switch (type) {
    case 'Minnow':
      return (
        <svg {...common}>
          <ellipse cx="10.5" cy="12" rx="6.4" ry="3.4" />
          <path d="M15.5 12l6-3.6v7.2z" />
          {EYE}
        </svg>
      )
    case 'Perch':
      return (
        <svg {...common}>
          <path d="M7 8.6 8.8 5.4l1.7 2.6L12.2 5l1.4 2.8-1.6.8H8.4z" />
          <ellipse cx="10.6" cy="12.6" rx="7" ry="4.2" />
          <path d="M16 12.6l6.2-4v8z" />
          {EYE}
        </svg>
      )
    case 'Trout':
      return (
        <svg {...common}>
          <ellipse cx="10.2" cy="13" rx="7.4" ry="4.4" />
          <path d="M16 13l6.4-4.2v8.4z" />
          <circle cx="7.2" cy="11.8" r="1.1" fill="var(--parchment)" />
          <circle cx="11" cy="12.4" r="0.75" fill="var(--parchment)" opacity="0.75" />
          <circle cx="13.4" cy="14" r="0.75" fill="var(--parchment)" opacity="0.75" />
          <circle cx="9.6" cy="14.6" r="0.75" fill="var(--parchment)" opacity="0.75" />
          <path d="M19.2 2.2l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
        </svg>
      )
    case 'Trash':
      return (
        <svg {...common}>
          <path d="M8.6 3.2h4.6v7.6h2c2.8 0 4.8 1.9 4.8 4.4V17H7.4a2.9 2.9 0 0 1-2.9-2.9v-.4c0-1.6 1.3-2.9 2.9-2.9h1.2z" />
          <path d="M4.6 14.9H20" stroke="var(--parchment)" strokeWidth="1" fill="none" />
          <path d="M8.6 3.2h4.6v1.6H8.6z" opacity="0.55" />
        </svg>
      )
    case 'Pike':
      return (
        <svg {...common}>
          <path d="M9 8.2l1.8-2.4 1.5 2.2 1.9-2 1.3 2.4z" />
          <path d="M2.4 12.4 5.4 10.8c1.6-2 4.2-3 7-3 3.8 0 7 1.7 8.8 4.6-1.8 2.9-5 4.6-8.8 4.6-2.8 0-5.4-1-7-3l-3-1.2 1.7-.4z" />
          <path d="M3.2 10.9l1.5 1-1.6.8zM5.2 13.4l1.4.9-1.7.6z" fill="var(--parchment)" />
          {EYE}
        </svg>
      )
  }
}
