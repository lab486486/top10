import { useId } from 'react'

/** PETFOOD brand mark — solid pyramid seal with six grade bands */
export function PetfoodMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const gold = `pfGold-${uid}`
  const ring = `pfRing-${uid}`
  const slits = `pfSlits-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gold} x1="22%" y1="4%" x2="78%" y2="96%">
          <stop offset="0%" stopColor="#fff3c8" />
          <stop offset="40%" stopColor="#e0bc4a" />
          <stop offset="100%" stopColor="#8a6410" />
        </linearGradient>
        <linearGradient id={ring} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7e7a8" />
          <stop offset="100%" stopColor="#a07818" />
        </linearGradient>
        <mask id={slits}>
          <rect width="80" height="80" fill="#fff" />
          {/* five slits → six grade bands inside one silhouette */}
          <rect x="28" y="27.2" width="24" height="1.7" rx="0.6" fill="#000" />
          <rect x="24.5" y="35.4" width="31" height="1.7" rx="0.6" fill="#000" />
          <rect x="21" y="43.6" width="38" height="1.7" rx="0.6" fill="#000" />
          <rect x="17.5" y="51.8" width="45" height="1.7" rx="0.6" fill="#000" />
          <rect x="14" y="60" width="52" height="1.7" rx="0.6" fill="#000" />
        </mask>
      </defs>

      {/* seal ring */}
      <circle
        cx="40"
        cy="40"
        r="37.2"
        fill="rgba(10,12,16,0.3)"
        stroke={`url(#${ring})`}
        strokeWidth="1.55"
      />
      <circle
        cx="40"
        cy="40"
        r="33"
        fill="none"
        stroke="rgba(247,231,168,0.18)"
        strokeWidth="0.6"
      />

      {/* one silhouette, graded by slits — hierarchy as identity */}
      <path
        d="M40 15.5 L67.5 64.5 H12.5 Z"
        fill={`url(#${gold})`}
        mask={`url(#${slits})`}
      />

      {/* soft left bevel */}
      <path
        d="M40 15.5 L12.5 64.5"
        fill="none"
        stroke="#fff8dc"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}
