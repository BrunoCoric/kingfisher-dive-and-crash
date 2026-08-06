/** Soft watercolor channel under the puddles — broken blooms, not a column. */
export function RiverChannelSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 400"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="wetA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(110, 160, 168, 0.34)" />
          <stop offset="70%" stopColor="rgba(110, 160, 168, 0.12)" />
          <stop offset="100%" stopColor="rgba(110, 160, 168, 0)" />
        </radialGradient>
        <radialGradient id="wetB" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(80, 140, 155, 0.3)" />
          <stop offset="65%" stopColor="rgba(80, 140, 155, 0.1)" />
          <stop offset="100%" stopColor="rgba(80, 140, 155, 0)" />
        </radialGradient>
        <radialGradient id="damp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(180, 150, 100, 0.28)" />
          <stop offset="100%" stopColor="rgba(180, 150, 100, 0)" />
        </radialGradient>
      </defs>

      {/* damp sand patches — warm, irregular, no hard tube */}
      <ellipse cx="58" cy="48" rx="28" ry="36" fill="url(#damp)" />
      <ellipse cx="48" cy="118" rx="32" ry="40" fill="url(#damp)" opacity="0.85" />
      <ellipse cx="64" cy="198" rx="26" ry="38" fill="url(#damp)" opacity="0.9" />
      <ellipse cx="50" cy="278" rx="30" ry="42" fill="url(#damp)" opacity="0.8" />
      <ellipse cx="60" cy="348" rx="28" ry="34" fill="url(#damp)" opacity="0.85" />

      {/* soft water pigment blooms — staggered so the edge meanders */}
      <ellipse cx="54" cy="42" rx="18" ry="28" fill="url(#wetA)" />
      <ellipse cx="46" cy="95" rx="20" ry="30" fill="url(#wetB)" />
      <ellipse cx="62" cy="148" rx="16" ry="26" fill="url(#wetA)" opacity="0.9" />
      <ellipse cx="48" cy="205" rx="19" ry="32" fill="url(#wetB)" />
      <ellipse cx="66" cy="255" rx="15" ry="28" fill="url(#wetA)" opacity="0.85" />
      <ellipse cx="50" cy="310" rx="20" ry="30" fill="url(#wetB)" opacity="0.9" />
      <ellipse cx="58" cy="358" rx="17" ry="26" fill="url(#wetA)" />

      {/* faint glitter — broken, not one continuous line */}
      <path
        d="M50 55 C52 72, 54 88, 51 105"
        fill="none"
        stroke="rgba(255,252,245,0.22)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M56 175 C58 195, 55 215, 57 232"
        fill="none"
        stroke="rgba(255,252,245,0.18)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M52 295 C54 315, 53 335, 55 350"
        fill="none"
        stroke="rgba(255,252,245,0.16)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle cx="44" cy="88" r="1.3" fill="rgba(45,95,120,0.12)" />
      <circle cx="68" cy="168" r="1.1" fill="rgba(255,255,255,0.18)" />
      <circle cx="46" cy="248" r="1.2" fill="rgba(45,95,120,0.1)" />
      <circle cx="64" cy="328" r="1" fill="rgba(255,255,255,0.14)" />
    </svg>
  )
}
