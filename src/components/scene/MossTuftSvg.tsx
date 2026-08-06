interface MossTuftSvgProps {
  className?: string
  /** Mirror for right bank. */
  flip?: boolean
}

/** Small moss + pebble clump for mid-bank texture. */
export function MossTuftSvg({ className, flip }: MossTuftSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 40"
      width="100%"
      height="100%"
      aria-hidden
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <ellipse cx="22" cy="34" rx="16" ry="4.5" fill="rgba(90, 56, 24, 0.14)" />
      <path
        d="M4 32 C10 24, 18 22, 26 24 C34 26, 40 30, 46 34 L4 34 Z"
        fill="var(--bank-cliff, #c4a46a)"
        opacity="0.7"
      />
      <circle cx="14" cy="22" r="10" fill="var(--forest-deep, #2e4b2a)" opacity="0.5" />
      <circle cx="26" cy="18" r="11" fill="var(--leaf-green, #4c7a3d)" opacity="0.7" />
      <circle cx="22" cy="14" r="7" fill="var(--leaf-sun, #6a9a52)" opacity="0.65" />
      <circle cx="34" cy="24" r="7" fill="#5d8f4a" opacity="0.55" />
      <circle cx="12" cy="30" r="2.2" fill="var(--bank-cliff, #c4a46a)" opacity="0.8" />
      <circle cx="30" cy="32" r="1.6" fill="var(--bank-deep, #d8bc82)" />
      <circle cx="20" cy="12" r="2" fill="rgba(255,248,214,0.4)" />
    </svg>
  )
}
