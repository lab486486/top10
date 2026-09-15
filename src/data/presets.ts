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

export const PRICE_SLIDER = {
  min: 5000,
  max: 50000,
  step: 1000,
} as const

/** 예산 안에서 보여줄 추천 개수 */
export const TOP_N = 5

export const DEFAULT_FILTERS: Filters = {
  species: 'dog',
  meatMin: 15,
  kibbleMax: 16,
  vegetables: 'any',
  grainFree: false,
  singleProtein: false,
  priceMinPerKg: 5000,
  priceMaxPerKg: 25000,
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
      meatMin: 15,
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
      meatMin: 25,
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
      meatMin: 15,
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
      meatMin: 20,
      kibbleMax: 12,
      vegetables: 'any',
      grainFree: true,
      singleProtein: true,
      preferSmallKibble: true,
    },
  },
}
