import markUrl from '../assets/petfood-mark.png'

type MarkProps = {
  className?: string
}

/**
 * PETFOOD brand mark — corner-on 3D pyramid (diamond silhouette).
 * Uses the rendered mark asset so left/right face shading reads as volume,
 * not a flat 2D triangle.
 */
export function PetfoodMark({ className }: MarkProps) {
  return (
    <img
      className={className}
      src={markUrl}
      alt=""
      width={80}
      height={80}
      draggable={false}
      decoding="async"
    />
  )
}
