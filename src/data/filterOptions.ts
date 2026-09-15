export type LifeStage = 'puppy' | 'adult' | 'senior' | 'allAges'

export type ProteinId =
  | 'chicken'
  | 'turkey'
  | 'duck'
  | 'pork'
  | 'beef'
  | 'lamb'
  | 'fish'
  | 'grain'
  | 'fruitVeg'
  | 'other'

export type KibbleBand = 'any' | 'small' | 'medium' | 'large'

export const LIFE_STAGE_OPTIONS: { value: LifeStage | 'any'; label: string }[] = [
  { value: 'any', label: '전체' },
  { value: 'puppy', label: '퍼피' },
  { value: 'adult', label: '어덜트' },
  { value: 'senior', label: '시니어' },
  { value: 'allAges', label: '전연령' },
]

export const PROTEIN_OPTIONS: { value: ProteinId; label: string }[] = [
  { value: 'chicken', label: '닭고기' },
  { value: 'turkey', label: '칠면조' },
  { value: 'duck', label: '오리' },
  { value: 'pork', label: '돼지' },
  { value: 'beef', label: '소고기' },
  { value: 'lamb', label: '양고기' },
  { value: 'fish', label: '생선' },
  { value: 'grain', label: '곡물' },
  { value: 'fruitVeg', label: '과일·야채' },
  { value: 'other', label: '기타' },
]

export const KIBBLE_BAND_OPTIONS: { value: KibbleBand; label: string }[] = [
  { value: 'any', label: '전체' },
  { value: 'small', label: '스몰(~8mm)' },
  { value: 'medium', label: '미디움(9~13mm)' },
  { value: 'large', label: '라지(14mm~)' },
]

export function kibbleBandFromMm(mm: number): Exclude<KibbleBand, 'any'> {
  if (mm <= 8) return 'small'
  if (mm <= 13) return 'medium'
  return 'large'
}

export function matchesKibbleBand(mm: number, band: KibbleBand): boolean {
  if (band === 'any') return true
  return kibbleBandFromMm(mm) === band
}
