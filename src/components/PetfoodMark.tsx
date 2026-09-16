import { useId } from 'react'

type MarkProps = {
  className?: string
  /** Hero: slow continuous spin */
  spin?: boolean
}

/**
 * PETFOOD mark — corner-on 3D diamond pyramid.
 * Gold tip · neon forest green · neon navy · neon forest green
 * White outer stroke · paw sits on the apex
 */
export function PetfoodMark({ className, spin = false }: MarkProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      className={[className, spin ? 'petfood-mark--spin' : undefined]
        .filter(Boolean)
        .join(' ')}
      viewBox="0 0 80 80"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`goldL-${uid}`} x1="20" y1="8" x2="40" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe9a0" />
          <stop offset="1" stopColor="#f0c43c" />
        </linearGradient>
        <linearGradient id={`goldR-${uid}`} x1="40" y1="8" x2="60" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8b82e" />
          <stop offset="1" stopColor="#b88914" />
        </linearGradient>
        {/* slightly dark fluorescent green */}
        <linearGradient id={`greenL-${uid}`} x1="8" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5dff9a" />
          <stop offset="1" stopColor="#18c45a" />
        </linearGradient>
        <linearGradient id={`greenR-${uid}`} x1="40" y1="0" x2="72" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#12a84c" />
          <stop offset="1" stopColor="#0a6e34" />
        </linearGradient>
        {/* fluorescent navy */}
        <linearGradient id={`navyL-${uid}`} x1="8" y1="0" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5a8cff" />
          <stop offset="1" stopColor="#2a4fd6" />
        </linearGradient>
        <linearGradient id={`navyR-${uid}`} x1="40" y1="0" x2="72" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2444c0" />
          <stop offset="1" stopColor="#132a7a" />
        </linearGradient>
      </defs>

      {/*
        Diamond: A(40,6) · L(8,50) · Tip(40,74) · R(72,50)
        Tier cuts: y=24 gold | y=38 green | y=50 navy equator | tip green
      */}
      <g>
        {/* T1 gold */}
        <path d="M40 6 L22 24 H40 Z" fill={`url(#goldL-${uid})`} />
        <path d="M40 6 L40 24 H58 Z" fill={`url(#goldR-${uid})`} />

        {/* T2 neon green */}
        <path d="M22 24 H40 L40 38 H13 Z" fill={`url(#greenL-${uid})`} />
        <path d="M40 24 H58 L67 38 H40 Z" fill={`url(#greenR-${uid})`} />

        {/* T3 neon navy */}
        <path d="M13 38 H40 L40 50 H8 Z" fill={`url(#navyL-${uid})`} />
        <path d="M40 38 H67 L72 50 H40 Z" fill={`url(#navyR-${uid})`} />

        {/* T4 neon green to tip */}
        <path d="M8 50 H40 L40 74 Z" fill={`url(#greenL-${uid})`} />
        <path d="M40 50 H72 L40 74 Z" fill={`url(#greenR-${uid})`} />
      </g>

      {/* tier seams */}
      <g stroke="rgba(8,12,20,0.55)" strokeWidth="1.15" strokeLinejoin="round">
        <path d="M22 24 H58" fill="none" />
        <path d="M13 38 H67" fill="none" />
        <path d="M8 50 H72" fill="none" />
        <path d="M40 6 V74" fill="none" opacity="0.65" />
      </g>

      {/* white outer outline */}
      <path
        d="M40 6 L72 50 L40 74 L8 50 Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* paw on apex */}
      <g fill="#1a1d24" transform="translate(40 14.5) scale(0.72)">
        <ellipse cx="0" cy="2.15" rx="3.15" ry="2.5" />
        <circle cx="-3.9" cy="-2.15" r="1.4" />
        <circle cx="-1.35" cy="-3.15" r="1.4" />
        <circle cx="1.35" cy="-3.15" r="1.4" />
        <circle cx="3.9" cy="-2.15" r="1.4" />
      </g>
    </svg>
  )
}
