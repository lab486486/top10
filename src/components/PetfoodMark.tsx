import markUrl from '../assets/petfood-mark.png'

type MarkProps = {
  className?: string
  /** Hero: Y-axis turn (left–right), not Z-axis wheel spin */
  spin?: boolean
}

/** Cut-out pyramid mark only (transparent bg) */
export function PetfoodMark({ className, spin = false }: MarkProps) {
  return (
    <span
      className={[
        'petfood-mark-wrap',
        spin ? 'petfood-mark-wrap--yaw' : undefined,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        className="petfood-mark"
        src={markUrl}
        alt=""
        width={80}
        height={80}
        draggable={false}
        decoding="async"
      />
    </span>
  )
}
