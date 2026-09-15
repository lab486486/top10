import type { Species } from './products'
import type { ScoreMode } from './score'

export type VegPreference = 'any' | 'yes' | 'no'

export type Filters = {
  species: Species
  meatMin: number
  kibbleMax: number
  vegetables: VegPreference
  grainFree: boolean
  singleProtein: boolean
  priceMinPerKg: number
  priceMaxPerKg: number
  preferSmallKibble: boolean
}

/** 1kg 기준 가격 지점 슬라이더 */
export const PRICE_SLIDER = {
  min: 5000,
  max: 50000,
  step: 1000,
} as const

/** 선택한 지점 기준 ± 검색 폭 */
export const PRICE_TOLERANCE = 3000

/** 기본 선택 지점 (1만원 → 7천~1만3천 검색) */
export const DEFAULT_PRICE_CENTER = 10000

export const TOP_N = 5

export function priceBandFromCenter(center: number): {
  priceMinPerKg: number
  priceMaxPerKg: number
} {
  return {
    priceMinPerKg: Math.max(0, center - PRICE_TOLERANCE),
    priceMaxPerKg: center + PRICE_TOLERANCE,
  }
}

export const DEFAULT_FILTERS: Filters = {
  species: 'dog',
  meatMin: 60,
  kibbleMax: 16,
  vegetables: 'any',
  grainFree: false,
  singleProtein: false,
  ...priceBandFromCenter(DEFAULT_PRICE_CENTER),
  preferSmallKibble: true,
}

export const MODES: Record<
  ScoreMode,
  { label: string; hint: string; filters: Partial<Filters> }
> = {
  rank: {
    label: '순위별',
    hint: '5지표 종합 스코어',
    filters: {
      meatMin: 60,
      kibbleMax: 16,
      vegetables: 'any',
      grainFree: false,
      singleProtein: false,
      preferSmallKibble: true,
    },
  },
  grade: {
    label: '등급별',
    hint: '고기·단백 중심 밴드',
    filters: {
      meatMin: 60,
      kibbleMax: 16,
      vegetables: 'any',
      grainFree: false,
      singleProtein: false,
      preferSmallKibble: true,
    },
  },
  value: {
    label: '가성비',
    hint: 'kg당 가격 가중',
    filters: {
      meatMin: 50,
      kibbleMax: 16,
      vegetables: 'any',
      grainFree: false,
      singleProtein: false,
      preferSmallKibble: true,
    },
  },
  allergy: {
    label: '알러지',
    hint: '단일단백·그레인프리',
    filters: {
      meatMin: 50,
      kibbleMax: 12,
      vegetables: 'any',
      grainFree: true,
      singleProtein: true,
      preferSmallKibble: true,
    },
  },
}
