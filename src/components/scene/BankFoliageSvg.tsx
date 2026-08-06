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
        opacity="0.9"
      />
      <path
        d="M0 78 C22 66, 44 62, 64 68 C78 72, 88 80, 96 86 L96 96 L0 96 Z"
        fill="var(--bank-sand, #e9d3a3)"
      />
      <path
        d="M0 84 C20 76, 42 74, 62 78 C78 82, 90 88, 96 92 L96 96 L0 96 Z"
        fill="rgba(255,248,214,0.35)"
      />

      {/* leaf mounds */}
      <ellipse cx="16" cy="54" rx="20" ry="18" fill="var(--forest-deep, #2e4b2a)" opacity="0.55" />
      <circle cx="38" cy="44" r="20" fill="var(--leaf-green, #4c7a3d)" opacity="0.78" />
      <circle cx="28" cy="36" r="15" fill="var(--leaf-sun, #6a9a52)" opacity="0.72" />
      <circle cx="52" cy="50" r="16" fill="#5d8f4a" opacity="0.68" />
      <circle cx="12" cy="62" r="12" fill="var(--leaf-green, #4c7a3d)" opacity="0.52" />
      <ellipse cx="44" cy="58" rx="10" ry="8" fill="var(--forest-deep, #2e4b2a)" opacity="0.35" />

      {/* reed tips peeking from the mound */}
      <path
        d="M30 42 L28 22 M36 40 L37 20 M42 44 L44 26"
        fill="none"
        stroke="var(--reed-amber, #c98f3e)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      <ellipse cx="28" cy="20" rx="2.2" ry="3.4" fill="var(--reed-amber, #c98f3e)" opacity="0.75" />
      <ellipse cx="37" cy="18" rx="2" ry="3.2" fill="var(--leaf-sun, #6a9a52)" opacity="0.7" />
      <ellipse cx="44" cy="24" rx="2.1" ry="3" fill="var(--reed-amber, #c98f3e)" opacity="0.65" />

      {/* pebbles on the sand shelf */}
      <circle cx="18" cy="82" r="2.4" fill="var(--bank-cliff, #c4a46a)" opacity="0.7" />
      <circle cx="28" cy="86" r="1.7" fill="var(--bank-deep, #d8bc82)" />
      <circle cx="48" cy="84" r="2" fill="rgba(90,56,24,0.22)" />
      <circle cx="62" cy="88" r="1.5" fill="var(--bank-cliff, #c4a46a)" opacity="0.55" />

      {/* sunny highlight dots */}
      <circle cx="24" cy="32" r="3.5" fill="rgba(255,248,214,0.5)" />
      <circle cx="40" cy="38" r="2.5" fill="rgba(255,248,214,0.38)" />
      <circle cx="50" cy="42" r="1.8" fill="rgba(255,248,214,0.3)" />
    </svg>
  )
}
