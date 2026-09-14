import type { Species } from './products'

export type VegPreference = 'any' | 'yes' | 'no'
export type PresetId = 'standard' | 'allergy' | 'value' | 'custom'
export type ConcernId =
  | 'allergy'
  | 'palatability'
  | 'kibble'
  | 'diet'
  | 'value'

export type Filters = {
  species: Species
  meatMin: number
  kibbleMax: number
  vegetables: VegPreference
  grainFree: boolean
  singleProtein: boolean
  priceMaxPerKg: number
  prioritizePalatability: boolean
  prioritizeDiet: boolean
}

export const DEFAULT_FILTERS: Filters = {
  species: 'dog',
  meatMin: 30,
  kibbleMax: 14,
  vegetables: 'any',
  grainFree: false,
  singleProtein: false,
  priceMaxPerKg: 35000,
  prioritizePalatability: false,
  prioritizeDiet: false,
}

export const PRESETS: Record<
  Exclude<PresetId, 'custom'>,
  { label: string; hint: string; filters: Partial<Filters> }
> = {
  standard: {
    label: '표준',
    hint: '중형·보통 가격·범용',
    filters: {
      meatMin: 30,
      kibbleMax: 14,
      vegetables: 'any',
      grainFree: false,
      singleProtein: false,
      priceMaxPerKg: 35000,
      prioritizePalatability: false,
      prioritizeDiet: false,
    },
  },
  allergy: {
    label: '알러지',
    hint: '단일단백·그레인프리',
    filters: {
      meatMin: 35,
      kibbleMax: 12,
      vegetables: 'any',
      grainFree: true,
      singleProtein: true,
      priceMaxPerKg: 35000,
      prioritizePalatability: false,
      prioritizeDiet: false,
    },
  },
  value: {
    label: '가성비',
    hint: 'kg당 부담 줄이기',
    filters: {
      meatMin: 20,
      kibbleMax: 14,
      vegetables: 'any',
      grainFree: false,
      singleProtein: false,
      priceMaxPerKg: 12000,
      prioritizePalatability: false,
      prioritizeDiet: false,
    },
  },
}

export const CONCERNS: {
  id: ConcernId
  label: string
  filters: Partial<Filters>
  preset?: Exclude<PresetId, 'custom'>
}[] = [
  {
    id: 'allergy',
    label: '피부알러지',
    preset: 'allergy',
    filters: {
      grainFree: true,
      singleProtein: true,
      meatMin: 35,
    },
  },
  {
    id: 'palatability',
    label: '잘 안 먹어요',
    filters: {
      prioritizePalatability: true,
      meatMin: 35,
    },
  },
  {
    id: 'kibble',
    label: '알이 커요',
    filters: {
      kibbleMax: 8,
    },
  },
  {
    id: 'diet',
    label: '다이어트',
    filters: {
      prioritizeDiet: true,
      meatMin: 30,
    },
  },
  {
    id: 'value',
    label: '가격 부담',
    preset: 'value',
    filters: {
      priceMaxPerKg: 12000,
      meatMin: 20,
    },
  },
]
