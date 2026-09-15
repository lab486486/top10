import type { Filters } from './presets'
import { DEFAULT_FILTERS, priceBandFromCenter } from './presets'
import type { Product } from './products'
import type { ScoreMode } from './score'
import type { KibbleBand, ProteinId } from './filterOptions'

/** 체형 → 키블을 자동으로 맞춤 */
export type DogSize = 'small' | 'medium' | 'large'

/** 보호자 걱정거리 */
export type Concern = 'unsure' | 'allergy' | 'safe' | 'value'

/** 단백질 선택 (모르겠음 포함) */
export type ProteinPick = 'unsure' | 'chicken' | 'fish' | 'single'

export type GuideAnswers = {
  priceCenter: number
  size: DogSize
  concern: Concern
  protein: ProteinPick
}

export const SIZE_OPTIONS: {
  value: DogSize
  label: string
  hint: string
}[] = [
  { value: 'small', label: '소형', hint: '알 크기 작게 자동 맞춤' },
  { value: 'medium', label: '중형', hint: '중간 알 크기 위주' },
  { value: 'large', label: '대형', hint: '조금 큰 알도 OK' },
]

export const CONCERN_OPTIONS: {
  value: Concern
  label: string
  hint: string
}[] = [
  { value: 'unsure', label: '잘 모르겠음', hint: '무난한 종합 추천' },
  { value: 'allergy', label: '알러지·피부 예민', hint: '단일단백·그레인프리 우선' },
  { value: 'safe', label: '처음이라 안전하게', hint: '고기 함량·검증된 후보' },
  { value: 'value', label: '가성비 최우선', hint: '같은 예산에서 효율' },
]

export const PROTEIN_PICK_OPTIONS: {
  value: ProteinPick
  label: string
  hint: string
}[] = [
  { value: 'unsure', label: '잘 모르겠음', hint: '우리가 골라드릴게요' },
  { value: 'chicken', label: '닭 괜찮음', hint: '가장 흔하고 무난' },
  { value: 'fish', label: '생선 선호', hint: '닭 대신 어류 위주' },
  { value: 'single', label: '단일단백만', hint: '알러지 의심 시' },
]

const BRAND_ROLES: Record<string, string> = {
  하림: '국내 초보 무난',
  웰츠: '가성비로 무난',
  카르나4: '고급·성분 중시',
  '디 어니스트 키친': '토핑·보조용',
  벨칸도: '장기 브랜드 안정감',
  오리젠: '고단백·생육 지향',
  아카나: '생육 라인 무난',
  인스팅트: '단일단백 후보',
  파미나: '알러지 의심 시 후보',
  카나간: '어류·단일단백 후보',
}

export function brandRoleLabel(product: Product): string {
  if (BRAND_ROLES[product.brand]) return BRAND_ROLES[product.brand]
  if (product.lid || product.singleProtein || product.allergyFriendly) {
    return '알러지 의심 시 후보'
  }
  if (product.pricePerKg <= 13000) return '가성비로 무난'
  if (product.meatPercent >= 60) return '초보가 고르기 안전한 편'
  return '스펙 기준 추천'
}

function sizeToKibble(size: DogSize): {
  kibbleBand: KibbleBand
  kibbleMax: number
  preferSmallKibble: boolean
  sizeHint: string
} {
  if (size === 'small') {
    return {
      // 카탈로그에 ~8mm(스몰 밴드)가 거의 없어, 상한만 걸고 가산으로 유도
      kibbleBand: 'any',
      kibbleMax: 10,
      preferSmallKibble: true,
      sizeHint: '소형견은 작은 알(~10mm 이하)이 씹기 쉬워요',
    }
  }
  if (size === 'medium') {
    return {
      kibbleBand: 'any',
      kibbleMax: 13,
      preferSmallKibble: false,
      sizeHint: '중형견은 9~13mm 알이 무난해요',
    }
  }
  return {
    kibbleBand: 'any',
    kibbleMax: 16,
    preferSmallKibble: false,
    sizeHint: '대형견은 알이 조금 커도 괜찮아요',
  }
}

