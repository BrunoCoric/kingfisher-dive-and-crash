interface BankFoliageSvgProps {
  corner: 'tl' | 'tr' | 'bl' | 'br'
  className?: string
}

/** Meadow clump + sand shelf for board corners. */
export function BankFoliageSvg({ corner, className }: BankFoliageSvgProps) {
  const flipX = corner === 'tr' || corner === 'br'
  const flipY = corner === 'bl' || corner === 'br'
  const transform = `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`
  const origin = `${flipX ? '100%' : '0%'} ${flipY ? '100%' : '0%'}`

  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      width="100%"
      height="100%"
      aria-hidden
      style={{ transform, transformOrigin: origin }}
    >
      {/* sand shelf */}
      <path
        d="M0 72 C18 58, 36 54, 54 58 C70 62, 82 72, 96 80 L96 96 L0 96 Z"
        fill="var(--bank-cliff, #c4a46a)"
        opacity="0.85"
      />
      <path
        d="M0 78 C22 66, 44 62, 64 68 C78 72, 88 80, 96 86 L96 96 L0 96 Z"
        fill="var(--bank-sand, #e9d3a3)"
      />

      {/* leaf mounds */}
      <circle cx="18" cy="52" r="22" fill="var(--forest-deep, #2e4b2a)" opacity="0.55" />
      <circle cx="38" cy="44" r="20" fill="var(--leaf-green, #4c7a3d)" opacity="0.75" />
      <circle cx="28" cy="38" r="14" fill="var(--leaf-sun, #6a9a52)" opacity="0.7" />
      <circle cx="52" cy="50" r="16" fill="#5d8f4a" opacity="0.65" />
      <circle cx="12" cy="62" r="12" fill="var(--leaf-green, #4c7a3d)" opacity="0.5" />

      {/* sunny highlight dots */}
      <circle cx="24" cy="34" r="3.5" fill="rgba(255,248,214,0.45)" />
      <circle cx="40" cy="40" r="2.5" fill="rgba(255,248,214,0.35)" />
    </svg>
  )
}
