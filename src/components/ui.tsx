import { useEffect, useId, useState, type ReactNode } from 'react'

type Props = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  formatValue?: (value: number) => string
  onChange: (value: number) => void
}

export function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  formatValue,
  onChange,
}: Props) {
  const id = useId()
  const display = formatValue ? formatValue(value) : `${value}${suffix}`

  return (
    <label className="field" htmlFor={id}>
      <span className="field__top">
        <span>{label}</span>
        <strong>{display}</strong>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}

export function ToggleChip({ checked, onChange, children }: ToggleProps) {
  return (
    <button
      type="button"
      className={`toggle-chip${checked ? ' is-on' : ''}`}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
    >
      {children}
    </button>
  )
}

type SegmentProps<T extends string> = {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentProps<T>) {
  const labelId = useId()
  return (
    <div className="segment" role="group" aria-labelledby={labelId}>
      <div id={labelId} className="segment__label">
        {label}
      </div>
      <div className="segment__options">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={value === opt.value ? 'is-active' : undefined}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