export function guideToRecommendation(answers: GuideAnswers): {
  filters: Filters
  mode: ScoreMode
  explain: string[]
} {
  const price = priceBandFromCenter(answers.priceCenter)
  const sizePart = sizeToKibble(answers.size)
  const explain: string[] = [
    `예산 kg당 ${answers.priceCenter.toLocaleString('ko-KR')}원대 (±3,000원)`,
    sizePart.sizeHint,
  ]

  let mode: ScoreMode = 'rank'
  const filters: Filters = {
    ...DEFAULT_FILTERS,
    ...price,
    kibbleBand: sizePart.kibbleBand,
    kibbleMax: sizePart.kibbleMax,
    preferSmallKibble: sizePart.preferSmallKibble,
    meatMin: 45,
    brands: [],
    lifeStage: 'any',
    mainProteins: [],
    grainFree: false,
    singleProtein: false,
    hydrolyzed: false,
    glutenFree: false,
    lid: false,
  }

  if (answers.concern === 'allergy') {
    mode = 'allergy'
    // 하드 필터를 모드 전부 덮어쓰면 후보가 비기 쉬워, 핵심만 적용
    filters.grainFree = true
    filters.singleProtein = true
    filters.glutenFree = true
    filters.lid = true
    filters.meatMin = 45
    explain.push('알러지·피부가 걱정되면 단일단백·그레인프리부터')
  } else if (answers.concern === 'value') {
    mode = 'value'
    filters.meatMin = 45
    explain.push('같은 예산에서 가성비 스코어를 더 봤어요')
  } else if (answers.concern === 'safe') {
    mode = 'rank'
    filters.meatMin = 55
    explain.push('처음이면 고기 함량이 넉넉한 후보를 우선해요')
  } else {
    explain.push('브랜드를 몰라도 스코어로 안전한 후보를 골랐어요')
  }

  if (answers.protein === 'chicken') {
    filters.mainProteins = ['chicken'] as ProteinId[]
    explain.push('닭고기는 입문용으로 가장 무난한 편이에요')
  } else if (answers.protein === 'fish') {
    filters.mainProteins = ['fish'] as ProteinId[]
    explain.push('닭 대신 생선 단백질 위주로 좁혔어요')
  } else if (answers.protein === 'single') {
    filters.singleProtein = true
    // lid는 보너스로만 — 둘 다 강제하면 후보가 너무 줄어듦
    explain.push('원인 모를 알러지엔 단일단백부터')
  } else {
    explain.push('단백질을 모르면 스코어·단일단백 여부를 함께 봤어요')
  }

  // 모드 필터가 예산을 덮어쓰지 않도록 가격은 마지막에 고정
  Object.assign(filters, price)

  return { filters, mode, explain }
}

export function buildGuideReasons(
  product: Product,
  answers: GuideAnswers,
): string[] {
  const reasons: string[] = []
  const role = brandRoleLabel(product)
  reasons.push(role)

  if (answers.size === 'small' && product.kibbleSizeMm <= 10) {
    reasons.push(`소형견용 알 ${product.kibbleSizeMm}mm`)
  } else if (answers.size === 'medium' && product.kibbleSizeMm >= 9 && product.kibbleSizeMm <= 13) {
    reasons.push(`중형견에 맞는 알 ${product.kibbleSizeMm}mm`)
  } else if (answers.size === 'large' && product.kibbleSizeMm >= 11) {
    reasons.push(`대형견도 OK한 알 ${product.kibbleSizeMm}mm`)
  }

  if (answers.concern === 'allergy') {
    if (product.singleProtein || product.lid) reasons.push('단일단백으로 원인 추적 쉬움')
    if (product.grainFree) reasons.push('그레인프리')
  } else if (answers.concern === 'value') {
    reasons.push(`kg당 ${product.pricePerKg.toLocaleString('ko-KR')}원`)
  } else if (answers.concern === 'safe' && product.meatPercent >= 55) {
    reasons.push(`고기 ${product.meatPercent}%로 넉넉`)
  }

  if (answers.protein === 'unsure' && product.mainProteins.includes('chicken')) {
    reasons.push('입문용으로 닭고기 처방이 무난')
  } else if (answers.protein === 'chicken' && product.mainProteins.includes('chicken')) {
    reasons.push(`주단백: ${product.proteinSource}`)
  } else if (answers.protein === 'fish' && product.mainProteins.includes('fish')) {
    reasons.push(`주단백: ${product.proteinSource}`)
  } else if (answers.protein === 'single' && product.singleProtein) {
    reasons.push(`단일 ${product.proteinSource}`)
  }

  if (reasons.length < 3 && product.meatPercent >= 50) {
    reasons.push(`고기 ${product.meatPercent}%`)
  }

  return reasons.slice(0, 4)
}
