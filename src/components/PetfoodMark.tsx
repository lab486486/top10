import markUrl from '../assets/petfood-mark.png'

type MarkProps = {
  className?: string
  /** Hero: slow left–right (Y-axis) turn — not wheel spin */
  spin?: boolean
}

/** PETFOOD mark — provided 3D pyramid image */
export function PetfoodMark({ className, spin = false }: MarkProps) {
  return (
    <img
      className={[
        'petfood-mark',
        className,
        spin ? 'petfood-mark--yaw' : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
      src={markUrl}
      alt=""
      width={80}
      height={80}
      draggable={false}
      decoding="async"
    />
  )
}
