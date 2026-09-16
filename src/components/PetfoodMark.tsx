import { useId } from 'react'

type MarkProps = {
  className?: string
  /** When true, draw a dark rounded plate behind the pyramid (favicon-style) */
  withPlate?: boolean
}

/** PETFOOD mark — 3D faceted 4-tier pyramid with paw (readable, not too dark) */
export function PetfoodMark({ className, withPlate = false }: MarkProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      role="img"
      aria-hidden="true"
    >
      <defs>
        {/* left faces brighter, right faces shaded — central ridge = depth */}
        <linearGradient id={`g1l-${uid}`} x1="0%" y1="0%" x2="100%" y2="30%">
          <stop offset="0%" stopColor="#ffe89a" />
          <stop offset="100%" stopColor="#f0c94a" />
        </linearGradient>
        <linearGradient id={`g1r-${uid}`} x1="0%" y1="0%" x2="100%" y2="40%">
          <stop offset="0%" stopColor="#e0b53a" />
          <stop offset="100%" stopColor="#b88918" />
        </linearGradient>
        <linearGradient id={`g2l-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4db88a" />
          <stop offset="100%" stopColor="#2f9a6a" />
        </linearGradient>
        <linearGradient id={`g2r-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2a8a5c" />
          <stop offset="100%" stopColor="#1d6b46" />
        </linearGradient>
        <linearGradient id={`g3l-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b93a3" />
          <stop offset="100%" stopColor="#6b7384" />
        </linearGradient>
        <linearGradient id={`g3r-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5c6474" />
          <stop offset="100%" stopColor="#3f4654" />
        </linearGradient>
        <linearGradient id={`g4l-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4db88a" />
          <stop offset="100%" stopColor="#2f9a6a" />
        </linearGradient>
        <linearGradient id={`g4r-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2a8a5c" />
          <stop offset="100%" stopColor="#1d6b46" />
        </linearGradient>
      </defs>

      {withPlate && (
        <rect x="2" y="2" width="76" height="76" rx="16" fill="#1c1f26" />
      )}

      {/*
        Pyramid: apex (40,10) · base (10,70)-(70,70)
        Tier edges at y = 25 / 40 / 55 / 70
        half-width at y: (y-10)/60 * 30
      */}
      {/* tier 1 gold */}
      <path d="M40 10 L32 25 H40 Z" fill={`url(#g1l-${uid})`} />
      <path d="M40 10 L40 25 H48 Z" fill={`url(#g1r-${uid})`} />

      {/* tier 2 green */}
      <path d="M32 25 H40 L40 40 H24.5 Z" fill={`url(#g2l-${uid})`} />
      <path d="M40 25 H48 L55.5 40 H40 Z" fill={`url(#g2r-${uid})`} />

      {/* tier 3 slate + paw */}
      <path d="M24.5 40 H40 L40 55 H17 Z" fill={`url(#g3l-${uid})`} />
      <path d="M40 40 H55.5 L63 55 H40 Z" fill={`url(#g3r-${uid})`} />

      {/* tier 4 green base */}
      <path d="M17 55 H40 L40 70 H10 Z" fill={`url(#g4l-${uid})`} />
      <path d="M40 55 H63 L70 70 H40 Z" fill={`url(#g4r-${uid})`} />

      {/* seam lines */}
      <g stroke="#14181f" strokeWidth="1.35" strokeLinecap="round">
        <line x1="32" y1="25" x2="48" y2="25" />
        <line x1="24.5" y1="40" x2="55.5" y2="40" />
        <line x1="17" y1="55" x2="63" y2="55" />
        <line x1="40" y1="10" x2="40" y2="70" opacity="0.55" />
      </g>

      {/* soft left highlight on ridge */}
      <path
        d="M40 10 L32 25 L24.5 40 L17 55 L10 70"
        fill="none"
        stroke="#fff8e0"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.28"
      />

      {/* paw print on mid band */}
      <g fill="#1a1d24" transform="translate(40 47.5) scale(0.92)">
        <ellipse cx="0" cy="2.2" rx="3.4" ry="2.7" />
        <circle cx="-4.2" cy="-2.4" r="1.55" />
        <circle cx="-1.5" cy="-3.5" r="1.55" />
        <circle cx="1.5" cy="-3.5" r="1.55" />
        <circle cx="4.2" cy="-2.4" r="1.55" />
      </g>
    </svg>
  )
}
